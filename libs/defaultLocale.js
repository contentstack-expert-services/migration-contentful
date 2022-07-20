"use strict";
/**
 * External module Dependencies.
 */
var mkdirp = require("mkdirp"),
  path = require("path"),
  fs = require("fs"),
  when = require("when");
/**
 * Internal module Dependencies .
 */

const _ = require("lodash");
var helper = require("../utils/helper");

var defaultLocaleConfig = config.contentful.defaultLocale.filename,
  defaultLocaleFolderPath = path.resolve(
    config.data,
    config.contentful.defaultLocale.dirname
  );

if (!fs.existsSync(defaultLocaleFolderPath)) {
  mkdirp.sync(defaultLocaleFolderPath);
  helper.writeFile(path.join(defaultLocaleFolderPath, defaultLocaleConfig));
}

function ExtractLocale() {
  fs.copyFile(
    config.contentful_filename,
    path.join(process.cwd(), config.data, config.json_filename),
    (err) => {
      if (err) throw console.log(err.message);
    }
  );
}

ExtractLocale.prototype = {
  saveLocale: function (locale) {
    return when.promise(function (resolve, reject) {
      var localeJSON = helper.readFile(
        path.join(defaultLocaleFolderPath, defaultLocaleConfig)
      );
      locale.map((localeData) => {
        if (localeData.default === true) {
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
        path.join(defaultLocaleFolderPath, defaultLocaleConfig),
        JSON.stringify(localeJSON, null, 4)
      );
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
          errorLogger("no locales found");
          resolve();
        }
      } else {
        errorLogger("no locales found");
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
