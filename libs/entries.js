'use strict';
/**
 * External module Dependencies.
 */
var mkdirp = require('mkdirp'),
  path = require('path'),
  fs = require('fs'),
  fileSystem = require('fs').promises,
  when = require('when'),
  jsonpath = require('jsonpath');

const config = require('../config');

const cliProgress = require('cli-progress');
const colors = require('ansi-colors');
const chalk = require('chalk');
/**
 * Internal module Dependencies .
 */

var helper = require('../utils/helper');
let jsonRTE = require('./jsonRTE');

// to check if the id contain this key words
var idArray = require('../utils/restrcitedKeyWords.json');

var entryFolderPath = path.resolve(config.data, config.entryfolder);

if (!fs.existsSync(entryFolderPath)) {
  mkdirp.sync(entryFolderPath);
}

function ExtractEntries() {}

const createFilePath = (entryData, localeId) => {
  const contentType = entryData.sys.contentType.sys.id
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase();
  const filePath = path.join(
    entryFolderPath,
    contentType,
    `${localeId.code}.json`
  );
  return filePath;
};

const processField = (lang_value, entryId, assetId, lang) => {
  // Handle primitive types directly
  if (typeof lang_value !== 'object' || lang_value === null) {
    return lang_value;
  }

  // Handle location data
  if (lang_value.lat && lang_value.lon) {
    return lang_value;
  }

  // Handle system links (Entry or Asset)
  if (lang_value.sys && lang_value.sys.type === 'Link') {
    const { linkType, id } = lang_value.sys;

    // Handle Entry references - return as array with one object
    if (linkType === 'Entry') {
      if (id in entryId) {
        return [entryId[id]];
      }
      return [
        {
          uid: id.toLowerCase(),
          _content_type_uid: entryId[id]?._content_type_uid || 'topic_person',
        },
      ];
    }

    // Handle Asset references - return asset object
    if (linkType === 'Asset') {
      if (id in assetId) {
        return assetId[id];
      }
    }
    return undefined;
  }

  // Handle arrays
  if (Array.isArray(lang_value)) {
    // Handle primitive arrays directly
    if (lang_value.every((item) => typeof item !== 'object')) {
      return lang_value;
    }

    // Process array of references
    const processedArray = lang_value.reduce((acc, item) => {
      if (item?.sys?.id) {
        const { linkType, id } = item.sys;
        if (linkType === 'Entry' && id in entryId) {
          acc.push(entryId[id]);
        } else if (linkType === 'Asset' && id in assetId) {
          acc.push(assetId[id]);
        }
      } else if (item !== null && typeof item === 'object') {
        const processed = processField(item, entryId, assetId, lang);
        if (processed !== undefined) {
          acc.push(processed);
        }
      } else {
        acc.push(item);
      }
      return acc;
    }, []);

    return processedArray.length > 0 ? processedArray : undefined;
  }

  // Handle RTE data
  if (lang_value.data) {
    return jsonRTE(lang_value, lang.toLowerCase());
  }

  // Handle nested objects
  const processedObj = {};
  let hasValues = false;

  for (const [key, value] of Object.entries(lang_value)) {
    const processed = processField(value, entryId, assetId, lang);
    if (processed !== undefined) {
      processedObj[key] = processed;
      hasValues = true;
    }
  }

  return hasValues ? processedObj : undefined;
};

// Helper function to handle duplicate titles
function handleDuplicateTitles(titlesInLocale, title, lowerKey) {
  let uniqueTitle = title;
  let counter = 1;

  while (titlesInLocale.has(uniqueTitle)) {
    uniqueTitle = `${title} ${counter}`;
    counter++;
  }

  titlesInLocale.add(uniqueTitle);
  return uniqueTitle;
}

ExtractEntries.prototype = {
  customBar: null,
  initalizeLoader() {
    this.customBar = new cliProgress.SingleBar({
      format:
        '{title}|' +
        colors.cyan('{bar}') +
        '|  {percentage}%  || {value}/{total} completed',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    });
  },
  destroyLoader() {
    if (this.customBar) {
      this.customBar.stop();
    }
  },
  saveEntry(entry, prefix) {
    var self = this;
    return when.promise(async function (resolve, reject) {
      try {
        // Add debug logging

        self.customBar.start(entry.length, 0, {
          title: 'Migrating Entries      ',
        });

        // Pre-load all required data at once with error handling
        let assetId, entryId, localeId, environmentsId, dispalyField;

        try {
          assetId = helper.readFile(
            path.join(process.cwd(), config.data, 'assets', 'assets.json')
          );
        } catch (error) {
          console.log('Assets file not found, using empty object');
          assetId = {};
        }

        try {
          entryId = helper.readFile(
            path.join(
              process.cwd(),
              config.data,
              'references',
              'reference.json'
            )
          );
        } catch (error) {
          console.log('References file not found, using empty object');
          entryId = {};
        }

        try {
          localeId = helper.readFile(
            path.join(process.cwd(), config.data, 'locales', 'language.json')
          );
        } catch (error) {
          console.log('Locales file not found, using empty object');
          localeId = {};
        }

        try {
          environmentsId = helper.readFile(
            path.join(
              process.cwd(),
              config.data,
              'environments',
              'environments.json'
            )
          );
        } catch (error) {
          console.log('Environments file not found, using empty object');
          environmentsId = {};
        }

        try {
          dispalyField = helper.readFile(
            path.join(
              config.data,
              `${config.contentful.displayEntries.dirname}/${config.contentful.displayEntries.filename}`
            )
          );
        } catch (error) {
          console.log('Display entries file not found, using empty object');
          dispalyField = {};
        }

        const results = {};

        for (const entryData of entry) {
          try {
            if (!entryData?.sys?.contentType?.sys?.id) {
              continue;
            }

            const {
              sys: {
                id,
                contentType: {
                  sys: { id: name },
                },
              },
              fields,
            } = entryData;

            if (!results[name]) {
              results[name] = {};
            }

            // Process fields with validation
            if (fields && typeof fields === 'object') {
              Object.entries(fields).forEach(([key, value]) => {
                if (!value) return;

                const newId = idArray.includes(key)
                  ? `${prefix}_${key}`.replace(/[^a-zA-Z0-9]+/g, '_')
                  : key === 'title' &&
                    typeof Object.values(value)[0] === 'object'
                  ? `${prefix}_${key}`.replace(/[^a-zA-Z0-9]+/g, '_')
                  : key;

                Object.entries(value).forEach(([lang, lang_value]) => {
                  if (!results[name][lang]) results[name][lang] = {};
                  if (!results[name][lang][id]) results[name][lang][id] = {};

                  const processedValue = processField(
                    lang_value,
                    entryId,
                    assetId,
                    lang
                  );
                  if (processedValue !== undefined) {
                    results[name][lang][id][newId] = processedValue;
                  }
                });
              });
            }

            self.customBar.increment(1);
          } catch (entryError) {
            console.error('Error processing entry:', entryError);
            continue;
          }
        }

        // Write files with additional error handling
        for (const [key, values] of Object.entries(results)) {
          try {
            const pathName =
              getDisplayName(key, dispalyField, localeId) || 'title';

            for (const [localeKey, localeValues] of Object.entries(values)) {
              const newData = {};
              const titlesInLocale = new Set(); // Track titles in this locale

              const publish_details = Object.values(environmentsId)
                .filter(
                  (env) => env?.name === entry[0]?.sys?.environment?.sys?.id
                )
                .map((environment) => ({
                  environment: environment?.uid,
                  version: 1,
                  locale: localeKey.toLowerCase(),
                }));

              // In the saveEntry function, fix the newData object creation:
              Object.entries(localeValues).forEach(([lowerKey, values]) => {
                let title = values[pathName] || '';

                // Handle duplicate titles
                const uniqueTitle = handleDuplicateTitles(
                  titlesInLocale,
                  title,
                  lowerKey
                );

                const urlTitle = (values[pathName] || '')
                  .replace(/[^a-zA-Z0-9]+/g, '-')
                  .toLowerCase();

                newData[lowerKey] = {
                  title:
                    uniqueTitle.trim() === ''
                      ? urlTitle || lowerKey
                      : uniqueTitle,
                  uid: lowerKey,
                  url: `/${key.toLowerCase()}/${urlTitle}`, // URL remains based on original title
                  locale: localeKey.toLowerCase(),
                  publish_details,
                  ...Object.fromEntries(
                    Object.entries(values).map(([innerKey, value]) => [
                      innerKey.replace(
                        /([A-Z])/g,
                        (match) => `_${match.toLowerCase()}`
                      ),
                      value,
                    ])
                  ),
                };
              });

              // In the saveEntry function, add this line before using filePath:
              const filePath = path.join(
                entryFolderPath,
                key.replace(/([A-Z])/g, '_$1').toLowerCase(),
                `${localeKey.toLowerCase()}.json`
              );

              await mkdirp(path.dirname(filePath));
              await fileSystem.writeFile(
                filePath,
                JSON.stringify(newData, null, 4)
              );
            }
          } catch (writeError) {
            console.error(
              `Error writing files for content type ${key}:`,
              writeError
            );
          }
        }

        resolve(results);
      } catch (error) {
        console.error('Error in saveEntry:', error);
        reject(error);
      }
    });
  },

  getAllEntries(prefix) {
    var self = this;
    return when.promise(async function (resolve, reject) {
      try {
        // Read JSON file and store in alldata
        var alldata = helper.readFile(config.contentful_filename);

        // Fetch all entries from the JSON output
        var entries = alldata?.entries;
        if (entries && entries.length > 0) {
          // Run to save and extract the entries
          await self.saveEntry(entries, prefix);
          resolve();
        } else {
          console.log(
            chalk.red(entries ? 'No entries found' : 'Invalid entries data')
          );
          resolve();
        }
      } catch (error) {
        console.error('Error in getAllEntries:', error);
        reject(error);
      }
    });
  },

  start: function (prefix) {
    var self = this;
    this.initalizeLoader();
    return when.promise(function (resolve, reject) {
      self
        .getAllEntries(prefix)
        .then(function () {
          resolve();
        })
        .catch(function () {
          reject();
        })
        .finally(function () {
          self.destroyLoader();
        });
    });
  },
};

module.exports = ExtractEntries;

// this function speially made to match title
function getDisplayName(key, dispalyField, localeId) {
  let path = '';
  try {
    if (dispalyField && typeof dispalyField === 'object') {
      Object.entries(dispalyField).forEach(([item, value]) => {
        if (
          value &&
          value.sys &&
          value.sys.id === key &&
          value.fields &&
          value.fields.title
        ) {
          // Get available locales from the locale data or fallback to common ones
          const availableLocales =
            localeId && typeof localeId === 'object'
              ? Object.keys(localeId)
              : ['en-US', 'en', 'en-us'];

          // Try to find title in any available locale
          for (const locale of availableLocales) {
            if (value.fields.title[locale]) {
              path = value.fields.title[locale]
                .replace(/[^a-zA-Z0-9]+/g, '-')
                .toLowerCase();
              break;
            }
          }

          // If no locale-specific title found, try to get the first available title
          if (!path && value.fields.title) {
            const titleKeys = Object.keys(value.fields.title);
            if (titleKeys.length > 0) {
              path = value.fields.title[titleKeys[0]]
                .replace(/[^a-zA-Z0-9]+/g, '-')
                .toLowerCase();
            }
          }
        }
      });
    }
  } catch (error) {
    console.error(`Error in getDisplayName for key ${key}:`, error.message);
  }
  return path;
}
