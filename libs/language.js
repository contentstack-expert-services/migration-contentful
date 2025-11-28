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

var languageConfig = config.contentful.language.filename,
  languageFolderPath = path.resolve(
    config.data,
    config.contentful.language.dirname
  );

if (!fs.existsSync(languageFolderPath)) {
  mkdirp.sync(languageFolderPath);
  helper.writeFile(path.join(languageFolderPath, languageConfig));
}

function ExtractLocale() {}

ExtractLocale.prototype = {
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
  saveLocale: function (locale) {
    var self = this;
    return when.promise(function (resolve, reject) {
      self.customBar.start(locale.length, 0, {
        title: 'Migrating Locales      ',
      });
      var localeJSON = helper.readFile(
        path.join(languageFolderPath, languageConfig)
      );
      locale.map((localeData) => {
        var title = localeData.sys.id;
        localeJSON[title] = {
          code: `${localeData.code.toLowerCase()}`,
          name: `${localeData.name}`,
          fallback_locale: '',
          uid: `${title.toLowerCase()}`,
        };
        self.customBar.increment();
      });
      fs.writeFileSync(
        path.join(languageFolderPath, languageConfig),
        JSON.stringify(localeJSON, null, 4)
      );
      resolve(locale);
    });
  },

  getAllLocale: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      //for reading json file and store in alldata
      var alldata = helper.readFile(config.contentful_filename);
      // to fetch all the locale from the json output
      var locales = alldata.locales;
      if (locales) {
        if (locales.length > 0) {
          if (!global.filePath) {
            //run to save and excrete the locales
            self.saveLocale(locales)
              .then(() => resolve())
              .catch((error) => reject(error));
          }
        } else {
          console.log(chalk.red(`\nno locales found`));
          resolve();
        }
      } else {
        console.log(chalk.red(`\nno locales found`));
        resolve();
      }
    });
  },

  start: function () {
    var self = this;
    this.initalizeLoader();
    return when.promise(function (resolve, reject) {
      self
        .getAllLocale()
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

module.exports = ExtractLocale;
