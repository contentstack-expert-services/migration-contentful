"use strict";
/**
 * External module Dependencies.
 */
var mkdirp = require("mkdirp"),
  path = require("path"),
  fs = require("fs"),
  when = require("when");
_ = require("lodash");
/**
 * Internal module Dependencies .
 */

var helper = require("../utils/helper");

var logsFolder = path.resolve(process.cwd(), "logs");

if (!fs.existsSync(logsFolder)) {
  mkdirp.sync(logsFolder);
}

const { contentfulTypeMapper } = require("./contentfulTypeMapper");
function ExtractContentFul() {
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

ExtractContentFul.prototype = {
  saveContentType: function (prefix) {
    var self = this;
    return when.promise(function (resolve, reject) {
      fs.readdir(
        path.resolve(
          (process.cwd(), `${config.data}/${config.contentful.contentful}`)
        ),
        (err, files) => {
          if (err) throw console.log(err.message);
          else {
            let jsonArray = [],
              fieldArray = [];

            files.forEach((file) => {
              let data = helper.readFile(
                path.resolve(
                  (process.cwd(),
                  `${config.data}/${config.contentful.contentful}/${file}`)
                )
              );
              for (const uid of data) {
                contentfulTypeMapper(data);
                let title = file.split(".")[0];
                title = title.charAt(0).toUpperCase() + title.slice(1);
                if (uid.contentUid !== uid.contentfulID)
                  // if (contentfulTypeMapper(data).length !== 0) {
                  jsonArray.push({
                    title: title.charAt(0).toUpperCase() + title.slice(1),
                    changed_schema_uid: [
                      {
                        contentful_schema_id: uid.contentfulID,
                        contentstack_schema_id: uid.contentUid,
                      },
                    ],
                    // change_field_id: [...contentfulTypeMapper(data)],
                  });
                // }
                if (contentfulTypeMapper(data).length !== 0) {
                  fieldArray.push({
                    title: title.charAt(0).toUpperCase() + title.slice(1),
                    change_field_id: [...contentfulTypeMapper(data)],
                  });
                }
              }
            });
            getUniqueListBy(fieldArray, "title");
            var outputList = [];
            JSON.stringify(outputList, null, 4);
            const testingObject = {
              prefix: prefix,
              content_type: getUniqueListBy(fieldArray, "title"),
            };
            helper.writeFile(
              path.join(
                logsFolder,
                `logs_${new Date().toISOString().replace(/[.:]/g, "-")}.json`
              ),
              JSON.stringify(testingObject, null, 4)
            );
          }
        }
      );
      resolve();
    });
  },

  start: function (prefix) {
    var self = this;
    return when.promise(function (resolve, reject) {
      self
        .saveContentType(prefix)
        .then(function () {
          resolve();
        })
        .catch(function () {
          reject();
        });
    });
  },
};
module.exports = ExtractContentFul;

function getUniqueListBy(fieldArray, key) {
  return [...new Map(fieldArray.map((item) => [item[key], item])).values()];
}
