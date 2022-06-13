var helper = require("../utils/helper");

const parsers = new Map();

const _ = require("lodash");
// once all the parsers are implemented don't need this check
parsers._get = parsers.get;

parsers.get = function (key) {
  if (this.has(key)) {
    return this._get(key);
  }
  return () => console.warn();
};

// map all the parsers
// keys should be exactly same as keys in input json
parsers.set("document", parseDocument);
parsers.set("paragraph", parseParagraph);
parsers.set("text", parseText);
parsers.set("hr", parseHR);
parsers.set("list-item", parseLI);
parsers.set("unordered-list", parseUL);
parsers.set("ordered-list", parseOL);
parsers.set("embedded-entry-block", parseBlockReference);
parsers.set("embedded-entry-inline", parseInlineReference);
parsers.set("embedded-asset-block", parseBlockAsset);
parsers.set("blockquote", parseBlockquote);
parsers.set("heading-1", parseHeading1);
parsers.set("heading-2", parseHeading2);
parsers.set("heading-3", parseHeading3);
parsers.set("heading-4", parseHeading4);
parsers.set("heading-5", parseHeading5);
parsers.set("heading-6", parseHeading6);
parsers.set("entry-hyperlink", parseEntryHyperlink);
parsers.set("asset-hyperlink", parseAssetHyperlink);
parsers.set("hyperlink", parseHyperlink);

function convert(obj, lang) {
  return parsers.get(obj.nodeType)(obj, lang);
}

function parseDocument(obj, lang) {
  let type = "doc";
  let uid = "doc" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [];
  let _version = 1;
  obj.content.forEach((e) => {
    children.push(parsers.get(e.nodeType)(e, lang));
  });

  return { type, attrs, uid, children, _version };
}

function parseParagraph(obj, lang) {
  let type = "p";
  let uid = "p" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [];

  obj.content.forEach((e) => {
    children.push(parsers.get(e.nodeType)(e, lang));
  });
  return { type, attrs, uid, children };
}

function parseText(obj) {
  const result = {};
  result.text = obj.value;
  obj.marks.forEach(
    (e) => (result[e.type.replace("code", "inlineCode")] = true)
  );

  return result;
}

function parseHR() {
  let type = "hr";
  let uid = "hr" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [{ text: "" }];
  return { type, attrs, uid, children };
}

function parseUL(obj) {
  let type = "ul";
  let uid = "ul" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [];
  let id = "ul" + Math.floor(Math.random() * 100000000000000);

  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  return { uid, type, children, id, attrs };
}

function parseOL(obj) {
  let type = "ol";
  let uid = "ol" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [];
  let id = "ul" + Math.floor(Math.random() * 100000000000000);

  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  return { uid, type, children, id, attrs };
}

function parseLI(obj) {
  let type = "li";
  let uid = "li" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [];

  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  // get rid of paragraph elements
  children = children.map((c) => c.children).flat();

  return { type, attrs, uid, children };
}

function parseBlockReference(obj, lang) {
  let entryId = helper.readFile(
    path.join(process.cwd(), "csMigrationData/rteReferences/rteReferences.json")
  );

  let type, uid, children, attrs;

  type = "reference";
  uid = "reference" + Math.floor(Math.random() * 100000000000000);
  children = [{ text: "" }];
  attrs = {};

  for (const [arrayKey, arrayValue] of Object.entries(entryId)) {
    for (const [accessKey, accessValue] of Object.entries(arrayValue)) {
      if (accessKey === obj.data.target.sys.id) {
        attrs = {
          "display-type": "block",
          type: "entry",
          "class-name": "embedded-entry redactor-component block-entry",
          "entry-uid": accessKey,
          locale: arrayKey,
          "content-type-uid": accessValue._content_type_uid,
        };
      }
    }
  }
  return { uid, type, attrs, children };
}

function parseInlineReference(obj, lang) {
  let entryId = helper.readFile(
    path.join(process.cwd(), "csMigrationData/rteReferences/rteReferences.json")
  );

  let type, uid, children, attrs;

  type = "reference";
  uid = "reference" + Math.floor(Math.random() * 100000000000000);
  children = [{ text: "" }];
  attrs = {};
  for (const [arrayKey, arrayValue] of Object.entries(entryId)) {
    for (const [accessKey, accessValue] of Object.entries(arrayValue)) {
      if (accessKey === obj.data.target.sys.id) {
        attrs = {
          "display-type": "block",
          type: "entry",
          "class-name": "embedded-entry redactor-component block-entry",
          "entry-uid": accessKey,
          locale: arrayKey,
          "content-type-uid": accessValue._content_type_uid,
        };
      }
    }
  }

  return { type, attrs, uid, children };
}

function parseBlockAsset(obj) {
  let assetId = helper.readFile(
    path.join(process.cwd(), "csMigrationData/assets/assets.json")
  );
  let type = "reference";
  let uid = "asset" + Math.floor(Math.random() * 100000000000000);
  let children = [{ text: "" }];
  let attrs = {};

  if (obj.data.target.sys.id in assetId) {
    attrs = {
      "display-type": "download",
      "asset-uid": obj.data.target.sys.id,
      "content-type-uid": "sys_assets",
      "asset-link": assetId[obj.data.target.sys.id].url,
      "asset-name": assetId[obj.data.target.sys.id].filename,
      "asset-type": assetId[obj.data.target.sys.id].content_type,
      type: "asset",
      "class-name": "embedded-asset",
      inline: false,
      width: 443,
      height: 266,
    };
  }

  return { type, attrs, uid, children };
}

function parseBlockquote(obj) {
  let type = "blockquote";
  let uid = "blockquote" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [];
  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  children = children.map((c) => c.children).flat();

  return { type, attrs, uid, children };
}

function parseHeading1(obj) {
  let type = "h1";
  let uid = "h1" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [];

  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  children = children
    .map((c) => {
      return c;
    })
    .flat();
  return { type, attrs, uid, children };
}

function parseHeading2(obj) {
  let type = "h2";
  let uid = "h2" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [];
  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  children = children
    .map((c) => {
      return c;
    })
    .flat();
  return { type, attrs, uid, children };
}

function parseHeading3(obj) {
  let type = "h3";
  let uid = "h3" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [];
  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  children = children
    .map((c) => {
      return c;
    })
    .flat();
  return { type, attrs, uid, children };
}

function parseHeading4(obj) {
  let type = "h4";
  let uid = "h4" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [];
  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  children = children
    .map((c) => {
      return c;
    })
    .flat();
  return { type, attrs, uid, children };
}

function parseHeading5(obj) {
  let type = "h5";
  let uid = "h5" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [];
  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  children = children
    .map((c) => {
      return c;
    })
    .flat();
  return { type, attrs, uid, children };
}

function parseHeading6(obj) {
  let type = "h6";
  let uid = "h6" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [];
  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  children = children
    .map((c) => {
      return c;
    })
    .flat();
  return { type, attrs, uid, children };
}

function parseAssetHyperlink(obj) {
  let assetId = helper.readFile(
    path.join(process.cwd(), "csMigrationData/assets/assets.json")
  );
  let type = "reference";
  let uid = "reference" + Math.floor(Math.random() * 100000000000000);
  let children = [];
  let attrs = {};
  if (obj.data.target.sys.id in assetId) {
    attrs = {
      "display-type": "link",
      type: "asset",
      "class-name": "embedded-entry redactor-component undefined-entry",
      "asset-uid": obj.data.target.sys.id,
      "content-type-uid": "sys_assets",
      target: "_blank",
      href: assetId[obj.data.target.sys.id].url,
    };
  }
  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  children = children.map((c) => {
    return c;
  });

  return { uid, type, attrs, children };
}

function parseEntryHyperlink(obj, lang) {
  let entryId = helper.readFile(
    path.join(process.cwd(), "csMigrationData/rteReferences/rteReferences.json")
  );

  let type, uid, children, attrs;
  type = "reference";
  uid = "reference" + Math.floor(Math.random() * 100000000000000);
  children = [];
  attrs = {};

  for (const [arrayKey, arrayValue] of Object.entries(entryId)) {
    for (const [accessKey, accessValue] of Object.entries(arrayValue)) {
      if (accessKey === obj.data.target.sys.id) {
        attrs = {
          "display-type": "block",
          type: "entry",
          "class-name": "embedded-entry redactor-component block-entry",
          "entry-uid": accessKey,
          locale: arrayKey,
          "content-type-uid": accessValue._content_type_uid,
        };
      }
    }
  }
  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  children = children.map((c) => {
    return c;
  });

  return { uid, type, attrs, children };
}

function parseHyperlink(obj) {
  let type = "a";
  let uid = "a" + Math.floor(Math.random() * 100000000000000);
  let children = [];
  let attrs = {
    url: obj.data.uri,
    target: "_blank",
  };
  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  children = children.map((c) => {
    return c;
  });

  return { uid, type, attrs, children };
}

module.exports = jsonParse = (data, lang) => {
  return convert(data, lang);
};
