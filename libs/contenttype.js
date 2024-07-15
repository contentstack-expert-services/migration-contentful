'use strict';
/**
 * External module Dependencies.
 */

var mkdirp = require('mkdirp'),
  path = require('path'),
  fs = require('fs'),
  when = require('when');
/**
 * Internal module Dependencies .
 */

var helper = require('../utils/helper.js');

var contentstackFolderPath = path.resolve(config.data, config.contenttypes);
if (!fs.existsSync(contentstackFolderPath)) {
  mkdirp.sync(contentstackFolderPath);
  helper.writeFile(
    path.join(contentstackFolderPath, `schema.json`),
    JSON.stringify([], null, 4)
  );
} else {
  helper.writeFile(
    path.join(contentstackFolderPath, `schema.json`),
    JSON.stringify([], null, 4)
  );
}

const { contentTypeMapper } = require('./contentTypeMapper');

function ExtractContent() {}
const contentTypeArrayData = [];

function addUniqueSchema(data) {
  let index = -1;

  for (let i = 0; i < contentTypeArrayData.length; i++) {
    if (contentTypeArrayData[i].uid === data.uid) {
      index = i;
    }
  }

  if (index > -1) {
    contentTypeArrayData[index] = data;
  } else {
    contentTypeArrayData.push(data);
  }

  helper.writeFile(
    path.join(contentstackFolderPath, `schema.json`),
    JSON.stringify(contentTypeArrayData, null, 4)
  );
  return contentTypeArrayData;
}

ExtractContent.prototype = {
  saveContentType: async function () {
    var self = this;
    try {
      let contentTypeSchema = [];

      let files = await when.promise((resolve, reject) => {
        fs.readdir(
          path.resolve(
            process.cwd(),
            `${config.data}/${config.contentful.contentful}`
          ),
          (err, files) => {
            if (err) {
              reject(err);
            } else {
              resolve(files);
            }
          }
        );
      });
      for (const file of files) {
        let data = helper.readFile(
          path.resolve(
            process.cwd(),
            `${config.data}/${config.contentful.contentful}/${file}`
          )
        );

        for (const uid of data) {
          helper.writeFile(
            path.join(
              contentstackFolderPath,
              `${uid.contentUid.replace(/([A-Z])/g, '_$1').toLowerCase()}.json`
            )
          );

          let titleArray = data.map((item) => item.id);

          contentTypeMapper(data);
          let title = file.split('.')[0];
          const uidTitle = [],
            uidUrl = [];
          if (!titleArray.includes('title')) {
            uidTitle.push({
              display_name: title,
              uid: 'title',
              data_type: 'text',
              field_metadata: { _default: true, version: 1 },
              unique: false,
              mandatory: true,
              multiple: false,
              non_localizable: false,
            });
          }
          if (!titleArray.includes('url')) {
            uidUrl.push({
              display_name: 'URL',
              uid: 'url',
              data_type: 'text',
              field_metadata: { _default: true, version: 1 },
              unique: false,
              multiple: false,
              mandatory: false,
              non_localizable: false,
            });
          }

          let description = uid?.contentDescription || '';
          if (description.length > 255) {
            description = description.slice(0, 255);
          }
          var contentData = {
            title: title.charAt(0).toUpperCase() + title.slice(1),
            uid: uid.contentUid.replace(/([A-Z])/g, '_$1').toLowerCase(),
            _version: 1,
            inbuilt_class: false,
            schema: [...uidTitle, ...uidUrl, ...contentTypeMapper(data)].filter(
              (el) => el !== null
            ),
            description: description,
            options: {
              is_page: true,
              singleton: false,
              sub_title: [],
              title: `title`,
              url_pattern: '/:title',
              url_prefix: `/${title
                .replace(/[^a-zA-Z0-9]+/g, '')
                .toLowerCase()}/`,
            },
            abilities: {
              get_one_object: true,
              get_all_objects: true,
              create_object: true,
              update_object: true,
              delete_object: true,
              delete_all_objects: true,
            },
          };

          // to create schema.json we are using this function
          addUniqueSchema(contentData);
          helper.writeFile(
            path.join(
              contentstackFolderPath,
              `${uid.contentUid.replace(/([A-Z])/g, '_$1').toLowerCase()}.json`
            ),
            JSON.stringify(contentData, null, 4)
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
    return when.resolve();
  },

  start: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      self
        .saveContentType()
        .then(function () {
          resolve();
        })
        .catch(function () {
          reject();
        });
    });
  },
};
module.exports = ExtractContent;
