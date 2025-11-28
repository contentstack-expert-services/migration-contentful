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

const config = require('../config');
var helper = require('../utils/helper');

var environmentsConfig = config.modules.environments.fileName,
  environmentsFolderPath = path.resolve(
    config.data,
    config.modules.environments.dirName
  );

if (!fs.existsSync(environmentsFolderPath)) {
  mkdirp.sync(environmentsFolderPath);
  helper.writeFile(path.join(environmentsFolderPath, environmentsConfig));
}

function ExtractEnvironments() {}

ExtractEnvironments.prototype = {
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
  saveEnvironment: function (environments) {
    var self = this;
    return when.promise(function (resolve, reject) {
      self.customBar.start(environments.length, 0, {
        title: 'Migrating Environment  ',
      });
      var environmentsJSON = helper.readFile(
        path.join(environmentsFolderPath, environmentsConfig)
      );

      const defaultLocale = helper.readFile(
        path.join(process.cwd(), config.data, 'locales', 'master-locale.json')
      );

      let masterLocale = Object.values(defaultLocale)
        .map((localeId) => localeId.code)
        .join();
      environments.map((env) => {
        var title = env?.sys?.createdBy?.sys?.id;
        var name = env?.sys?.environment?.sys?.id || 'master';

        // Check if the name is unique
        var isUnique = !Object.values(environmentsJSON).some(
          (env) => env.name === name
        );

        if (isUnique) {
          environmentsJSON[title] = {
            uid: title.toLowerCase(),
            urlPath: `/environments/${
              env?.sys?.environment?.sys?.id || 'master'
            }`,
            urls: [{ url: '', locale: masterLocale }],
            name: name,
          };
        }

        self.customBar.increment();
      });

      fs.writeFileSync(
        path.join(environmentsFolderPath, environmentsConfig),
        JSON.stringify(environmentsJSON, null, 4)
      );

      resolve(environments);
    });
  },
  getAllEnvironments: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      //for reading json file and store in alldata
      var alldata = helper.readFile(config.contentful_filename);

      // to fetch all the webhook from the json output

      var environments = alldata.editorInterfaces;
      if (environments) {
        if (environments.length > 0) {
          if (!global.filePath) {
            //run to save and excrete the environments
            self.saveEnvironment(environments)
              .then(() => resolve())
              .catch((error) => reject(error));
          }
        } else {
          console.log(chalk.red(`\nno environments found`));
          resolve();
        }
      } else {
        console.log(chalk.red(`\nno environments found`));
        resolve();
      }
    });
  },
  start: function () {
    var self = this;
    this.initalizeLoader();
    return when.promise(function (resolve, reject) {
      self
        .getAllEnvironments()
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
module.exports = ExtractEnvironments;
