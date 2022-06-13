"use strict";
/**
 * External module Dependencies.
 */
var mkdirp = require("mkdirp"),
  path = require("path"),
  fs = require("fs"),
  when = require("when");

const _ = require("lodash");
const cliProgress = require("cli-progress");
const colors = require("ansi-colors");
const chalk = require("chalk");
/**
 * Internal module Dependencies .
 */

var helper = require("../utils/helper");

var webhooksConfig = config.modules.webhooks.fileName,
  webhooksFolderPath = path.resolve(
    config.data,
    config.modules.webhooks.dirName
  );

if (!fs.existsSync(webhooksFolderPath)) {
  mkdirp.sync(webhooksFolderPath);
  helper.writeFile(path.join(webhooksFolderPath, webhooksConfig));
}

function ExtractWebhooks() {
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

ExtractWebhooks.prototype = {
  customBar: null,
  initalizeLoader: function () {
    this.customBar = new cliProgress.SingleBar({
      format:
        "{title}|" +
        colors.cyan("{bar}") +
        "|  {percentage}%  || {value}/{total} completed",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    });
  },
  destroyLoader: function () {
    if (this.customBar) {
      this.customBar.stop();
    }
  },
  saveWebhook: function (webhooks) {
    var self = this;
    return when.promise(function (resolve, reject) {
      self.customBar.start(webhooks.length, 0, {
        title: "Migrating Webhooks     ",
      });
      var webhookJSON = helper.readFile(
        path.join(webhooksFolderPath, webhooksConfig)
      );

      webhooks.map((webhooksData) => {
        let channelTopic = [],
          rest = ["publish", "unpublish"],
          custom = ["create", "delete", "update"],
          ignore = ["save", "archive", "unarchive"],
          require = [
            "content_types",
            "content_types.entries",
            "assets",
            "releases",
          ];
        // to fetch Topic value we got from contentful webhhoks
        webhooksData.topics.map((data) => {
          let contenttype, entries, asset, releases;

          //code for Content Type if it data contain at last
          function contentType_first(data, value) {
            contenttype = data
              .split(".")[0] // split the name in two part "ContentType.*" can split into two part "ContentType" & "*"
              .replace("*", `${value}`) // to replace * with content_types
              .concat(`.${data.split(".")[1]}`); // join the  value we got from split
            channelTopic.push(contenttype);
          }

          //code for Content Type if it data contain at first place
          function contentType_last(data, value) {
            contenttype = data
              .split(".")[0] // split the name in two part "ContentType.*" can split into two part "ContentType" & "*"
              .replace("ContentType", "content_types") // to replace ContentType with content_types
              .concat(`.${value}`); //join the  value we
            channelTopic.push(contenttype); //we have pushed the data in Array
          }

          //code for Entries and Assests if it data contain publish and nonPublish in last
          function RestField_first_success(data, value) {
            entries = data
              .split(".")[0] // split the name in two part "Entry.*" can split into two part "ContentType" & "*"
              .replace("*", `${value}`) // to replace * with entries
              .concat(`.environments.${data.split(".")[1]}.success`); // join the  value we got from split
            channelTopic.push(entries);
          }
          //code for Entries and Assests if it data doesnot contain publish and nonPublish in last
          function RestField_first(data, value) {
            entries = data
              .split(".")[0]
              .replace("*", `${value}`)
              .concat(`.${data.split(".")[1]}`);
            channelTopic.push(entries);
          }

          // code for split releases first part
          function Releases_first(data) {
            releases = data
              .split(".")[0]
              .replace("*", "releases")
              .concat(".environments.deploy");
            channelTopic.push(releases);
          }

          // code for split releases last part
          function Releases_last(data) {
            releases = data
              .split(".")[0]
              .replace("Release", "releases")
              .concat(`.environments.deploy`);
            channelTopic.push(releases);
          }

          // to check if the topic entries present "*" in between
          if (data.split(".")[0].includes("*")) {
            if (!ignore.includes(data.split(".")[1])) {
              for (const value of require) {
                if (value === "content_types") {
                  contentType_first(data, value);
                }
                if (value === "content_types.entries") {
                  if (rest.includes(data.split(".")[1])) {
                    RestField_first_success(data, value);
                  } else {
                    RestField_first(data, value);
                  }
                }
                if (value === "assets") {
                  if (rest.includes(data.split(".")[1])) {
                    RestField_first_success(data, value);
                  } else {
                    RestField_first(data, value);
                  }
                }
                if (value === "releases") {
                  Releases_first(data);
                }
              }
            }
          } else {
            if (data.split(".")[1].includes("*")) {
              if (data.split(".")[0].includes("ContentType")) {
                for (const value of custom) {
                  contentType_last(data, value);
                }
              }
              //same applied here like we have done in Content type
              if (data.split(".")[0].includes("Entry")) {
                for (const value of custom) {
                  entries = data
                    .split(".")[0]
                    .replace("Entry", "content_types.entries")
                    .concat(`.${value}`);
                  channelTopic.push(entries);
                }
                for (const value of rest) {
                  entries = data
                    .split(".")[0]
                    .replace("Entry", "content_type.entries")
                    .concat(`.environments.${value}.success`);
                  channelTopic.push(entries);
                }
              }
              //same applied here like we have done in Content type
              if (data.split(".")[0].includes("Asset")) {
                for (const value of custom) {
                  asset = data
                    .split(".")[0]
                    .replace("Asset", "assets")
                    .concat(`.${value}`);
                  channelTopic.push(asset);
                }
                for (const value of rest) {
                  asset = data
                    .split(".")[0]
                    .replace("Asset", "assets")
                    .concat(`.environments.${value}.success`);
                  channelTopic.push(asset);
                }
              }
              //same applied here like we have done in Content type but we have to check if while spliting the data we have Release or ReleaseAction
              if (
                data.split(".")[0].includes("Release") &&
                !data.split(".")[0].includes("ReleaseAction")
              ) {
                releases = data
                  .split(".")[0]
                  .replace("Release", "releases")
                  .concat(`.environments.deploy`);
                channelTopic.push(releases);
              }
            } else {
              if (!ignore.includes(data.split(".")[1]))
                if (data.split(".")[0].includes("ContentType")) {
                  if (!rest.includes(data.split(".")[1]))
                    contentType_first(data);
                }
              if (data.split(".")[0].includes("Entry")) {
                if (!ignore.includes(data.split(".")[1]))
                  if (rest.includes(data.split(".")[1])) {
                    entries = data
                      .split(".")[0]
                      .replace("Entry", "content_type.entries")
                      .concat(`.environments.${data.split(".")[1]}.success`);
                    channelTopic.push(entries);
                  } else {
                    entries = data
                      .split(".")[0]
                      .replace("Entry", "content_type.entries")
                      .concat(`.${data.split(".")[1]}`);
                    channelTopic.push(entries);
                  }
              }
              if (!ignore.includes(data.split(".")[1]))
                if (data.split(".")[0].includes("Asset")) {
                  if (rest.includes(data.split(".")[1])) {
                    asset = data
                      .split(".")[0]
                      .replace("Asset", "assets")
                      .concat(`.environments.${data.split(".")[1]}.success`);
                    channelTopic.push(asset);
                  } else {
                    asset = data
                      .split(".")[0]
                      .replace("Asset", "assets")
                      .concat(`.${data.split(".")[1]}`);
                    channelTopic.push(asset);
                  }
                }
              if (
                data.split(".")[0].includes("Release") &&
                !data.split(".")[0].includes("ReleaseAction")
              ) {
                Releases_last(data);
              }
            }
          }
        });

        // to fetch all the common header which are present here and store at one place then we can easily destructor them
        var custom_header = {
          custom_header: webhooksData.headers
            .filter((x) => Object.keys(x).includes("value"))
            .map((x) => {
              return { value: x["value"], header_name: x["key"] };
            }),
        };
        var title = webhooksData.sys.id;
        webhookJSON[title] = {
          urlPath: `/webhooks/${title}`,
          concise_payload: false,
          disabled: true,
          retry_policy: "manual",
          channels: _.uniq(channelTopic), // to get unique value in array
          destinations: [
            {
              ...custom_header, // destructor the custom_header output here
              target_url: webhooksData.url,
            },
          ],
          name: webhooksData.name,
          unhealthy: { state: false },
        };
        self.customBar.increment();
      });
      helper.writeFile(
        path.join(webhooksFolderPath, webhooksConfig),
        JSON.stringify(webhookJSON, null, 4)
      );
      // console.log(
      //   chalk.green(`${webhooks.length} Webhooks exported successfully`)
      // );
      resolve(webhooks);
    });
  },

  getAllWebhooks: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      //for reading json file and store in alldata
      var alldata = helper.readFile(
        path.join(config.data, config.json_filename)
      );
      // to fetch all the webhook from the json output
      var webhooks = alldata.webhooks;
      if (webhooks) {
        if (webhooks.length > 0) {
          if (!filePath) {
            //run to save and excrete the webhooks
            self.saveWebhook(webhooks);
            resolve();
          }
        } else {
          console.log(chalk.red(`\nno webhooks found`));
          resolve();
        }
      } else {
        console.log(chalk.red(`\nno webhooks found`));
        resolve();
      }
    });
  },
  start: function () {
    var self = this;
    this.initalizeLoader();
    return when.promise(function (resolve, reject) {
      self
        .getAllWebhooks()
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

module.exports = ExtractWebhooks;
