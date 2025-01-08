var idArray = require('../utils/restrcitedKeyWords.json');

// for Singleline
function singleLine(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data.id;
  }
  let defaultText;
  if (data.defaultValue) {
    defaultText = Object.values(data.defaultValue)[0];
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    data_type: 'text',
    display_name: data.name,
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    field_metadata: {
      description: description || '',
      default_value: defaultText ?? '',
      _default:
        newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`) ===
          'title' ||
        newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`) ===
          'url'
          ? true
          : undefined,
    },
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    mandatory:
      newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`) ===
        'title' ||
      newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`) === 'url'
        ? true
        : data?.required ?? false,
    multiple: false,
    non_localizable: !(data?.localized === true) || false,
    unique:
      newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`) ===
        'title' ||
      newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`) === 'url'
        ? true
        : uniqueValue ?? false,
  };
}

// for Multiline
function multiLine(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data.id;
  }
  let defaultText;
  if (data.defaultValue) {
    defaultText = Object.values(data.defaultValue)[0];
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    data_type: 'text',
    display_name: data.name,
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    field_metadata: {
      description: description,
      default_value: defaultText ?? '',
      multiline: true,
    },
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    mandatory: data?.required ?? false,
    multiple: false,
    non_localizable: !(data?.localized === true) || false,
    unique: uniqueValue ?? false,
  };
}

// for RichText
function richText(data) {
  let rFields = [];
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
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
  referenceFields.push('sys_assets');

  let defaultText;
  if (data.defaultValue) {
    defaultText = Object.values(data.defaultValue)[0];
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  return {
    data_type: 'json',
    display_name: data.name,
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    field_metadata: {
      allow_json_rte: true,
      embed_entry: true,
      rich_text_type: 'advanced',
      multiline: true,
      description: defaultText ?? '',
      default_value: '',
      options: [],
      ref_multiple_content_types: true,
    },
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    reference_to: referenceFields,
    multiple: false,
    non_localizable: !(data?.localized === true) || false,
    unique: uniqueValue ?? false,
    mandatory: data?.required ?? false,
  };
}

// for Markdown
function markdown(data) {
  let defaultText;
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data.id;
  }
  if (data.defaultValue) {
    defaultText = Object.values(data.defaultValue)[0];
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    data_type: 'text',
    display_name: data.name,
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    field_metadata: {
      description: description || '',
      markdown: true,
      placeholder: defaultText ?? '',
      instruction: '',
    },
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    mandatory: data?.required ?? false,
    multiple: false,
    non_localizable: !(data?.localized === true) || false,
    unique: uniqueValue ?? false,
  };
}

// for select option but Text type dropdown
function dropdownText(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data.id;
  }
  let choices = [];
  if (data.validations.length === 0 || data.validations.length === undefined) {
    choices.push({ value: 'value', key: 'key' });
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

  let defaultValue;
  let defaultKey;

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
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    data_type: 'text',
    display_name: data.name,
    display_type: 'dropdown',
    enum: {
      advanced: true,
      choices: choices,
    },
    multiple: false,
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    field_metadata: {
      description: description || '',
      default_value: defaultValue ?? '',
      default_key: defaultKey ?? '',
    },
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    mandatory: data?.required ?? false,
    non_localizable: !(data?.localized === true) || false,
    unique: uniqueValue ?? false,
  };
}

// for select option but Number type dropdown
function dropdownNumber(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
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
    defaultValue = Object.values(data.defaultValue).join('');
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    data_type: 'number',
    display_name: data.name,
    display_type: 'dropdown',
    enum: {
      advanced: true,
      choices: choices,
    },
    multiple: false,
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    field_metadata: {
      description: description || '',
      default_value: defaultValue ?? '',
      default_key: defaultKey ?? '',
    },
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    mandatory: data?.required ?? false,
    non_localizable: !(data?.localized === true) || false,
    unique: uniqueValue ?? false,
  };
}

// for radio option but Text type radio
function radioText(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data.id;
  }
  let choices = [];
  if (data.validations.length === 0 || data.validations.length === undefined) {
    choices.push({ value: 'value', key: 'key' });
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

  let defaultValue;
  let defaultKey;

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
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    data_type: 'text',
    display_name: data.name,
    display_type: 'radio',
    enum: {
      advanced: true,
      choices: choices,
    },
    multiple: false,
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    field_metadata: {
      description: description || '',
      default_value: defaultValue ?? '',
      default_key: defaultKey ?? '',
    },
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    mandatory: data?.required ?? false,
    non_localizable: !(data?.localized === true) || false,
    unique: uniqueValue ?? false,
  };
}

// for radio option but Number type radio
function radioNumber(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
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
    defaultValue = Object.values(data.defaultValue).join('');
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    data_type: 'number',
    display_name: data.name,
    display_type: 'radio',
    enum: {
      advanced: true,
      choices: choices,
    },
    multiple: false,
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    field_metadata: {
      description: description || '',
      default_value: defaultValue ?? '',
      default_key: defaultKey ?? '',
    },
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    mandatory: data?.required ?? false,
    non_localizable: !(data?.localized === true) || false,
    unique: uniqueValue ?? false,
  };
}

// for checbox
function checkbox(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data.id;
  }
  let choices = [];
  if (
    data.items.validations.length === 0 ||
    data.items.validations.length === undefined
  ) {
    choices.push({ value: 'value', key: 'key' });
  } else {
    for (const value of Object.values(data.items.validations)[0].in) {
      choices.push({
        value: `${value}`,
        key: `${value}`,
      });
    }
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    data_type: 'text',
    display_name: data.name,
    display_type: 'checkbox',
    enum: {
      advanced: true,
      choices: choices,
    },
    multiple: true,
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    field_metadata: {
      description: description || '',
      default_value: '',
      default_key: '',
    },
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    mandatory: data?.required ?? false,
    non_localizable: !(data?.localized === true) || false,
    unique: uniqueValue ?? false,
  };
}

// for Number
function number(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data.id;
  }

  let defaultText, min, max;
  if (data.defaultValue) {
    defaultText = Object.values(data.defaultValue)[0];
  }

  for (const value of data.validations) {
    if (value.range !== undefined) {
      min = value.range.min;
      max = value.range.max;
    }
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  let custom = {
    data_type: 'number',
    display_name: data.name,
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    field_metadata: {
      description: description || '',
      default_value: defaultText ?? '',
    },
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    mandatory: data?.required ?? false,
    multiple: false,
    non_localizable: !(data?.localized === true) || false,
    unique: uniqueValue ?? false,
  };

  // Check if min and max values are present
  if (min !== undefined) {
    custom.min = min;
  }
  if (max !== undefined) {
    custom.max = max;
  }

  return custom;
}

// for Boolean
function boolean(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data.id;
  }
  let defaultText;
  if (data.defaultValue) {
    defaultText = Object.values(data.defaultValue)[0];
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    data_type: 'boolean',
    display_name: data.name,
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    field_metadata: {
      description: description || '',
      default_value: defaultText ?? '',
    },
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    multiple: false,
    mandatory: data?.required ?? false,
    unique: uniqueValue ?? false,
  };
}

// for Date
function date(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data.id;
  }
  let defaultText;
  if (data.defaultValue) {
    defaultText = Object.values(data.defaultValue)[0];
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    data_type: 'isodate',
    display_name: data.name,
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    startDate: null,
    endDate: null,
    field_metadata: {
      description: description || '',
      default_value: defaultText ?? '',
    },
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    multiple: false,
    mandatory: data?.required ?? false,
    unique: uniqueValue ?? false,
  };
}

// for files
function files(data) {
  let replaceid, newId, singleRef;

  // checking for single image
  if (data.widgetId === 'assetLinkEditor') {
    singleRef = false;
  } else {
    singleRef = true;
  }
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data.id;
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    data_type: 'file',
    display_name: data.name,
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    extensions: [],
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    field_metadata: { description: description || '' },
    mandatory: data?.required ?? false,
    multiple: singleRef,
    non_localizable: !(data?.localized === true) || false,
    unique: uniqueValue ?? false,
  };
}

// for URL
function link(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data.id;
  }

  let defaultText, defaultTitle;
  if (data.defaultValue) {
    defaultTitle = data.name;
    defaultText = Object.values(data.defaultValue)[0];
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    data_type: 'link',
    display_name: data.name,
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    field_metadata: {
      description: description || '',
      default_value: {
        title: defaultTitle ?? '',
        url: defaultText ?? '',
      },
    },
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    multiple: false,
    mandatory: data?.required ?? false,
    unique: uniqueValue ?? false,
  };
}

// for Reference
function reference(data) {
  let singleRef;
  // checking for single refernece
  if (
    data.widgetId === 'entryLinkEditor' ||
    data.widgetId === 'entryCardEditor'
  ) {
    singleRef = false;
  } else {
    singleRef = true;
  }
  let replaceid, newId, referenceFields;
  let newRef = [];

  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data.id;
  }

  if (!data.items) {
    if (data.validations.length > 0) {
      for (const entries of data.validations) {
        if (
          entries?.linkContentType !== undefined &&
          entries?.linkContentType !== null &&
          entries?.linkContentType.length > 0
        ) {
          const commonRef = entries.linkContentType.filter(
            (e) =>
              data.contentNames.indexOf(
                e.replace(/([A-Z])/g, '_$1').toLowerCase()
              ) !== -1
          );
          for (const entry of commonRef) {
            newRef.push(entry.replace(/([A-Z])/g, '_$1').toLowerCase());
          }
          if (!commonRef.length > 0) {
            newRef.push(...data.contentNames.slice(0, 9));
          }
          referenceFields = newRef;
        } else {
          if (data.contentNames.length < 10) {
            referenceFields = data.contentNames;
          } else {
            referenceFields = data.contentNames.slice(0, 9);
          }
        }
      }
    } else {
      if (data.contentNames.length < 10) {
        referenceFields = data.contentNames;
      } else {
        referenceFields = data.contentNames.slice(0, 9);
      }
    }
  } else {
    // console.log('data.items is defined', data);
    if (data?.items.validations[0] !== undefined) {
      const commonRef = data.items.validations[0].linkContentType.filter(
        (e) =>
          data.contentNames.indexOf(
            e.replace(/([A-Z])/g, '_$1').toLowerCase()
          ) !== -1
      );
      for (const entry of commonRef) {
        newRef.push(entry.replace(/([A-Z])/g, '_$1').toLowerCase());
      }
      if (!commonRef.length > 0) {
        newRef.push(...data.contentNames.slice(0, 9));
      }
      // for (const ref of data.items.validations[0].linkContentType) {
      //   newRef.push(ref.replace(/([A-Z])/g, "_$1").toLowerCase());
      // }
      referenceFields = newRef;
    } else {
      if (data?.validations.length > 0) {
        for (const entries of data.validations) {
          if (
            entries?.linkContentType !== undefined &&
            entries?.linkContentType !== null &&
            entries?.linkContentType.length > 0
          ) {
            referenceFields = entries?.linkContentType;
          } else {
            if (data.contentNames.length < 10) {
              referenceFields = data.contentNames;
            } else {
              referenceFields = data.contentNames.slice(0, 9);
            }
          }
        }
      } else {
        if (data.contentNames.length < 10) {
          referenceFields = data.contentNames;
        } else {
          referenceFields = data.contentNames.slice(0, 9);
        }
      }
    }
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    data_type: 'reference',
    display_name: data.name,
    reference_to: referenceFields,
    field_metadata: {
      description: description || '',
      ref_multiple: singleRef,
      ref_multiple_content_types: true,
    },
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    mandatory: data?.required ?? false,
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    multiple: singleRef,
    non_localizable: !(data?.localized === true) || false,
    unique: uniqueValue ?? false,
  };
}

function url(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data.id;
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    data_type: 'text',
    display_name: data.name,
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    field_metadata: { description: description || '', _default: true },
    multiple: false,
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    unique: uniqueValue ?? false,
    mandatory: data?.required ?? false,
    non_localizable: !(data?.localized === true) || false,
  };
}

// we don't have location field in contantstack so we used Group field with number field in ir
function location(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data.id;
  }
  let uniqueValue;
  for (const validationValue of data.validations) {
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    data_type: 'group',
    display_name: data.name,
    field_metadata: {
      description: description || '',
      instruction: '',
    },
    schema: [
      {
        data_type: 'number',
        display_name: 'lat',
        uid: 'lat',
        field_metadata: {
          description: description || '',
          default_value: '',
        },
        mandatory: data?.required ?? false,
        multiple: false,
        non_localizable: !(data?.localized === true) || false,
        unique: false,
      },
      {
        data_type: 'number',
        display_name: 'lon',
        uid: 'lon',
        field_metadata: {
          description: description || '',
          default_value: '',
        },
        mandatory: data?.required ?? false,
        multiple: false,
        non_localizable: !(data?.localized === true) || false,
        unique: false,
      },
    ],
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    mandatory: data?.required ?? false,
    multiple: false,
    non_localizable: !(data?.localized === true) || false,
    unique: uniqueValue ?? false,
  };
}

// we don't have rating so we have used dropdown
function rating(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
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
        value <= Object.values(data.defaultValue).join('');
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
    defaultValue = Object.values(data.defaultValue).join('');
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    data_type: 'number',
    display_name: data.name,
    display_type: 'dropdown',
    enum: {
      advanced: true,
      choices: choices,
    },
    multiple: false,
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    field_metadata: {
      description: description || '',
      default_value: defaultValue ?? '',
      default_key: defaultKey ?? '',
    },
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    mandatory: data?.required ?? false,
    non_localizable: !(data?.localized === true) || false,
    unique: uniqueValue ?? false,
  };
}

// for JSON Object
function jsonObject(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data.id;
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    display_name: data.name,
    extension_uid: 'jsonobject_extension',
    field_metadata: { extension: true, description: description || '' },
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    mandatory: data?.required ?? false,
    multiple: false,
    non_localizable: !(data?.localized === true) || false,
    unique: uniqueValue ?? false,
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    config: {},
    data_type: 'json',
  };
}

// for List view
function tagEditor(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data.id;
  }

  let regrexValue;
  let uniqueValue;
  let validationErrorMessage;
  for (const validationValue of data.validations) {
    regrexValue = validationValue?.regexp?.pattern;
    validationErrorMessage = validationValue?.message;
    uniqueValue = validationValue?.unique;
  }

  let description = data?.settings?.helpText || data?.contentDescription || '';
  if (description.length > 255) {
    description = description.slice(0, 255);
  }

  return {
    display_name: data.name,
    extension_uid: 'listview_extension',
    field_metadata: { extension: true, description: description || '' },
    uid: newId.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`),
    mandatory: data?.required ?? false,
    non_localizable: !(data?.localized === true) || false,
    unique: uniqueValue ?? false,
    format: regrexValue ?? '',
    error_messages: { format: validationErrorMessage ?? '' },
    config: {},
    data_type: 'json',
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
