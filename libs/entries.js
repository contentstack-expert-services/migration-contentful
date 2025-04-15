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
  // Handle non-object values
  if (typeof lang_value !== 'object' || lang_value === null) {
    return lang_value;
  }

  // Handle location fields
  if (lang_value.lat && lang_value.lon) {
    return lang_value;
  }

  // Handle single references (Entry or Asset)
  if (lang_value.sys && lang_value.sys.type === 'Link') {
    const id = lang_value.sys.id;

    // Handle Entry references - return as array with one object
    if (lang_value.sys.linkType === 'Entry') {
      // Debug logging
      console.log(`Processing single entry reference: ${id}`);
      console.log(`Entry exists in entryId: ${id in entryId}`);

      return [
        {
          uid: id,
          _content_type_uid: entryId[id]?._content_type_uid || 'topic_person',
        },
      ];
    }

    // Handle Asset references - return asset object
    if (lang_value.sys.linkType === 'Asset') {
      // Debug logging
      console.log(`Processing single asset reference: ${id}`);
      console.log(`Asset exists in assetId: ${id in assetId}`);

      if (id in assetId) {
        return assetId[id];
      }
    }
  }

  // Handle arrays (for multiple references)
  if (Array.isArray(lang_value)) {
    // Debug logging
    console.log(`Processing array with ${lang_value.length} items`);

    // Transform each item in the array
    const result = lang_value
      .map((item) => {
        if (item?.sys?.type === 'Link') {
          const id = item.sys.id;

          if (item.sys.linkType === 'Entry') {
            console.log(`Processing array entry reference: ${id}`);
            return {
              uid: id,
              _content_type_uid:
                entryId[id]?._content_type_uid || 'topic_person',
            };
          }

          if (item.sys.linkType === 'Asset' && id in assetId) {
            console.log(`Processing array asset reference: ${id}`);
            return assetId[id];
          }
        }

        // If not a reference, process recursively
        return processField(item, entryId, assetId, lang);
      })
      .filter(Boolean); // Remove any null/undefined entries

    return result.length > 0 ? result : undefined;
  }

  // Handle RTE fields
  if (lang_value.data) {
    return jsonRTE(lang_value, lang.toLowerCase());
  }

  // Handle other objects by recursively processing each property
  const result = {};
  for (const [key, value] of Object.entries(lang_value)) {
    const processed = processField(value, entryId, assetId, lang);
    if (processed !== undefined) {
      result[key] = processed;
    }
  }

  return Object.keys(result).length > 0 ? result : lang_value;
};

ExtractEntries.prototype = {
  customBar: null,
  initalizeLoader: function () {
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
  destroyLoader: function () {
    if (this.customBar) {
      this.customBar.stop();
    }
  },
  saveEntry: function (entry, prefix) {
    var self = this;
    return when.promise(async function (resolve, reject) {
      try {
        // Add debug logging

        self.customBar.start(entry.length, 0, {
          title: 'Migrating Entries      ',
        });

        // Pre-load all required data at once
        const [assetId, entryId, environmentsId, dispalyField] =
          await Promise.all([
            helper.readFile(
              path.join(process.cwd(), config.data, 'assets', 'assets.json')
            ),
            helper.readFile(
              path.join(
                process.cwd(),
                config.data,
                'references',
                'reference.json'
              )
            ),
            helper.readFile(
              path.join(
                process.cwd(),
                config.data,
                'environments',
                'environments.json'
              )
            ),
            helper.readFile(
              path.join(
                config.data,
                `${config.contentful.displayEntries.dirname}/${config.contentful.displayEntries.filename}`
              )
            ),
          ]);

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
            const pathName = getDisplayName(key, dispalyField);

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
        console.error('Fatal error in saveEntry:', error);
        reject(error);
      }
    });
  },

  getAllEntries: function (prefix) {
    var self = this;
    return when.promise(function (resolve, reject) {
      try {
        //for reading json file and store in alldata

        var alldata = helper.readFile(config.contentful_filename);

        // to fetch all the entries from the json output
        var entries = alldata?.entries;
        if (entries?.length > 0) {
          //run to save and execute the entries
          self
            .saveEntry(entries, prefix)
            .then(() => resolve())
            .catch(reject);
        } else {
          console.log(chalk.red(`no entries found`));
          resolve();
        }
      } catch (error) {
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

// this function speically made to match title
function getDisplayName(key, dispalyField) {
  let path = '';
  Object.entries(dispalyField).forEach(([item, value]) => {
    if (
      item.replace(/[^a-zA-Z0-9]+/g, '').toLocaleLowerCase() ===
      key.toLowerCase()
    ) {
      path = value.displayField;
    }
  });
  return path;
}

// Update the handleDuplicateTitles function
function handleDuplicateTitles(titles, currentTitle, uid) {
  if (!currentTitle) return currentTitle;

  const titleKey = currentTitle.toLowerCase().trim();

  if (titles.has(titleKey)) {
    // Add uid suffix to create unique title
    const uniqueTitle = `${currentTitle} - ${uid}`;
    titles.add(titleKey); // Add to set to track
    return uniqueTitle;
  }

  titles.add(titleKey);
  return currentTitle;
}
