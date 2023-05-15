var path = require("path"),
  chalk = require("chalk"),
  inquirer = require("inquirer"),
  fs = require("fs"),
  sequence = require("when/sequence");

const Messages = require("./utils/message");
const messages = new Messages("contenful").msgs;

config = require("./config");
global.errorLogger = require("./utils/logger")("error").error;
global.successLogger = require("./utils/logger")("success").log;
global.warnLogger = require("./utils/logger")("warn").log;

var moduleList = [
  "locale",
  "displayEntries",
  "rteReference",
  "reference",
  "contentful",
  "createEntries",
  "assets",
  "webhooks",
  "extensions",
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
          var ModuleExport = require("./libs/" + moduleList[i] + ".js");
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
        console.log("hi check", err);
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
            chalk.yellow(`${path.join(process.cwd(), "logs")}\n`)
          );
        })
        .catch(function (error) {
          console.log("thrown inside catch block", error);
          errorLogger(error);
        });
    });
};

// to check if file exist or not
const fileCheck = (csFileDetails) => {
  const allowedExtension = ".json";
  const extension = path.extname(csFileDetails);
  if (allowedExtension === extension) {
    if (fs.existsSync(csFileDetails)) {
      migFunction();
    } else {
      console.log(
        chalk.red(
          `Please check whether the entered details are correct or not and try again->`
        ),
        chalk.yellow(` "${csFileDetails}"`)
      );
      contentfulMigration();
    }
  } else {
    console.log(chalk.red("use only .json extension file"));
    contentfulMigration();
  }
};

const contentfulMigration = async () => {
  console.log(chalk.hex("#6C5CE7")(messages.promptDescription));

  const question = [
    {
      type: "input",
      name: "csFileDetails",
      message: messages.promptFileName,
      validate: (csFileDetails) => {
        if (!csFileDetails || csFileDetails.trim() === "") {
          console.log(chalk.red("Please insert file name!"));
          return false;
        }
        this.name = csFileDetails;
        return true;
      },
    },
  ];

  inquirer.prompt(question).then(async (answer) => {
    try {
      const allowedExtension = ".json";
      if (path.extname(answer.csFileDetails)) {
        const extension = path.extname(answer.csFileDetails);
        if (answer.csFileDetails) {
          if (extension === allowedExtension) {
            config.contentful_filename = answer.csFileDetails;
            fileCheck(answer.csFileDetails.replace(/\/$/, ""));
          } else {
            config.contentful_filename = `${answer.csFileDetails}.json`;
            fileCheck(answer.csFileDetails.replace(/\/$/, ""));
          }
        }
      } else {
        config.contentful_filename = `${answer.csFileDetails}.json`;
        fileCheck(`${answer.csFileDetails}.json`);
      }
    } catch (error) {
      console.log(chalk.red(error.message));
    }
  });
};

module.exports = contentfulMigration();
