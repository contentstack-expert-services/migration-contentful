var path = require("path"),
  chalk = require("chalk"),
  inquirer = require("inquirer"),
  sequence = require("when/sequence");

config = require("../config");
global.errorLogger = require("../utils/logger")("error").error;
global.successLogger = require("../utils/logger")("success").log;
global.warnLogger = require("../utils/logger")("warn").log;

var moduleList = [
  "defaultLocale",
  "displayEntries",
  "rteReference",
  "reference",
  "locale",
  "extensions",
  "webhooks",
  "language",
  "contentful",
  "createEntries",
  "assets",
  "contenttype",
  "environments",
  "entries",
  "contentfulLogs",
];
var _export = [];

const migFunction = (contentful_file) => {
  inquirer
    .prompt({
      type: "input",
      name: "csPrefix",
      message: "Enter prefix",
      default: "cs",
      validate: (csPrefix) => {
        let format = /[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]+/;
        if (format.test(csPrefix)) {
          console.log(
            chalk.red(`\nSpecial Charatcers are not allowed except "_"`)
          );
          return false;
        }
        this.name = csPrefix;
        return true;
      },
    })
    .then(async (answer) => {
      try {
        config.contentful_filename = contentful_file;

        console.log("child", contentful_file);
        global.filePath = undefined;
        for (var i = 0, total = moduleList.length; i < total; i++) {
          //to export all the modules we want to import
          var ModuleExport = require("../libs/" + moduleList[i] + ".js");
          var moduleExport = new ModuleExport();
          _export.push(
            (function (moduleExport) {
              return function () {
                return moduleExport.start(
                  answer.csPrefix.replace(/[^a-zA-Z0-9]+/g, "_")
                );
              };
            })(moduleExport)
          );
        }
      } catch (err) {
        console.log("error message", err.message);
      }
      var taskResults = sequence(_export);
      taskResults
        .then(async function (results) {
          console.log(
            chalk.green("\nContenful Data exporting has been completed")
          );

          console.log(
            `See Logs folder for changed UIDs here`,
            chalk.yellow(`${path.join(process.cwd(), "logs")}`)
          );
        })
        .catch(function (error) {
          console.log("thrown inside catch block", error);
          errorLogger(error);
        });
    });
};

module.exports = migFunction(contentful_file);
