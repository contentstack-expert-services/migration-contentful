var path = require("path"),
  chalk = require("chalk"),
  fs = require("fs"),
  inquirer = require("inquirer"),
  sequence = require("when/sequence"),
  helper = require("../utils/helper");

_ = require("lodash");
const Messages = require("../utils/message");
const messages = new Messages("contenful").msgs;

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
  "assets",
  "contenttype",
  "environments",
  "entries",
  "contentfulLogs",
];
var _export = [];

const migFunction = () => {
  inquirer
    .prompt({
      type: "input",
      name: "csPrefix",
      message: messages.promptPrefix,
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

          //   var stackClone = new StackCloneCommand();

          //   const defaultLocale = helper.readFile(
          //     path.join(
          //       process.cwd(),
          //       "csMigrationData/defaultLocale/defaultLocale.json"
          //     )
          //   );
          //   const masterLocale = Object.values(defaultLocale)
          //     .map((localeId) => localeId.code)
          //     .join();
          //   try {
          //     // await stackClone.run(masterLocale); // to run to fetch stack from CS
          //   } catch (e) {
          //     console.log("error message", e);
          //   }
        })
        .catch(function (error) {
          console.log("thrown inside catch block", error);
          errorLogger(error);
        });
    });
};

// to check if file exist or not
const fileCheck = (csFileName, csFilePath) => {
  const allowedExtension = ".json";
  const extension = path.extname(config.contentful_filename);
  if (allowedExtension === extension) {
    if (fs.existsSync(config.contentful_filename)) {
      migFunction();
    } else {
      console.log(
        chalk.red(`Please check`),
        chalk.yellow(`File name "${csFileName}"`),
        chalk.red(`or`),
        chalk.yellow(`Filepath "${csFilePath}"`),
        chalk.red(`are valid or not and try again!`)
      );
      contentfulMigration();
    }
  } else {
    console.log(chalk.red("use only .json extension file"));
  }
};

const contentfulMigration = async () => {
  console.log(chalk.hex("#6C5CE7")(messages.promptDescription));

  const question = [
    {
      type: "input",
      name: "csFileName",
      message: messages.promptFileName,
      validate: (csFileName) => {
        if (!csFileName || csFileName.trim() === "") {
          console.log(chalk.red("Please insert file name!"));
          return false;
        }
        this.name = csFileName;
        return true;
      },
    },
    {
      type: "input",
      name: "csFilePath",
      message: messages.promptFilePath,
      validate: (csFilePath) => {
        if (!csFilePath || csFilePath.trim() === "") {
          console.log(chalk.red("Please insert filepath!"));
          return false;
        }
        this.name = csFilePath;
        return true;
      },
    },
  ];

  inquirer.prompt(question).then(async (answer) => {
    try {
      const allowedExtension = ".json";
      if (path.extname(answer.csFileName)) {
        const extension = path.extname(answer.csFileName);
        if (answer.csFileName) {
          if (extension === allowedExtension) {
            config.contentful_filename = `${answer.csFilePath}/${answer.csFileName}`;
            fileCheck(answer.csFileName, answer.csFilePath.replace(/\/$/, ""));
          } else {
            config.contentful_filename = `${answer.csFilePath}/${answer.csFileName}.json`;
            fileCheck(answer.csFileName, answer.csFilePath.replace(/\/$/, ""));
          }
        }
      } else {
        config.contentful_filename = `${answer.csFilePath}/${answer.csFileName}.json`;
        fileCheck(answer.csFileName, answer.csFilePath.replace(/\/$/, ""));
      }
    } catch (error) {
      console.log(chalk.red(error.message));
    }
  });
};

module.exports = contentfulMigration();
