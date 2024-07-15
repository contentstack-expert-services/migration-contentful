'use strict';
/**
 * External module Dependencies.
 */
var mkdirp = require('mkdirp'),
  path = require('path'),
  fs = require('fs'),
  when = require('when');

const chalk = require('chalk');
const cliProgress = require('cli-progress');
const colors = require('ansi-colors');

/**
 * Internal module Dependencies .
 */

var helper = require('../utils/helper');

var contentfulFolderPath = path.resolve(
  config.data,
  config.contentful.contentful
);
if (!fs.existsSync(contentfulFolderPath)) {
  mkdirp.sync(contentfulFolderPath);
}

function ExtractContent() {}

ExtractContent.prototype = {
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
  saveContentType: function (contentTypes, editorInterface, prefix) {
    var self = this;
    self.customBar.start(contentTypes.length, 0, {
      title: 'Migrating Content-type ',
    });
    return when.promise(function (resolve, reject) {
      try {
        let contentName = contentTypes.map((content) => {
          return content.sys.id.replace(/([A-Z])/g, '_$1').toLowerCase();
        });

        contentTypes.forEach((content) => {
          // to collect Schema from Contentful
          let jsonObj = [];
          helper.writeFile(
            path.join(
              contentfulFolderPath,
              `${(
                content.name.charAt(0).toUpperCase() + content.name.slice(1)
              ).replace(/[^\w\s]/g, '')}.json`
            )
          );

          editorInterface.forEach((editor) => {
            if (content.sys.id === editor.sys.contentType.sys.id) {
              for (const valueType of content.fields) {
                for (const valueEditor of editor.controls) {
                  if (valueType.id === valueEditor.fieldId) {
                    jsonObj.push({
                      prefix: prefix,
                      contentUid: content.sys.id
                        .replace(/([A-Z])/g, '_$1')
                        .toLowerCase(),
                      contentDescription: content.description,
                      contentfulID: content.sys.id,
                      ...valueType,
                      ...valueEditor,
                      contentNames: contentName,
                    });
                  }
                }
              }

              helper.writeFile(
                path.join(
                  contentfulFolderPath,
                  `${(
                    content.name.charAt(0).toUpperCase() + content.name.slice(1)
                  ).replace(/[^\w\s]/g, '')}.json`
                ),
                JSON.stringify(jsonObj, null, 4)
              );
            }
          });
          self.customBar.increment();
        });
        resolve();
      } catch (error) {
        console.log(error);
        reject();
      }
    });
  },
  getAllContent: function (prefix) {
    var self = this;
    return when.promise(function (resolve, reject) {
      try {
        var alldata = helper.readFile(config.contentful_filename);

        // to fetch all the entries from the json output
        var contentTypes = alldata.contentTypes;
        var editorInterface = alldata.editorInterfaces;
        if (contentTypes) {
          if (contentTypes.length > 0) {
            if (!filePath) {
              //run to save and excrete the contentTypes
              self.saveContentType(contentTypes, editorInterface, prefix);
              resolve();
            }
          } else {
            console.log(chalk.red('no content-type found'));
            resolve();
          }
        } else {
          console.log(chalk.red('no content-type found'));
          resolve();
        }
      } catch (error) {
        console.log(error);
        reject();
      }
    });
  },

  start: function (prefix) {
    var self = this;
    this.initalizeLoader();
    return when.promise(function (resolve, reject) {
      self
        .getAllContent(prefix)
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
module.exports = ExtractContent;
