const {
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
  reference,
  url,
  checkbox,
  location,
  rating,
  jsonObject,
  tagEditor,
} = require("./contentstackSchema");

function contentTypeMapper(data) {
  const schemaArray = [];
  for (const type of data) {
    switch (type.type) {
      case "RichText":
        schemaArray.push(richText(type));
        break;
      case "Symbol":
        switch (type.widgetId) {
          case "singleLine":
            schemaArray.push(singleLine(type));
            break;
          case "urlEditor":
            schemaArray.push(url(type));
            break;
          case "dropdown":
            schemaArray.push(dropdownText(type));
            break;
          case "radio":
            schemaArray.push(radioText(type));
            break;
          case "slugEditor":
            schemaArray.push(url(type));
          default:
            break;
        }
        break;
      case "Text":
        switch (type.widgetId) {
          case "singleLine":
            schemaArray.push(singleLine(type));
            break;
          case "multipleLine":
            schemaArray.push(multiLine(type));
            break;
          case "markdown":
            schemaArray.push(markdown(type));
            break;
          case "dropdown":
            schemaArray.push(dropdown(type));
            break;
          case "radio":
            schemaArray.push(radioText(type));
            break;
          default:
            break;
        }
        break;
      case "Integer":
        switch (type.widgetId) {
          case "numberEditor":
            schemaArray.push(number(type));
            break;
          case "dropdown":
            schemaArray.push(dropdownNumber(type));
            break;
          case "radio":
            schemaArray.push(radioNumber(type));
            break;
          case "rating":
            schemaArray.push(rating(type));
            break;
          default:
            break;
        }
        break;
      case "Number":
        switch (type.widgetId) {
          case "numberEditor":
            schemaArray.push(number(type));
            break;
          case "dropdown":
            schemaArray.push(dropdownNumber(type));
            break;
          case "radio":
            schemaArray.push(radioNumber(type));
            break;
          case "rating":
            schemaArray.push(rating(type));
            break;
          default:
            break;
        }
        break;
      case "Date":
        schemaArray.push(date(type));
        break;
      case "Array":
        switch (type.widgetId) {
          case "assetLinksEditor":
            schemaArray.push(files(type));
            break;
          case "assetGalleryEditor":
            schemaArray.push(files(type));
            break;
          case "entryLinksEditor":
            schemaArray.push(reference(type));
            break;
          case "checkbox":
            schemaArray.push(checkbox(type));
            break;
          case "tagEditor":
            schemaArray.push(tagEditor(type));
            break;
          default:
            break;
        }
        break;
      case "Link":
        switch (type.widgetId) {
          case "assetLinkEditor":
            schemaArray.push(files(type));
            break;
          case "assetGalleryEditor":
            schemaArray.push(files(type));
            break;
          case "entryLinkEditor":
            schemaArray.push(reference(type));
            break;
          case "entryCardEditor":
            schemaArray.push(reference(type));
            break;
          default:
            break;
        }
        break;
      case "Boolean":
        schemaArray.push(boolean(type));
        break;
      case "Object":
        schemaArray.push(jsonObject(type));
        break;
      case "Location":
        schemaArray.push(location(type));
        break;
      default:
        break;
    }
  }
  return schemaArray;
}
module.exports = { contentTypeMapper };
