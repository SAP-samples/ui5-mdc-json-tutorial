"use strict";

sap.ui.define([], function () {
  "use strict";

  /**
   * @namespace mdc.tutorial.model.metadata
   *
   * Property Example:
   * {
   * 	  "rank": 1,
   * 	  "name": "Mount Everest",
   * 	  "height": 8848,
   * 	  "prominence": 8848,
   * 	  "range": "Mahalangur Himalaya",
   * 	  "coordinates": "27°59'17''N 86°55'31''E",
   * 	  "parent_mountain": "-",
   * 	  "first_ascent": 1953,
   * 	  "countries": "Nepal, China"
   * }
   */
  var __exports = [{
    key: "rank",
    label: "Rank",
    visible: true,
    path: "rank",
    dataType: "sap.ui.model.type.Integer"
  }, {
    key: "name",
    label: "Name",
    visible: true,
    path: "name",
    dataType: "sap.ui.model.type.String"
  }, {
    key: "height",
    label: "Height",
    visible: true,
    path: "height",
    dataType: "sap.ui.model.type.Integer"
  }, {
    key: "prominence",
    label: "Prominence",
    visible: true,
    path: "prominence",
    dataType: "sap.ui.model.type.Integer"
  }, {
    key: "range",
    label: "Range",
    visible: true,
    path: "range",
    dataType: "sap.ui.model.type.String"
  }, {
    key: "coordinates",
    label: "Coordinates",
    visible: true,
    path: "coordinates",
    dataType: "sap.ui.model.type.String"
  }, {
    key: "parent_mountain",
    label: "Parent Mountain",
    visible: true,
    path: "parent_mountain",
    dataType: "sap.ui.model.type.String"
  }, {
    key: "first_ascent",
    label: "First Ascent",
    visible: true,
    path: "first_ascent",
    dataType: "sap.ui.model.type.Integer"
  }, {
    key: "countries",
    label: "Countries",
    visible: true,
    path: "countries",
    dataType: "sap.ui.model.type.String"
  }, {
    key: "$search",
    label: "Search",
    visible: true,
    maxConditions: 1,
    dataType: "sap.ui.model.type.String"
  }];
  return __exports;
});
//# sourceMappingURL=JSONPropertyInfo-dbg.js.map
