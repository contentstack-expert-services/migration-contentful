"use strict";
/**
 * External module Dependencies.
 */
var mkdirp = require("mkdirp"),
  path = require("path"),
  fs = require("fs"),
  request = require("request"),
  guard = require("when/guard"),
  parallel = require("when/parallel"),
  when = require("when");

const cliProgress = require("cli-progress");
const colors = require("ansi-colors");

const _ = require("lodash");
/**
 * Internal module Dependencies .
 */

var helper = require("../utils/helper");

var assetConfig = config.modules.asset,
  assetFolderPath = path.resolve(config.data, assetConfig.dirName),
  assetMasterFolderPath = path.resolve(config.data, "master"),
  failedJSON =
    helper.readFile(path.join(assetMasterFolderPath, "cs_failed.json")) || {};

if (!fs.existsSync(assetFolderPath)) {
  mkdirp.sync(assetFolderPath);
  helper.writeFile(path.join(assetFolderPath, assetConfig.fileName));
  mkdirp.sync(assetMasterFolderPath);
  helper.writeFile(path.join(assetMasterFolderPath, assetConfig.fileName));
  helper.writeFile(path.join(assetMasterFolderPath, assetConfig.masterfile));
  if (!fs.existsSync(path.join(config.data, config.json_filename))) {
    helper.writeFile(path.join(config.data, config.json_filename));
  }
} else {
  if (!fs.existsSync(path.join(assetFolderPath, assetConfig.fileName)))
    helper.writeFile(path.join(assetFolderPath, assetConfig.fileName));
  if (!fs.existsSync(assetMasterFolderPath)) {
    mkdirp.sync(assetMasterFolderPath);
    helper.writeFile(path.join(assetMasterFolderPath, assetConfig.fileName));
    helper.writeFile(path.join(assetMasterFolderPath, assetConfig.masterfile));
  }
}

//Reading a File
var assetData = helper.readFile(
  path.join(assetFolderPath, assetConfig.fileName)
);
var assetMapping = helper.readFile(
  path.join(assetMasterFolderPath, assetConfig.fileName)
);
var assetURLMapping = helper.readFile(
  path.join(assetMasterFolderPath, assetConfig.masterfile)
);

function ExtractAssets() {
  fs.copyFile(
    config.contentful_filename,
    path.join(process.cwd(), config.data, config.json_filename),
    (err) => {
      if (err) throw console.log(err.message);
    }
  );
}
ExtractAssets.prototype = {
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
  saveAsset: function (assets, retryCount) {
    var self = this;
    return when.promise(function (resolve, reject) {
      var url = `https:${Object.values(assets.fields.file)[0].url}`;
      var assetTitle = Object.values(assets.fields.title)[0];
      var name = Object.values(assets.fields.file)[0].fileName;
      if (fs.existsSync(path.resolve(assetFolderPath, assets.sys.id, name))) {
        successLogger("asset already present " + "'" + assets.sys.id + "'");
        resolve(assets.sys.id);
      } else {
        request.get(
          {
            url: url,
            timeout: 60000,
            encoding: "binary",
          },
          function (err, response, body) {
            if (err) {
              failedJSON[assets.sys.id] = err;
              if (retryCount == 1) resolve(assets.sys.id);
              else {
                self.saveAsset(assets, 1).then(function (results) {
                  resolve();
                });
              }
            } else {
              if (response.statusCode != 200) {
                var status = "status code: " + response.statusCode;
                failedJSON[assets.sys.id] = status;
                if (retryCount == 1) resolve(assets.sys.id);
                else {
                  self.saveAsset(assets, 1).then(function (results) {
                    resolve();
                  });
                }
              } else {
                mkdirp.sync(path.resolve(assetFolderPath, assets.sys.id));
                fs.writeFile(
                  path.join(assetFolderPath, assets.sys.id, name),
                  body,
                  "binary",
                  function (writeerror) {
                    if (writeerror) {
                      failedJSON[assets.sys.id] = writeerror;
                      if (
                        fs.existsSync(
                          path.resolve(assetFolderPath, assets.sys.id)
                        )
                      ) {
                        fs.unlinkSync(
                          path.resolve(assetFolderPath, assets.sys.id)
                        );
                      }

                      if (retryCount == 1) resolve(assets.sys.id);
                      else {
                        self.saveAsset(assets, 1).then(function (results) {
                          resolve();
                        });
                      }
                    } else {
                      assetData[assets.sys.id] = {
                        uid: assets.sys.id,
                        status: true,
                        content_type: Object.values(assets.fields.file)[0]
                          .contentType,
                        file_size: `${
                          Object.values(assets.fields.file)[0].details.size
                        }`,
                        tag: assets.metadata.tags,
                        filename: name,
                        url: url,
                        ACL: {
                          roles: [],
                          others: {
                            read: false,
                            create: false,
                            update: false,
                            delete: false,
                            sub_acl: {
                              read: false,
                              create: false,
                              update: false,
                              delete: false,
                              publish: false,
                            },
                          },
                        },
                        is_dir: false,
                        parent_uid: null,
                        _version: 1,
                        title: assetTitle,
                        publish_details: [],
                      };
                      // to create JSON file of assets in same folder where it is downloaded
                      const assetVersionInfoFile = path.resolve(
                        assetFolderPath,
                        assets.sys.id,
                        `_contentstack_${assets.sys.id}.json`
                      );
                      //writing the json object in same created json file
                      helper.writeFile(
                        assetVersionInfoFile,
                        JSON.stringify(assetData[assets.sys.id], null, 4)
                      );
                      assetMapping[assets.sys.id] = "";
                      assetURLMapping[url] = "";
                      if (failedJSON[assets.sys.id]) {
                        delete failedJSON[assets.sys.id];
                      }
                      // successLogger("exported asset " + "'" + assetTitle + "'");
                    }
                    self.customBar.increment();
                    resolve(assets.sys.id);
                  }
                );
              }
            }
          }
        );
      }
    });
  },

  getAsset: function (attachments) {
    var self = this;
    return when.promise(function (resolve, reject) {
      var _getAsset = [];
      self.customBar.start(attachments.length, 0, {
        title: "Migrating Assets       ",
      });

      // check total length of asset attachment pass from the getAllAssets
      for (var i = 0, total = attachments.length; i < total; i++) {
        _getAsset.push(
          (function (data) {
            return function () {
              return self.saveAsset(data, 0);
            };
          })(attachments[i])
        );
      }
      //bind the json object which we got from saveAssets in one Object
      var guardTask = guard.bind(null, guard.n(5));
      _getAsset = _getAsset.map(guardTask);
      var taskResults = parallel(_getAsset);
      taskResults
        .then(function (results) {
          helper.writeFile(
            path.join(assetFolderPath, assetConfig.fileName),
            JSON.stringify(assetData, null, 4)
          );
          helper.writeFile(
            path.join(assetMasterFolderPath, assetConfig.fileName),
            JSON.stringify(assetMapping, null, 4)
          );
          helper.writeFile(
            path.join(assetMasterFolderPath, assetConfig.masterfile),
            JSON.stringify(assetURLMapping, null, 4)
          );
          helper.writeFile(
            path.join(assetMasterFolderPath, "cs_failed.json"),
            JSON.stringify(failedJSON, null, 4)
          );
          resolve(results);
        })
        .catch(function (e) {
          errorLogger("failed to download assets: ", e);
          resolve();
        });
    });
  },

  getAllAssets: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      //fetch all data from data.json file
      var alldata = helper.readFile(
        path.join(config.data, config.json_filename)
      );
      // extract assets part from JSON
      var assets = alldata.assets;
      if (assets) {
        if (assets.length > 0) {
          if (!filePath) {
            self
              .getAsset(assets)
              .then(function () {
                resolve();
              })
              .catch(function () {
                reject();
              });
          }
        } else {
          errorLogger("no assets found");
          resolve();
        }
      } else {
        errorLogger("no assets found");
        resolve();
      }
    });
  },

  start: function () {
    var self = this;
    this.initalizeLoader();
    return when.promise(function (resolve, reject) {
      self
        .getAllAssets()
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
module.exports = ExtractAssets;
