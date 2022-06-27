var idArray = [
  "uid",
  "api_key",
  "created_at",
  "deleted_at",
  "updated_at",
  "tags_array",
  "klass_id",
  "applikation_id",
  "id",
  "_id",
  "ACL",
  "SYS_ACL",
  "DEFAULT_ACL",
  "app_user_object_uid",
  "built_io_upload",
  "__loc",
  "tags",
  "_owner",
  "_version",
  "toJSON",
  "save",
  "update",
  "domain",
  "share_account",
  "shard_app",
  "shard_random",
  "hook",
  "__indexes",
  "__meta",
  "created_by",
  "updated_by",
  "inbuilt_class",
  "tenant_id",
  "isSystemUser",
  "isApplicationUser",
  "isNew",
  "_shouldLean",
  "_shouldFilter",
  "options",
  "_version",
  "__v",
  "locale",
  "publish_details",
];

const _ = require("lodash");
// for Singleline
function singleLine(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }
  let defaultText;
  if (data.defaultValue) {
    defaultText = Object.values(data.defaultValue)[0];
  } else {
    defaultText = "";
  }
  return {
    data_type: "text",
    display_name: data.name,
    uid: newId.toLowerCase(),
    field_metadata: {
      description: "",
      default_value: defaultText,
    },
    format: "",
    error_messages: { format: "" },
    mandatory: false,
    multiple: false,
    non_localizable: false,
    unique: false,
  };
}

// for Multiline
function multiLine(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }
  let defaultText;
  if (data.defaultValue) {
    defaultText = Object.values(data.defaultValue)[0];
  } else {
    defaultText = "";
  }
  return {
    data_type: "text",
    display_name: data.name,
    uid: newId.toLowerCase(),
    field_metadata: {
      description: "",
      default_value: defaultText,
      multiline: true,
    },
    format: "",
    error_messages: { format: "" },
    mandatory: false,
    multiple: false,
    non_localizable: false,
    unique: false,
  };
}

// for RichText
function richText(data) {
  let rFields = [];
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }
  let referenceFields;
  for (const fields of data.contentNames) {
    rFields.push(fields);

    if (rFields.length < 9) {
      referenceFields = rFields;
    } else {
      referenceFields = rFields.slice(0, 9);
    }
  }
  rFields.push("sys_assets");

  let defaultText;
  if (data.defaultValue) {
    defaultText = Object.values(data.defaultValue)[0];
  } else {
    defaultText = "";
  }
  return {
    data_type: "json",
    display_name: data.name,
    uid: newId.toLowerCase(),
    field_metadata: {
      allow_json_rte: true,
      embed_entry: true,
      rich_text_type: "advanced",
      multiline: true,
      description: defaultText,
      default_value: "",
      options: [],
      ref_multiple_content_types: true,
    },
    format: "",
    error_messages: { format: "" },
    reference_to: referenceFields,
    multiple: false,
    non_localizable: false,
    unique: false,
    mandatory: false,
  };
}

// for Markdown
function markdown(data) {
  let defaultText;
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }
  if (data.defaultValue) {
    defaultText = Object.values(data.defaultValue)[0];
  } else {
    defaultText = "";
  }
  return {
    data_type: "text",
    display_name: data.name,
    uid: newId.toLowerCase(),
    field_metadata: {
      description: "",
      markdown: true,
      placeholder: defaultText,
      instruction: "",
    },
    mandatory: false,
    multiple: false,
    non_localizable: false,
    unique: false,
  };
}

// for select option but Text type dropdown
function dropdownText(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }
  let choices = [];
  if (data.validations.length === 0 || data.validations.length === undefined) {
    choices.push({ value: "value", key: "key" });
  } else {
    Object.values(data.validations).map((valid) => {
      if (valid.in) {
        for (const value of valid.in) {
          choices.push({
            value: `${value}`,
            key: `${value}`,
          });
        }
      }
    });
  }

  // for default value and key
  if (data.defaultValue !== undefined) {
    for (const [key, value] of Object.entries(data.defaultValue)) {
      for (const d_key of choices) {
        if (value == d_key.value) {
          defaultKey = d_key.key;
        }
      }
      defaultValue = value;
    }
  } else {
    defaultValue = "";
    defaultKey = "";
  }

  return {
    data_type: "text",
    display_name: data.name,
    display_type: "dropdown",
    enum: {
      advanced: true,
      choices: choices,
    },
    multiple: false,
    uid: newId.toLowerCase(),
    field_metadata: {
      description: "",
      default_value: defaultValue,
      default_key: defaultKey,
    },
    mandatory: false,
    non_localizable: false,
    unique: false,
  };
}

// for select option but Number type dropdown
function dropdownNumber(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }
  let choices = [],
    defaultValue,
    defaultKey;
  if (data.validations.length === 0 || data.validations.length === undefined) {
    choices.push({ value: 0, key: 0 });
  } else {
    Object.values(data.validations).map((valid) => {
      if (valid.in) {
        for (const value of valid.in) {
          choices.push({
            value: value,
            key: `${value}`,
          });
        }
      }
    });
  }

  // for default value and key
  if (data.validations.length !== 0) {
    for (const d_key of choices) {
      if (Object.values(data.defaultValue)[0] == d_key.value) {
        defaultKey = d_key.key;
      }
    }
    defaultValue = Object.values(data.defaultValue).join("");
  } else {
    defaultValue = "";
    defaultKey = "";
  }

  return {
    data_type: "number",
    display_name: data.name,
    display_type: "dropdown",
    enum: {
      advanced: true,
      choices: choices,
    },
    multiple: false,
    uid: newId.toLowerCase(),
    field_metadata: {
      description: "",
      default_value: defaultValue,
      default_key: defaultKey,
    },
    mandatory: false,
    non_localizable: false,
    unique: false,
  };
}

// for radio option but Text type radio
function radioText(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }
  let choices = [];
  if (data.validations.length === 0 || data.validations.length === undefined) {
    choices.push({ value: "value", key: "key" });
  } else {
    Object.values(data.validations).map((valid) => {
      if (valid.in) {
        for (const value of valid.in) {
          choices.push({
            value: `${value}`,
            key: `${value}`,
          });
        }
      }
    });
  }

  // for default value and key
  if (data.defaultValue !== undefined) {
    for (const [key, value] of Object.entries(data.defaultValue)) {
      for (const d_key of choices) {
        if (value == d_key.value) {
          defaultKey = d_key.key;
        }
      }
      defaultValue = value;
    }
  } else {
    defaultValue = "";
    defaultKey = "";
  }

  return {
    data_type: "text",
    display_name: data.name,
    display_type: "radio",
    enum: {
      advanced: true,
      choices: choices,
    },
    multiple: false,
    uid: newId.toLowerCase(),
    field_metadata: {
      description: "",
      default_value: defaultValue,
      default_key: defaultKey,
    },
    mandatory: false,
    non_localizable: false,
    unique: false,
  };
}

// for radio option but Number type radio
function radioNumber(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }
  let choices = [];
  if (data.validations.length === 0 || data.validations.length === undefined) {
    choices.push({ value: 0, key: 0 });
  } else {
    Object.values(data.validations).map((valid) => {
      if (valid.in) {
        for (const value of valid.in) {
          choices.push({
            value: value,
            key: `${value}`,
          });
        }
      }
    });
  }

  // for default value and key
  if (data.validations.length !== 0) {
    for (const d_key of choices) {
      if (Object.values(data.defaultValue)[0] == d_key.value) {
        defaultKey = d_key.key;
      }
    }
    defaultValue = Object.values(data.defaultValue).join("");
  } else {
    defaultValue = "";
    defaultKey = "";
  }

  return {
    data_type: "number",
    display_name: data.name,
    display_type: "radio",
    enum: {
      advanced: true,
      choices: choices,
    },
    multiple: false,
    uid: newId.toLowerCase(),
    field_metadata: {
      description: "",
      default_value: defaultValue,
      default_key: defaultKey,
    },
    mandatory: false,
    non_localizable: false,
    unique: false,
  };
}

// for checbox
function checkbox(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }
  let choices = [];
  if (
    data.items.validations.length === 0 ||
    data.items.validations.length === undefined
  ) {
    choices.push({ value: "value", key: "key" });
  } else {
    for (const value of Object.values(data.items.validations)[0].in) {
      choices.push({
        value: `${value}`,
        key: `${value}`,
      });
    }
  }

  return {
    data_type: "text",
    display_name: data.name,
    display_type: "checkbox",
    enum: {
      advanced: true,
      choices: choices,
    },
    multiple: true,
    uid: newId.toLowerCase(),
    field_metadata: {
      description: "",
      default_value: "",
      default_key: "",
    },
    mandatory: false,
    non_localizable: false,
    unique: false,
  };
}

// for Number
function number(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }

  let defaultText, min, max;
  if (data.defaultValue) {
    defaultText = Object.values(data.defaultValue)[0];
  } else {
    defaultText = "";
  }

  for (const value of data.validations) {
    if (value.range !== undefined) {
      min = value.range.min;
      max = value.range.max;
    } else {
      min = "";
      max = "";
    }
  }

  return {
    data_type: "number",
    display_name: data.name,
    uid: newId.toLowerCase(),
    field_metadata: { description: "", default_value: defaultText },
    mandatory: false,
    multiple: false,
    non_localizable: false,
    unique: false,
    min: min,
    max: max,
  };
}

// for Boolean
function boolean(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }
  let defaultText;
  if (data.defaultValue) {
    defaultText = Object.values(data.defaultValue)[0];
  } else {
    defaultText = "";
  }
  return {
    data_type: "boolean",
    display_name: data.name,
    uid: newId.toLowerCase(),
    field_metadata: {
      description: "",
      default_value: defaultText,
    },
    multiple: false,
    mandatory: false,
    unique: false,
  };
}

// for Date
function date(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }
  let defaultText;
  if (data.defaultValue) {
    defaultText = Object.values(data.defaultValue)[0];
  } else {
    defaultText = "";
  }
  return {
    data_type: "isodate",
    display_name: data.name,
    uid: newId.toLowerCase(),
    startDate: null,
    endDate: null,
    field_metadata: {
      description: "",
      default_value: defaultText,
    },
    multiple: false,
    mandatory: false,
    unique: false,
  };
}

// for files
function files(data) {
  let replaceid, newId, singleRef;

  // checking for single image
  if (data.widgetId === "assetLinkEditor") {
    singleRef = false;
  } else {
    singleRef = true;
  }
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }
  return {
    data_type: "file",
    display_name: data.name,
    uid: newId.toLowerCase(),
    extensions: [],
    field_metadata: { description: "" },
    mandatory: false,
    multiple: singleRef,
    non_localizable: false,
    unique: false,
  };
}

// for URL
function link(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }

  let defaultText, defaultTitle;
  if (data.defaultValue) {
    defaultTitle = data.name;
    defaultText = Object.values(data.defaultValue)[0];
  } else {
    defaultTitle = "";
    defaultText = "";
  }
  return {
    data_type: "link",
    display_name: data.name,
    uid: newId.toLowerCase(),
    field_metadata: {
      description: "",
      default_value: {
        title: defaultTitle,
        url: defaultText,
      },
    },
    multiple: false,
    mandatory: false,
    unique: false,
  };
}

// for Reference
function reference(data) {
  let singleRef;
  // checking for single refernece
  if (data.widgetId === "entryLinkEditor") {
    singleRef = false;
  } else {
    singleRef = true;
  }
  let replaceid, newId, referenceFields;
  let newRef = [];

  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }

  if (!data.items) {
    if (data.validations.length > 0) {
      for (const entries of data.validations) {
        if (
          entries.linkContentType !== undefined &&
          entries.linkContentType !== null &&
          entries.linkContentType.length > 0
        ) {
          const commonRef = entries.linkContentType.filter(
            (e) =>
              data.contentNames.indexOf(
                e.replace(/([A-Z])/g, "_$1").toLowerCase()
              ) !== -1
          );
          for (const entry of commonRef) {
            newRef.push(entry.replace(/([A-Z])/g, "_$1").toLowerCase());
          }
          referenceFields = newRef;
        }
      }
    } else {
      if (data.contentNames.length < 25) {
        referenceFields = data.contentNames;
      } else {
        referenceFields = data.contentNames.slice(0, 9);
      }
    }
  } else {
    if (data.items.validations[0] !== undefined) {
      for (const ref of data.items.validations[0].linkContentType) {
        newRef.push(ref.replace(/([A-Z])/g, "_$1").toLowerCase());
      }
      referenceFields = newRef;
    } else {
      if (data.validations.length > 0) {
        for (const entries of data.validations) {
          if (
            entries.linkContentType !== undefined &&
            entries.linkContentType !== null &&
            entries.linkContentType.length > 0
          ) {
            referenceFields = entries.linkContentType;
          }
        }
      } else {
        if (data.contentNames.length < 25) {
          referenceFields = data.contentNames;
        } else {
          referenceFields = data.contentNames.slice(0, 9);
        }
      }
    }
  }
  return {
    data_type: "reference",
    display_name: data.name,
    reference_to: referenceFields,
    field_metadata: {
      ref_multiple: singleRef,
      ref_multiple_content_types: true,
    },
    uid: newId.toLowerCase(),
    mandatory: false,
    multiple: singleRef,
    non_localizable: false,
    unique: false,
  };
}

function url(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }
  return {
    data_type: "text",
    display_name: data.name,
    uid: newId.toLowerCase(),
    field_metadata: { _default: true },
    multiple: false,
    unique: false,
    mandatory: false,
    non_localizable: false,
  };
}

// we don't have location field in contantstack so we used Group field with number field in ir
function location(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }
  return {
    data_type: "group",
    display_name: data.name,
    field_metadata: { description: "", instruction: "" },
    schema: [
      {
        data_type: "number",
        display_name: "lat",
        uid: "lat",
        field_metadata: { description: "", default_value: "" },
        mandatory: false,
        multiple: false,
        non_localizable: false,
        unique: false,
      },
      {
        data_type: "number",
        display_name: "lon",
        uid: "lon",
        field_metadata: { description: "", default_value: "" },
        mandatory: false,
        multiple: false,
        non_localizable: false,
        unique: false,
      },
    ],
    uid: newId.toLowerCase(),
    mandatory: false,
    multiple: false,
    non_localizable: false,
    unique: false,
  };
}

// we don't have rating so we have used dropdown
function rating(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }
  // console.log(data
  let choices = [],
    defaultValue,
    defaultKey;
  if (data.settings !== undefined) {
    for (var value = 0; value <= data.settings.stars; value++) {
      choices.push({
        value: value,
        key: `${value}`,
      });
    }
  } else {
    if (data.defaultValue !== undefined) {
      for (
        var value = 0;
        value <= Object.values(data.defaultValue).join("");
        value++
      ) {
        choices.push({
          value: value,
          key: `${value}`,
        });
      }
    } else {
      if (data.validations !== undefined) {
        for (const in_value of data.validations) {
          if (in_value.in !== undefined) {
            for (const value of in_value.in) {
              choices.push({
                value: value,
                key: `${value}`,
              });
            }
          }
        }
      } else {
        for (var value = 0; value <= 5; value++) {
          choices.push({
            value: value,
            key: `${value}`,
          });
        }
      }
    }
  }

  // for default value and key
  if (data.defaultValue.length !== 0) {
    for (const d_key of choices) {
      if (Object.values(data.defaultValue)[0] == d_key.value) {
        defaultKey = d_key.key;
      }
    }
    defaultValue = Object.values(data.defaultValue).join("");
  } else {
    defaultValue = "";
    defaultKey = "";
  }

  return {
    data_type: "number",
    display_name: data.name,
    display_type: "dropdown",
    enum: {
      advanced: true,
      choices: choices,
    },
    multiple: false,
    uid: newId.toLowerCase(),
    field_metadata: {
      description: "",
      default_value: defaultValue,
      default_key: defaultKey,
    },
    mandatory: false,
    non_localizable: false,
    unique: false,
  };
}

// for JSON Object
function jsonObject(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }
  return {
    display_name: data.name,
    extension_uid: "jsonobject_extension",
    field_metadata: { extension: true },
    uid: newId.toLowerCase(),
    mandatory: false,
    multiple: false,
    non_localizable: false,
    unique: false,
    config: {},
    data_type: "json",
  };
}

// for List view
function tagEditor(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, "_");
  } else {
    newId = data.id;
  }
  return {
    display_name: data.name,
    extension_uid: "listview_extension",
    field_metadata: { extension: true },
    uid: newId.toLowerCase(),
    mandatory: false,
    non_localizable: false,
    unique: false,
    config: {},
    data_type: "json",
    multiple: false,
  };
}

module.exports = {
  singleLine,
  multiLine,
  richText,
  markdown,
  dropdownText,
  dropdownNumber,
  radioText,
  radioNumber,
  number,
  boolean,
  date,
  files,
  link,
  reference,
  url,
  checkbox,
  location,
  rating,
  jsonObject,
  tagEditor,
};
