"use strict";
/**
 * External module Dependencies.
 */
var mkdirp = require("mkdirp"),
  path = require("path"),
  fs = require("fs"),
  when = require("when"),
  chalk = require("chalk");
/**
 * Internal module Dependencies .
 */

const _ = require("lodash");
var helper = require("../utils/helper");

var localeConfig = config.modules.locales.fileName,
  localeFolderPath = path.resolve(config.data, config.modules.locales.dirName);

if (!fs.existsSync(localeFolderPath)) {
  mkdirp.sync(localeFolderPath);
  helper.writeFile(path.join(localeFolderPath, localeConfig));
}

function ExtractLocale() {
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

ExtractLocale.prototype = {
  saveLocale: function (locale) {
    return when.promise(function (resolve, reject) {
      var localeJSON = helper.readFile(
        path.join(localeFolderPath, localeConfig)
      );
      locale.map((localeData) => {
        if (localeData.default === false) {
          var title = localeData.sys.id;
          localeJSON[title] = {
            code: `${localeData.code.toLowerCase()}`,
            name: `${localeData.name}`,
            fallback_locale: "",
            uid: `${title}`,
          };
        }
      });
      helper.writeFile(
        path.join(localeFolderPath, localeConfig),
        JSON.stringify(localeJSON, null, 4)
      );
      // console.log(
      //   chalk.green(`${locale.length} locales exported successfully`)
      // );

      resolve(locale);
    });
  },

  getAllLocale: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      //for reading json file and store in alldata
      var alldata = helper.readFile(
        path.join(config.data, config.json_filename)
      );
      // to fetch all the locale from the json output
      var locales = alldata.locales;
      if (locales) {
        if (locales.length > 0) {
          if (!filePath) {
            //run to save and excrete the locales
            self.saveLocale(locales);
            resolve();
          }
        } else {
          console.log(chalk.red(`no locales found`));
          resolve();
        }
      } else {
        console.log(chalk.red(`no locales found`));
        resolve();
      }
    });
  },

  start: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      self
        .getAllLocale()
        .then(function () {
          resolve();
        })
        .catch(function () {
          reject();
        });
    });
  },
};

module.exports = ExtractLocale;
