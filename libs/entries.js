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
  if (typeof lang_value !== 'object') {
    if (typeof lang_value === 'number') {
      return lang_value;
    } else {
      const myJSON = JSON.stringify(lang_value);
      const withoutEmptyBrac = myJSON
        .replace('__,', '**')
        .replace('##', '#')
        .replace('###', '#');
      const myObj = JSON.parse(withoutEmptyBrac);

      return myObj;
    }
  } else {
    // to set the values for location lat & lon
    if (lang_value.lat) {
      return lang_value;
    } else {
      // to check if the values contain the entry fields or not
      if (lang_value.sys) {
        if (lang_value.sys.linkType === 'Entry') {
          // to check if the id present in entry field or not for single entry
          if (lang_value.sys.id in entryId) {
            return [entryId[lang_value.sys.id]];
          }
        }
        // to check if the id present in asset field or not for single asset
        if (lang_value.sys.linkType === 'Asset') {
          if (lang_value.sys.id in assetId) {
            return assetId[lang_value.sys.id];
          }
        }
      } else {
        for (const d of Object.values(lang_value)) {
          // to check the instance is object or not
          if (d instanceof Object) {
            const myJSON = JSON.stringify(lang_value);
            if (Array.isArray(lang_value)) {
              lang_value.forEach((sys) => {
                if (typeof sys !== 'object') {
                  return lang_value;
                }
              });
              let ids = jsonpath.query(lang_value, '$..id');
              ids.forEach((id, i) => {
                if (id in entryId) {
                  lang_value.splice(i, 1, entryId[id]);
                } else {
                  for (const sys of lang_value) {
                    if (sys.sys !== undefined) {
                      if (sys.sys.linkType === 'Entry') {
                        delete sys.sys;
                      }
                    }
                  }
                }
                if (id in assetId) {
                  lang_value.splice(i, 1, assetId[id]);
                } else {
                  for (const sys of lang_value) {
                    if (sys.sys !== undefined) {
                      if (sys.sys.linkType === 'Asset') {
                        delete sys.sys;
                      }
                    }
                  }
                }
              });

              // remove the values from empty curly braces from the delete entries and asset
              const withoutEmptyBrac = myJSON
                .replace(/{},/g, '')
                .replace(/,{}/g, '')
                .replace(/,{},/g, '')
                .replace(/{}/g, '');
              const myObj = JSON.parse(withoutEmptyBrac);
              if (myObj.length > 0) {
                return myObj;
              } else {
                return undefined; // Or handle the delete case as needed
              }
            } else {
              // for the RTE values convert
              if (lang_value.data) {
                return jsonRTE(lang_value, lang.toLowerCase());
              } else {
                return lang_value;
              }
            }
          } else {
            // this is added to return the checkbox values
            if (Array.isArray(lang_value)) {
              return lang_value;
            }
          }
        }
      }
    }
  }
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
        self.customBar.start(entry.length, 0, {
          title: 'Migrating Entries      ',
        });
        let assetId = helper.readFile(
          path.join(process.cwd(), config.data, 'assets', 'assets.json')
        );

        let entryId = helper.readFile(
          path.join(process.cwd(), config.data, 'references', 'reference.json')
        );
        let localeId = helper.readFile(
          path.join(process.cwd(), config.data, 'locales', 'language.json')
        );

        let environmentsId = helper.readFile(
          path.join(
            process.cwd(),
            config.data,
            'environments',
            'environments.json'
          )
        );

        let result;
        // Create an array to hold all the promises for file writing
        const writePromises = [];

        entry.map((entryData) => {
          Object.values(localeId).forEach(async (i) => {
            const filePath = createFilePath(entryData, i);
            if (!fs.existsSync(filePath)) {
              // create folder with the content type name
              mkdirp.sync(path.dirname(filePath));
              // create JSON file in the created folders with locale name
              helper.writeFile(filePath);
            }

            // Process the fields
            result = entry.reduce(
              (
                entry_data,
                {
                  sys: {
                    id,
                    contentType: {
                      sys: { id: name },
                    },
                  },
                  fields,
                }
              ) => {
                entry_data[name] ??= {};
                let newId;
                Object.entries(fields).forEach(([key, value]) => {
                  Object.entries(value).forEach(([lang, lang_value]) => {
                    entry_data[name][lang] ??= {};
                    entry_data[name][lang][id] ??= {};
                    // to replace the contentstack restricted key words with user prefix
                    if (idArray.includes(key)) {
                      newId = `${prefix}_${key}`.replace(/[^a-zA-Z0-9]+/g, '_');
                    } else {
                      newId = key;
                    }
                    entry_data[name][lang][id][newId] = processField(
                      lang_value,
                      entryId,
                      assetId,
                      lang
                    );
                  });
                });
                return entry_data;
              },
              {}
            );

            // Write data
          });

          self.customBar.increment();
        });

        const dispalyField = helper.readFile(
          path.join(
            config.data,
            `${config.contentful.displayEntries.dirname}/${config.contentful.displayEntries.filename}`
          )
        );

        for (const [key, values] of Object.entries(result)) {
          const pathName = getDisplayName(key, dispalyField);
          for (const [localeKey, localeValues] of Object.entries(values)) {
            const newData = {};
            const publish_details = Object.values(environmentsId)
              .filter(
                (environment) =>
                  environment?.name === entry[0]?.sys?.environment?.sys?.id
              )
              .map((environment) => ({
                environment: environment?.uid,
                version: 1,
                locale: localeKey.toLowerCase(),
              }));

            for (const lowerKey of Object.keys(localeValues)) {
              const title = localeValues[lowerKey][pathName] || '';
              const urlTitle = title
                .replace(/[^a-zA-Z0-9]+/g, '-')
                .toLowerCase();

              newData[lowerKey] = {
                title: title.trim() === '' ? urlTitle || lowerKey : title,
                uid: lowerKey,
                url: `/${key.toLowerCase()}/${urlTitle}`,
                locale: localeKey.toLowerCase(),
                publish_details: publish_details,
              };

              Object.entries(localeValues[lowerKey]).forEach(
                ([innerKey, value]) => {
                  const formattedKey = innerKey.replace(
                    /([A-Z])/g,
                    (match) => `_${match.toLowerCase()}`
                  );
                  newData[lowerKey][formattedKey] = value;
                }
              );
            }

            const filePath = path.join(
              entryFolderPath,
              key.replace(/([A-Z])/g, '_$1').toLowerCase(),
              `${localeKey.toLowerCase()}.json`
            );
            // Push the asynchronous file writing operation to the array
            writePromises.push(
              fileSystem.writeFile(filePath, JSON.stringify(newData, null, 4))
            );
          }
        }

        // Wait for all file writing operations to complete
        await Promise.all(writePromises);

        resolve(result);
      } catch (error) {
        console.log(error);
        reject();
      }
    });
  },

  getAllEntries: function (prefix) {
    var self = this;
    return when.promise(function (resolve, reject) {
      //for reading json file and store in alldata
      var alldata = helper.readFile(config.contentful_filename);

      // to fetch all the entries from the json output
      var entries = alldata.entries;
      if (entries) {
        if (entries.length > 0) {
          if (!filePath) {
            //run to save and excrete the entries
            self.saveEntry(entries, prefix);
            resolve();
          }
        } else {
          console.log(chalk.red(`no entries found`));
          resolve();
        }
      } else {
        console.log(chalk.red(`no entries found`));
        resolve();
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
