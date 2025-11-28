'use strict';
/**
 * External module Dependencies.
 */
var mkdirp = require('mkdirp'),
  path = require('path'),
  fs = require('fs'),
  when = require('when'),
  chalk = require('chalk');
/**
 * Internal module Dependencies .
 */

const cliProgress = require('cli-progress');
const colors = require('ansi-colors');
const config = require('../config');

var helper = require('../utils/helper');

var localeFolderPath = path.resolve(
    config.data,
    config.modules.locales.dirName
  ),
  defaultLocaleConfig = config.modules.locales.masterLocale,
  languageConfig = config.modules.locales.cfLanguage,
  localeConfig = config.modules.locales.fileName;

if (!fs.existsSync(localeFolderPath)) {
  mkdirp.sync(localeFolderPath);
  helper.writeFile(path.join(localeFolderPath, defaultLocaleConfig));
  helper.writeFile(path.join(localeFolderPath, languageConfig));
  helper.writeFile(path.join(localeFolderPath, localeConfig));
}

const localeList = require('../utils/localeList.json');

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
      // to save default locale of Contentful file
      var defaultLocaleJSON = helper.readFile(
        path.join(localeFolderPath, defaultLocaleConfig)
      );

      // to save other locales of Contentful file
      var localeJSON = helper.readFile(
        path.join(localeFolderPath, localeConfig)
      );

      // to save all locale files which are available in Contentful file
      var languageJSON = helper.readFile(
        path.join(localeFolderPath, languageConfig)
      );

      locale.map((localeData) => {
        var title = localeData.sys.id;
        var newLocale = {
          code: `${localeData.code.toLowerCase()}`,
          name:
            localeList[localeData.code.toLowerCase()] ||
            'English - United States',
          fallback_locale: '',
          uid: `${title.toLowerCase()}`,
        };

        if (localeData.default === true) {
          defaultLocaleJSON[title] = newLocale;
        } else {
          newLocale.name = `${localeData.name}`;
          localeJSON[title] = newLocale;
        }

        languageJSON[title] = newLocale;

        self.customBar.increment();
      });

      fs.writeFileSync(
        path.join(localeFolderPath, defaultLocaleConfig),
        JSON.stringify(defaultLocaleJSON, null, 4)
      );
      fs.writeFileSync(
        path.join(localeFolderPath, localeConfig),
        JSON.stringify(localeJSON, null, 4)
      );
      fs.writeFileSync(
        path.join(localeFolderPath, languageConfig),
        JSON.stringify(languageJSON, null, 4)
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
