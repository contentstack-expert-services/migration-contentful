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

var helper = require("../utils/helper");

var extensionConfig = config.contentful.extensions.filename,
  extensionFolderPath = path.resolve(
    config.data,
    config.contentful.extensions.dirname
  );

if (!fs.existsSync(extensionFolderPath)) {
  mkdirp.sync(extensionFolderPath);
  helper.writeFile(path.join(extensionFolderPath, extensionConfig));
}

function ExtractExtensions() {}

ExtractExtensions.prototype = {
  saveAllExtension: function () {
    return when.promise(function (resolve, reject) {
      var extensionsJSON = helper.readFile(
        path.join(extensionFolderPath, extensionConfig)
      );
      extensionsJSON = {
        jsonobject_extension: {
          urlPath: "/extensions/jsonobject_extension",
          tags: [],
          ACL: [],
          _version: 1,
          title: "JSON Editor",
          config: {},
          type: "field",
          data_type: "json",
          multiple: true,
          srcdoc:
            '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8"/>\n    <title>Ace Editor Extension</title>\n    <style>\n      body { margin: 0; }\n    </style>\n    <!--\n    Load the Extensions API that is used to communicate with the containing app.\n    -->\n    <script src="https://www.contentstack.com/sdks/contentstack-ui-extensions/dist/latest/ui-extension-sdk.js"></script>\n    <!--\n    We use lodash.throttle to avoid spamming the API with changes\n    -->\n    <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.4/lodash.min.js"></script>\n    \n    <!-- load a custom version of Ace editor -->\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.6/ace.js"></script>\n   \n    <link href="https://assets.contentstack.io/v3/assets/blt30b41f7b9a5d7467/bltb6bb4f7db098181f/5b39e605fda2af4e7866b92c/jsoneditor.min.css" rel="stylesheet" type="text/css">\n    <script src="https://assets.contentstack.io/v3/assets/blt30b41f7b9a5d7467/blte7fe106cc93cf2bf/5b33888fcfc846f95726af6f/jsoneditor.min.js"></script>\n   \n  </head>\n  <body  onclick="setFocus()">\n    <div id="jsoneditor"></div>\n    \n    <script>\n        // initialise Field Extension\n        window.extensionField = {};\n        \n        // find jsoneditor element\n        var jsoneditorElement = document.getElementById("jsoneditor");\n        \n        // initialise variable for json editor plugin\n        var jsonEditor = {};\n    \n        \n        ContentstackUIExtension.init().then(function(extension) {\n            \n            // make extension object globally available\n            extensionField = extension;\n            \n            \n            // update the field height \n            extensionField.window.updateHeight(220);\n            \n            // Get current Json editor field value from Contentstack and update the element\n            var value = extensionField.field.getData() || {};\n            \n            \n            // Configure Json editor\n            var options = {\n                modes: [\'text\', \'code\', \'tree\', \'form\', \'view\'],\n                mode: \'code\',\n                ace: ace,\n                onChange : function(){\n                    updateFieldValue();\n                }\n            };\n            \n            jsonEditor = new JSONEditor(jsoneditorElement, options);\n            jsonEditor.set(value);\n            \n            \n            \n      \n            \n        })\n        \n        function setFocus(){\n            extensionField.field.setFocus();\n        }\n        \n        function updateFieldValue () {\n          var value = jsonEditor.get();\n          extensionField.field.setData(value).then(function(){\n            \t\tconsole.log(\'data set on child\')\n            \t}).catch(function(error){\n            \t\tconsole.log(\'error in setting data\',error)\n            \t})\n        }\n    </script>\n  </body>\n</html>',
        },
        rating_extension: {
          urlPath: "/extensions/rating_extension",
          tags: [],
          ACL: [],
          _version: 1,
          title: "Star Ratings",
          config: {},
          type: "field",
          data_type: "number",
          multiple: true,
          srcdoc:
            '<!DOCTYPE html>\n<html>\n<head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <link href="https://www.contentstack.com/sdks/contentstack-ui-extensions/dist/latest/ui-extension-sdk.css" rel="stylesheet" type="text/css" media="all">\n    <script src="https://www.contentstack.com/sdks/contentstack-ui-extensions/dist/latest/ui-extension-sdk.js"></script>\n    <script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>\n    <link type="text/css" rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css"/>\n    <style>\n         body{\n           overflow:hidden;\n          }\n        #wrapper {\n            position: relative;\n        }\n        .user-rating {\n            direction: rtl;\n            font-size: 20px;\n            unicode-bidi: bidi-override;\n            padding: 9px 18px;\n            display: inline-block;\n        }\n        .user-rating input {\n            opacity: 0;\n            position: relative;\n            left: -15px;\n            z-index: 2;\n            cursor: pointer;\n        }\n        .user-rating span.star:before {\n            color: #777777;\n            content:"ï€†";\n            /*padding-right: 5px;*/\n        }\n        .user-rating span.star {\n            display: inline-block;\n            font-family: FontAwesome;\n            font-style: normal;\n            font-weight: normal;\n            position: relative;\n            z-index: 1;\n        }\n        .user-rating span {\n            margin-left: -15px;\n        }\n        .user-rating span.star:before {\n            color: #777777;\n            content:"\\f006";\n            /*padding-right: 5px;*/\n        }\n        .user-rating input:hover + span.star:before, .user-rating input:hover + span.star ~ span.star:before, .user-rating input:checked + span.star:before, .user-rating input:checked + span.star ~ span.star:before {\n            color: #ffd100;\n            content:"\\f005";\n        }\n    .selected-rating{\n        color: #ffd100;\n        font-weight: bold;\n        font-size: 3em;\n    }\n</style>\n\n</head>\n<body>\n<div id="wrapper">\n    <form id="user-rating-form" onchange="ratingChange()" onclick="setFocus()">\n        <span class="user-rating">\n            <input type="radio" name="rating" value="5"><span class="star"></span>\n            <input type="radio" name="rating" value="4"><span class="star"></span>\n            <input type="radio" name="rating" value="3"><span class="star"></span>\n            <input type="radio" name="rating" value="2"><span class="star"></span>\n            <input type="radio" name="rating" value="1"><span class="star"></span>\n        </span>\n    </form>\n</div>\n<script>\n        // initialise Field Extension \n        var extensionField;\n        \n        // Initialize and set the default or saved value for extension\n        ContentstackUIExtension.init().then(function(extension) {\n            // make extension object globally available\n            extensionField = extension;\n            // Get current Rating value from Contentstack and update the Rating element\n            var initialValue = (extension && extension.field && extension.field.getData() && extension.field.getData() !== null) ? extension.field.getData() : 0;\n            $("input[name=\'rating\'][value="+initialValue+"]").attr(\'checked\', true);\n            extension.window.updateHeight();\n            ratingChange();\n        })\n        \n        // On Rating change event, pass new value to Contentstack\n          function ratingChange(){\n            var ratingval = parseInt($(\'[name="rating"]:checked\').val());\n            ratingval = (ratingval && ratingval !== null) ? ratingval : 0; \n            extensionField.field.setData(ratingval).then(function(){\n    \t    }).catch(function(error){\n    \t    })\n        }\n        \n        function setFocus(){\n            extensionField.field.setFocus();\n        }\n</script>\n</body>\n</html>',
        },
        listview_extension: {
          urlPath: "/extensions/listview_extension",
          tags: [],
          ACL: [],
          _version: 1,
          title: "list view",
          config: {},
          type: "field",
          data_type: "json",
          multiple: true,
          src: "https://array-list.vercel.app/",
        },
      };
      helper.writeFile(
        path.join(extensionFolderPath, extensionConfig),
        JSON.stringify(extensionsJSON, null, 4)
      );
      resolve();
    });
  },
  start: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      self
        .saveAllExtension()
        .then(function () {
          resolve();
        })
        .catch(function () {
          reject();
        });
    });
  },
};

module.exports = ExtractExtensions;
