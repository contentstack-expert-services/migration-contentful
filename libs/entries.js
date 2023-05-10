"use strict";
/**
 * External module Dependencies.
 */
var mkdirp = require("mkdirp"),
  path = require("path"),
  fs = require("fs"),
  when = require("when"),
  jsonpath = require("jsonpath");

const cliProgress = require("cli-progress");
const colors = require("ansi-colors");
const chalk = require("chalk");
/**
 * Internal module Dependencies .
 */

const _ = require("lodash");
var helper = require("../utils/helper");
let jsonRTE = require("./jsonRTE");

var entryFolderPath = path.resolve(config.data, config.entryfolder);

if (!fs.existsSync(entryFolderPath)) {
  mkdirp.sync(entryFolderPath);
}

function ExtractEntries() {
  if (!fs.existsSync(path.join(config.data, config.json_filename))) {
    fs.copyFile(
      config.contentful_filename,
      path.join(process.cwd(), config.data, config.json_filename),
      (err) => {
        if (err) throw console.log(err.message);
      }
    );
  }
}

ExtractEntries.prototype = {
  customBar: null,
  initalizeLoader: function () {
    this.customBar = new cliProgress.SingleBar({
      format:
        "{title}|" +
        colors.cyan("{bar}") +
        "|  {percentage}%  || {value}/{total} completed",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
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
    return when.promise(function (resolve, reject) {
      self.customBar.start(entry.length, 0, {
        title: "Migrating Entries      ",
      });
      let assetId = helper.readFile(
        path.join(process.cwd(), "contentfulMigrationData/assets/assets.json")
      );
      let entryId = helper.readFile(
        path.join(
          process.cwd(),
          "contentfulMigrationData/references/reference.json"
        )
      );

      let localeId = helper.readFile(
        path.join(
          process.cwd(),
          "contentfulMigrationData/language/language.json"
        )
      );

      entry.map((entryData) => {
        Object.values(localeId).forEach(async (i) => {
          //check if file exist or not
          if (
            !fs.existsSync(
              path.join(
                entryFolderPath,
                entryData.sys.contentType.sys.id
                  .replace(/([A-Z])/g, "_$1")
                  .toLowerCase()
              )
            )
          ) {
            // create folder with the content type name
            mkdirp.sync(
              path.join(
                entryFolderPath,
                entryData.sys.contentType.sys.id
                  .replace(/([A-Z])/g, "_$1")
                  .toLowerCase()
              )
            );
            // create JSON file in the created folders with locale name
            helper.writeFile(
              path.join(
                entryFolderPath,
                entryData.sys.contentType.sys.id
                  .replace(/([A-Z])/g, "_$1")
                  .toLowerCase(),
                `${i.code}.json`
              )
            );
          }
          // to check if the id contain this key words
          var idArray = [
            "uid",
            "api_key",
            "created_at",
            "deleted_at",
            "updated_at",
            "tags_array",
            "klass_id",
            "applikation_id",
            "id",
            "_id",
            "ACL",
            "SYS_ACL",
            "DEFAULT_ACL",
            "app_user_object_uid",
            "built_io_upload",
            "__loc",
            "tags",
            "_owner",
            "_version",
            "toJSON",
            "save",
            "update",
            "domain",
            "share_account",
            "shard_app",
            "shard_random",
            "hook",
            "__indexes",
            "__meta",
            "created_by",
            "updated_by",
            "inbuilt_class",
            "tenant_id",
            "isSystemUser",
            "isApplicationUser",
            "isNew",
            "_shouldLean",
            "_shouldFilter",
            "options",
            "_version",
            "__v",
            "locale",
            "publish_details",
          ];

          // to convert the contentful entries to contentstack support entries
          var result = entry.reduce(
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
              let replaceId, newId;
              Object.entries(fields).forEach(([key, value]) => {
                Object.entries(value).forEach(([lang, lang_value]) => {
                  entry_data[name][lang] ??= {};
                  entry_data[name][lang][id] ??= {};
                  // to replace the contentstack restricted uid
                  if (idArray.includes(key)) {
                    replaceId = key.replace(key, `${prefix}_${key}`);
                    newId = replaceId.replace(/[^a-zA-Z0-9]+/g, "_");
                  } else {
                    newId = key;
                  }
                  if (typeof lang_value !== "object") {
                    if (typeof lang_value === "number") {
                      entry_data[name][lang][id][newId] = lang_value;
                    } else {
                      const myJSON = JSON.stringify(lang_value);
                      const withoutEmptyBrac = myJSON
                        .replace("__,", "**")
                        .replace("##", "#")
                        .replace("###", "#");
                      const myObj = JSON.parse(withoutEmptyBrac);

                      entry_data[name][lang][id][newId] = myObj;
                    }
                  } else {
                    // to set the values for location lat & lon
                    if (lang_value.lat) {
                      entry_data[name][lang][id][newId] = lang_value;
                    } else {
                      // to check if the values contain the entry fields or not
                      if (lang_value.sys) {
                        if (lang_value.sys.linkType === "Entry") {
                          // to check if the id present in entry field or not for single entry
                          if (lang_value.sys.id in entryId) {
                            entry_data[name][lang][id][newId] = [
                              entryId[lang_value.sys.id],
                            ];
                          }
                        }
                        // to check if the id present in asset field or not for single asset
                        if (lang_value.sys.linkType === "Asset") {
                          if (lang_value.sys.id in assetId) {
                            entry_data[name][lang][id][newId] =
                              assetId[lang_value.sys.id];
                          }
                        }
                      } else {
                        for (const d of Object.values(lang_value)) {
                          // to check the instance is object or not
                          if (d instanceof Object) {
                            const myJSON = JSON.stringify(lang_value);

                            if (Array.isArray(lang_value)) {
                              // remove the values from empty curly braces from the delete entries and asset
                              const withoutEmptyBrac = myJSON
                                .replace(/{},/g, "")
                                .replace(/,{}/g, "")
                                .replace(/,{},/g, "");
                              const myObj = JSON.parse(withoutEmptyBrac);

                              entry_data[name][lang][id][newId] = myObj;
                            } else {
                              // for the json object values
                              entry_data[name][lang][id][newId] = lang_value;
                            }
                          }
                        }
                        // for multiple entries and assets
                        if (Array.isArray(lang_value)) {
                          lang_value.forEach((sys) => {
                            if (typeof sys !== "object") {
                              entry_data[name][lang][id][newId] = lang_value;
                            }
                          });
                          let ids = jsonpath.query(lang_value, "$..id");
                          ids.forEach((id, i) => {
                            if (id in entryId) {
                              lang_value.splice(i, 1, entryId[id]);
                            } else {
                              for (const sys of lang_value) {
                                if (sys.sys !== undefined) {
                                  if (sys.sys.linkType === "Entry") {
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
                                  if (sys.sys.linkType === "Asset") {
                                    delete sys.sys;
                                  }
                                }
                              }
                            }
                          });
                        } else {
                          // for the RTE values convert
                          if (lang_value.data) {
                            entry_data[name][lang][id][newId] = jsonRTE(
                              lang_value,
                              lang.toLowerCase()
                            );
                          } else {
                            entry_data[name][lang][id][newId] = lang_value;
                          }
                        }
                      }
                    }
                  }
                });
              });

              return entry_data;
            },
            {}
          );

          for (const [key, values] of Object.entries(result)) {
            const dispalyField = helper.readFile(
              path.join(
                config.data,
                `${config.contentful.displayEntries.dirname}/${config.contentful.displayEntries.filename}`
              )
            );
            let pathName = getDisplayName(key, dispalyField);
            for (const [localeKey, localeValues] of Object.entries(values)) {
              const newData = {};
              for (const lowerKey of Object.keys(localeValues)) {
                if (localeValues[lowerKey][pathName] !== undefined) {
                  let title = localeValues[lowerKey][pathName];
                  newData[lowerKey] = {
                    title: title,
                    uid: lowerKey,
                    url: `/${key.toLowerCase()}/${title
                      .replace(/[^a-zA-Z0-9]+/g, "-")
                      .toLowerCase()}`,
                    locale: localeKey.toLowerCase(),
                  };
                  for (const innerKey of Object.keys(localeValues[lowerKey])) {
                    newData[lowerKey][innerKey.toLowerCase()] =
                      localeValues[lowerKey][innerKey];
                  }
                } else {
                  newData[lowerKey] = {
                    title: "",
                    uid: lowerKey,
                    url: `/${key.toLowerCase()}/`,
                    locale: localeKey.toLowerCase(),
                  };
                  for (const innerKey of Object.keys(localeValues[lowerKey])) {
                    newData[lowerKey][innerKey.toLowerCase()] =
                      localeValues[lowerKey][innerKey];
                  }
                }
              }
              if (i.code === localeKey.toLowerCase()) {
                // Write data
                await helper.writeFile(
                  path.join(
                    entryFolderPath,
                    key.replace(/([A-Z])/g, "_$1").toLowerCase(),
                    `${i.code}.json`
                  ),
                  JSON.stringify(newData, null, 4)
                );
              }
            }
          }
        });

        self.customBar.increment();
      });

      // console.log(chalk.green(`${entry.length} Entries exported successfully`));
      resolve(entry);
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
  let path = "";
  Object.entries(dispalyField).forEach(([item, value]) => {
    if (
      item.replace(/[^a-zA-Z0-9]+/g, "").toLocaleLowerCase() ===
      key.toLowerCase()
    ) {
      path = value.displayField;
    }
  });
  return path;
}
