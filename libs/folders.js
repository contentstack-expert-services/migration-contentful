'use strict';
/**
 * External module Dependencies.
 */
var path = require('path'),
  when = require('when'),
  fs = require('fs'),
  mkdirp = require('mkdirp');
/**
 * Internal module Dependencies .
 */

const helper = require('../utils/helper');

var assetConfig = config.modules.asset,
  assetFolderPath = path.resolve(config.data, assetConfig.dirName),
  assetMasterFolderPath = path.resolve(process.cwd(), 'logs', 'assets');

if (!fs.existsSync(assetFolderPath)) {
  mkdirp.sync(assetFolderPath);
  helper.writeFile(path.join(assetFolderPath, assetConfig.fileName));
  mkdirp.sync(assetMasterFolderPath);
  if (!fs.existsSync(path.join(config.data, config.json_filename))) {
    helper.writeFile(path.join(config.data, config.json_filename));
  }
} else {
  if (!fs.existsSync(path.join(assetFolderPath, assetConfig.fileName)))
    helper.writeFile(path.join(assetFolderPath, assetConfig.fileName));
  if (!fs.existsSync(assetMasterFolderPath)) {
    mkdirp.sync(assetMasterFolderPath);
  }
}

function ExtractFolders() {}

ExtractFolders.prototype = {
  saveFolder: function () {
    return when.promise(function (resolve, reject) {
      try {
        var folderJSON = [
          {
            urlPath: '/assets/migrationasset',
            uid: 'migrationasset',
            content_type: 'application/vnd.contenstack.folder',
            tags: [],
            name: 'Migration',
            is_dir: true,
            parent_uid: null,
            _version: 1,
          },
        ];
        helper.writeFile(
          path.join(process.cwd(), config.data, 'assets', 'folders.json'),
          JSON.stringify(folderJSON, null, 4)
        );

        resolve();
      } catch (error) {
        console.log(error);
        reject();
      }
    });
  },
  start: function () {
    // successLogger(`Creating assets folder...`);
    var self = this;
    return when.promise(function (resolve, reject) {
      self
        .saveFolder()
        .then(function () {
          resolve();
        })
        .catch(function () {
          reject();
        });
    });
  },
};

module.exports = ExtractFolders;
