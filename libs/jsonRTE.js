var helper = require("../utils/helper.js");
const path = require("path");
const _ = require("lodash");

var entryId = helper.readFile(
  path.join(
    process.cwd(),
    "contentfulMigrationData/rteReferences/rteReferences.json"
  )
);
var defaultLocale = helper.readFile(
  path.join(
    process.cwd(),
    "contentfulMigrationData/defaultLocale/defaultLocale.json"
  )
);

const parsers = new Map();

// once all the parsers are implemented don't need this check
parsers._get = parsers.get;

parsers.get = function (key) {
  if (this.has(key)) {
    return this._get(key);
  }
  return () =>
    console.warn(`Parser not implemented for: ${JSON.stringify(key)}`);
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
parsers.set("table", parseTable);
parsers.set("table-row", parseTableRow);
parsers.set("head-tr", parseHeadTR);
parsers.set("table-header-cell", parseTableHead);
parsers.set("tbody", parseTBody);
parsers.set("body-tr", parseBodyTR);
parsers.set("table-cell", parseTableBody);

function convert(obj, lang) {
  return parsers.get(obj.nodeType)(obj, lang);
}

function parseDocument(obj, lang) {
  let type = "doc";
  let uid = "doc" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [
    {
      type: "p",
      attrs: {},
      uid: "p" + Math.floor(Math.random() * 100000000000000),
      children: [{ text: "" }],
    },
  ];
  let _version = 1;
  obj.content.forEach((e) => {
    children.push(parsers.get(e.nodeType)(e, lang));
  });

  return {
    type,
    attrs,
    uid,
    children: children.filter((e) => !(e === null || e === undefined)),
    _version,
  };
}

function parseTable(obj) {
  let type = "table";
  let uid = "table" + Math.floor(Math.random() * 100000000000000);

  // to get the rows counts from contentful json rte table
  let rowCount = obj.content.map((e) => {
    return e;
  });

  // to get the columns counts from contentful json rte table
  let colDetails = obj.content.map((e) => {
    return e.content.length;
  });

  // to fetch max value from colDetails
  let colCount = Math.max(...colDetails);

  let attrs = {
    rows: rowCount.length,
    cols: colCount,
    colWidths: Array(colCount).fill(250), // creating the colCount no. of colWidths
  };

  let children = [];
  obj.content.forEach((e) => {
    children.push(parsers.get(e.nodeType)(e));
  });

  children.push(parsers.get("tbody")(obj));
  return {
    type,
    attrs,
    uid,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
}

function parseTableRow(obj) {
  var type = [];
  let attrs = {};
  let uid = "tabletype" + Math.floor(Math.random() * 100000000000000);
  let children = [];

  let typeCheck = [];
  obj.content.forEach((e) => {
    typeCheck = _.union([e.nodeType], e.nodeType);
  });

  if (typeCheck.join() === "table-header-cell") {
    type.push("thead");
    children.push(parsers.get("head-tr")(obj.content));
  }

  type = [...new Set(type)].join();
  if (children.length > 0) {
    children = children.filter((e) => !(e === null || e === undefined));
    return {
      type,
      attrs,
      uid,
      children: children.filter((e) => !(e === null || e === undefined)),
    };
  }
}

function parseHeadTR(obj) {
  let type = "tr";
  let attrs = {};
  let uid = "tr" + Math.floor(Math.random() * 100000000000000);
  let children = [];
  obj.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  return {
    type,
    attrs,
    uid,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
}

function parseTableHead(obj) {
  let type = "th";
  let attrs = {};
  let uid = "th" + Math.floor(Math.random() * 100000000000000);
  let children = [];
  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  return {
    type,
    attrs,
    uid,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
}

function parseTBody(obj) {
  let type = "tbody";
  let attrs = {};
  let uid = "tbody" + Math.floor(Math.random() * 100000000000000);
  let children = [];
  obj.content.forEach((e) => children.push(parsers.get("body-tr")(e)));
  return {
    type,
    attrs,
    uid,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
}

function parseBodyTR(obj) {
  let type = "tr";
  let attrs = {};
  let uid = "tr" + Math.floor(Math.random() * 100000000000000);
  let children = [];
  obj.content.forEach((e) => {
    if (e.nodeType === "table-cell") {
      children.push(parsers.get("table-cell")(e));
    }
  });

  if (children.length > 0)
    return {
      type,
      attrs,
      uid,
      children: children.filter((e) => !(e === null || e === undefined)),
    };
}

function parseTableBody(obj) {
  let type = "td";
  let attrs = {};
  let uid = "td" + Math.floor(Math.random() * 100000000000000);
  let children = [];
  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  if (children.length > 0)
    return {
      type,
      attrs,
      uid,
      children: children.filter((e) => !(e === null || e === undefined)),
    };
}

function parseParagraph(obj, lang) {
  let type = "p";
  let uid = "p" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [];

  obj.content.forEach((e) => {
    children.push(parsers.get(e.nodeType)(e, lang));
  });
  return {
    type,
    attrs,
    uid,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
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
  return {
    type,
    attrs,
    uid,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
}

function parseUL(obj) {
  let type = "ul";
  let uid = "ul" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [];
  let id = "ul" + Math.floor(Math.random() * 100000000000000);

  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  return {
    uid,
    type,
    children: children.filter((e) => !(e === null || e === undefined)),
    id,
    attrs,
  };
}

function parseOL(obj) {
  let type = "ol";
  let uid = "ol" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [];
  let id = "ul" + Math.floor(Math.random() * 100000000000000);

  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  return {
    uid,
    type,
    children: children.filter((e) => !(e === null || e === undefined)),
    id,
    attrs,
  };
}

function parseLI(obj) {
  let type = "li";
  let uid = "li" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [];

  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  // get rid of paragraph elements
  children = children.map((c) => c.children).flat();

  return {
    type,
    attrs,
    uid,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
}

function parseBlockReference(obj, lang) {
  let masterLocale = Object.values(defaultLocale)
    .map((localeId) => localeId.code)
    .join();
  let type, uid, children, attrs;

  type = "reference";
  uid = "reference" + Math.floor(Math.random() * 100000000000000);
  children = [{ text: "" }];
  attrs = {};

  if (masterLocale === lang) {
    for (const [arrayKey, arrayValue] of Object.entries(entryId)) {
      for (const [accessKey, accessValue] of Object.entries(arrayValue)) {
        if (accessKey === obj.data.target.sys.id && lang === arrayKey) {
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
  } else {
    for (const [arrayKey, arrayValue] of Object.entries(entryId)) {
      for (const [accessKey, accessValue] of Object.entries(arrayValue)) {
        if (accessKey === obj.data.target.sys.id && lang === arrayKey) {
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
  }
  return {
    uid,
    type,
    attrs,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
}

function parseInlineReference(obj, lang) {
  let masterLocale = Object.values(defaultLocale)
    .map((localeId) => localeId.code)
    .join();
  let type, uid, children, attrs;

  type = "reference";
  uid = "reference" + Math.floor(Math.random() * 100000000000000);
  children = [{ text: "" }];
  attrs = {};

  if (masterLocale === lang) {
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
  } else {
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
  }

  return {
    type,
    attrs,
    uid,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
}

function parseBlockAsset(obj) {
  let assetId = helper.readFile(
    path.join(process.cwd(), "contentfulMigrationData/assets/assets.json")
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

  return {
    type,
    attrs,
    uid,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
}

function parseBlockquote(obj) {
  let type = "blockquote";
  let uid = "blockquote" + Math.floor(Math.random() * 100000000000000);
  let attrs = {};
  let children = [];
  obj.content.forEach((e) => children.push(parsers.get(e.nodeType)(e)));
  children = children.map((c) => c.children).flat();

  return {
    type,
    attrs,
    uid,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
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
  return {
    type,
    attrs,
    uid,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
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
  return {
    type,
    attrs,
    uid,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
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
  return {
    type,
    attrs,
    uid,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
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
  return {
    type,
    attrs,
    uid,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
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
  return {
    type,
    attrs,
    uid,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
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
  return {
    type,
    attrs,
    uid,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
}

function parseAssetHyperlink(obj) {
  let assetId = helper.readFile(
    path.join(process.cwd(), "contentfulMigrationData/assets/assets.json")
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
  return {
    uid,
    type,
    attrs,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
}

function parseEntryHyperlink(obj, lang) {
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

  return {
    uid,
    type,
    attrs,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
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

  return {
    uid,
    type,
    attrs,
    children: children.filter((e) => !(e === null || e === undefined)),
  };
}

module.exports = jsonParse = (data, lang) => {
  return convert(data, lang);
};
