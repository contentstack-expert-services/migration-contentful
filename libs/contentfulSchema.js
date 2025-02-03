var idArray = require('../utils/restrcitedKeyWords.json');

// for Singleline
function singleLine(data) {
  let replaceid, newId;
  if (idArray.includes(data?.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }

  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// for Multiline
function multiLine(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }

  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// for RichText
function richText(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }

  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// for Markdown
function markdown(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }

  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// for select option but Text type dropdown
function dropdownText(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }

  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// for select option but Number type dropdown
function dropdownNumber(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }

  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// for radio option but Text type radio
function radioText(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }

  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// for radio option but Number type radio
function radioNumber(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }

  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// for checbox
function checkbox(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }

  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// for Number
function number(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }

  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// for Boolean
function boolean(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }

  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// for Date
function date(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }

  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// for files
function files(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }
  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// for URL
function link(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }

  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// for Reference
function reference(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }

  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

function url(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }
  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// we don't have location field in contantstack so we used Group field with number field in ir
function location(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }
  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// we don't have rating so we have used dropdown
function rating(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }

  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// for JSON Object
function jsonObject(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }
  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
  };
}

// for List view
function tagEditor(data) {
  let replaceid, newId;
  if (idArray.includes(data.id)) {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else if (data.id === 'title') {
    replaceid = data.id.replace(data.id, `${data.prefix}_${data.id}`);
    newId = replaceid.replace(/[^a-zA-Z0-9]+/g, '_');
  } else {
    newId = data?.id.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
  }
  return {
    field_name: data.name,
    contentful_field_id: data.id,
    contentstack_field_id: newId,
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
