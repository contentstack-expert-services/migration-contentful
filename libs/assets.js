'use strict';
/**
 * External module Dependencies.
 */
var mkdirp = require('mkdirp'),
  path = require('path'),
  fs = require('fs'),
  guard = require('when/guard'),
  parallel = require('when/parallel'),
  when = require('when'),
  axios = require('axios');

const cliProgress = require('cli-progress');
const colors = require('ansi-colors');

/**
 * Internal module Dependencies .
 */

const config = require('../config');
var helper = require('../utils/helper');

var assetConfig = config.modules.asset,
  assetFolderPath = path.resolve(config.data, assetConfig.dirName),
  assetMasterFolderPath = path.resolve(process.cwd(), 'logs', 'assets');

// Ensure the logs/assets directory exists before trying to read cs_failed.json
if (!fs.existsSync(assetMasterFolderPath)) {
  mkdirp.sync(assetMasterFolderPath);
}

var failedJSON = {};
var failedJSONPath = path.join(assetMasterFolderPath, 'cs_failed.json');
if (fs.existsSync(failedJSONPath)) {
  failedJSON = helper.readFile(failedJSONPath) || {};
}

if (!fs.existsSync(assetFolderPath)) {
  mkdirp.sync(assetFolderPath);
  helper.writeFile(path.join(assetFolderPath, assetConfig.fileName));
  if (!fs.existsSync(path.join(config.data, config.json_filename))) {
    helper.writeFile(path.join(config.data, config.json_filename));
  }
} else {
  if (!fs.existsSync(path.join(assetFolderPath, assetConfig.fileName)))
    helper.writeFile(path.join(assetFolderPath, assetConfig.fileName));
}

//Reading a File
var assetData = helper.readFile(
  path.join(assetFolderPath, assetConfig.fileName)
);

function ExtractAssets() {}
ExtractAssets.prototype = {
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
  saveAsset: function (assets, retryCount) {
    var self = this;
    return when.promise(async function (resolve, reject) {
      try {
        var publish_details = [];
        let environmentsId = helper.readFile(
          path.join(
            process.cwd(),
            config.data,
            'environments',
            'environments.json'
          )
        );

        let localeId = helper.readFile(
          path.join(process.cwd(), config.data, 'locales', 'language.json')
        );
        if (assets.fields.file && assets.fields.title) {
          for (const environmentsValue of Object.values(environmentsId)) {
            if (environmentsValue?.name === assets?.sys?.environment?.sys?.id) {
              for (const localeCode of Object.values(localeId)) {
                publish_details.push({
                  environment: environmentsValue?.uid,
                  version: 1,
                  locale: localeCode.code,
                });
              }
            }
          }
          var url = `https:${Object.values(assets?.fields?.file)[0]?.url}`;
          var assetTitle = Object.values(assets?.fields?.title)[0];
          var assetUid = assets.sys.id.toLowerCase();
          var name = Object.values(assets?.fields?.file)[0].fileName;
          var description;
          for (const desc of Object.values(assets?.fields)) {
            if (typeof Object.values(desc)[0] === 'string') {
              description = Object.values(desc)[0];
              if (description.length > 255) {
                description = description.slice(0, 255);
              }
            }
          }
          name = path.basename(name);
          if (fs.existsSync(path.resolve(assetFolderPath, assetUid, name))) {
            // successLogger("asset already present " + "'" + ass + "'");
            self.customBar.increment();
            resolve(assetUid);
          } else {
            try {
              const response = await axios.get(url, {
                responseType: 'arraybuffer',
              });
              mkdirp.sync(path.resolve(assetFolderPath, assetUid));
              fs.writeFileSync(
                path.join(assetFolderPath, assetUid, name),
                response.data
              );
              assetData[assetUid] = {
                uid: assetUid,
                urlPath: `/assets/${assetUid}`,
                status: true,
                content_type: Object.values(assets?.fields?.file)[0]
                  ?.contentType,
                file_size: `${
                  Object.values(assets?.fields?.file)[0]?.details?.size
                }`,
                tag: assets?.metadata?.tags,
                filename: name,
                url: url,
                is_dir: false,
                parent_uid: 'migrationasset',
                _version: 1,
                title: assetTitle,
                description: description ?? '',
                publish_details: publish_details || [],
              };
              // to create JSON file of assets in same folder where it is downloaded
              const assetVersionInfoFile = path.resolve(
                assetFolderPath,
                assetUid,
                `_contentstack_${assetUid}.json`
              );
              //writing the json object in same created json file
              helper.writeFile(
                assetVersionInfoFile,
                JSON.stringify(assetData[assetUid], null, 4)
              );

              if (failedJSON[assetUid]) {
                delete failedJSON[assetUid];
              }

              self.customBar.increment();
            } catch (err) {
              if (err) {
                failedJSON[assetUid] = err;
                if (retryCount == 1) {
                  failedJSON[assetUid] = {
                    failedUid: assetUid,
                    name: assetTitle,
                    url: url,
                    file_size: `${
                      Object.values(assets?.fields?.file)[0].details.size
                    }`,
                    reason_for_error: err?.message,
                  };
                  helper.writeFile(
                    path.join(assetMasterFolderPath, 'cs_failed.json'),
                    JSON.stringify(failedJSON, null, 4)
                  );
                  resolve(assetUid);
                } else {
                  self.saveAsset(assets, 1).then(function (results) {
                    resolve();
                  });
                }
              }
            }
            resolve(assetUid);
          }
        } else {
          self.customBar.increment();
          resolve(assetUid);
        }
      } catch (error) {
        console.error(error);
        reject();
      }
    });
  },

  getAsset: function (attachments) {
    var self = this;
    return when.promise(function (resolve, reject) {
      try {
        var _getAsset = [];
        self.customBar.start(attachments.length, 0, {
          title: 'Migrating Assets       ',
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
              path.join(assetMasterFolderPath, 'cs_failed.json'),
              JSON.stringify(failedJSON, null, 4)
            );
            resolve(results);
          })
          .catch(function (e) {
            errorLogger('failed to download assets: ', e);
            resolve();
          });
      } catch (error) {
        console.error(error);
        reject();
      }
    });
  },

  getAllAssets: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      //fetch all data from data.json file
      var alldata = helper.readFile(config.contentful_filename);

      // extract assets part from JSON
      var assets = alldata.assets;
      if (assets) {
        if (assets.length > 0) {
          if (!global.filePath) {
            self
              .getAsset(assets)
              .then(function () {
                resolve();
              })
              .catch(function () {
                reject();
              });
          } else {
            console.log(
              '⚠️  Assets skipped because global.filePath is set to:',
              global.filePath
            );
            resolve();
          }
        } else {
          errorLogger('no assets found');
          resolve();
        }
      } else {
        errorLogger('no assets found');
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
