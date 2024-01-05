"use strict";

sap.ui.define(["sap/ui/mdc/TableDelegate", "sap/m/Text", "sap/ui/core/Element", "mdc/tutorial/model/metadata/JSONPropertyInfo", "sap/ui/mdc/table/Column", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "./JSONBaseDelegate"], function (TableDelegate, Text, Element, __JSONPropertyInfo, Column, Filter, FilterOperator, __JSONBaseDelegate) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const JSONPropertyInfo = _interopRequireDefault(__JSONPropertyInfo);
  const JSONBaseDelegate = _interopRequireDefault(__JSONBaseDelegate);
  const JSONTableDelegate = Object.assign({}, TableDelegate, JSONBaseDelegate);
  JSONTableDelegate.fetchProperties = async () => {
    return JSONPropertyInfo.filter(oPI => oPI.name !== "$search");
  };
  const _createColumn = (oPropertyInfo, oTable) => {
    const sName = oPropertyInfo.name;
    const sId = oTable.getId() + "---col-" + sName;
    return Element.getElementById(sId) ?? new Column(sId, {
      propertyKey: sName,
      header: oPropertyInfo.label,
      template: new Text({
        text: {
          path: "mountains>" + sName,
          type: oPropertyInfo.dataType
        }
      })
    });
  };
  JSONTableDelegate.addItem = async (oTable, sPropertyName) => {
    const oPropertyInfo = JSONPropertyInfo.find(oPI => oPI.name === sPropertyName);
    return _createColumn(oPropertyInfo, oTable);
  };
  JSONTableDelegate.updateBindingInfo = (oTable, oBindingInfo) => {
    TableDelegate.updateBindingInfo.call(JSONTableDelegate, oTable, oBindingInfo);
    oBindingInfo.path = oTable.getPayload().bindingPath;
    oBindingInfo.templateShareable = true;
  };
  const _createSearchFilters = (sSearch, aKeys) => {
    const aFilters = aKeys.map(aKey => new Filter({
      path: aKey,
      operator: FilterOperator.Contains,
      value1: sSearch
    }));
    return [new Filter(aFilters, false)];
  };
  JSONTableDelegate.getFilters = oTable => {
    const sSearch = Element.getElementById(oTable.getFilter()).getSearch();
    const aKeys = oTable.getPayload().searchKeys;
    let aFilters = TableDelegate.getFilters(oTable);
    if (sSearch && aKeys) {
      aFilters = aFilters.concat(_createSearchFilters(sSearch, aKeys));
    }
    return aFilters;
  };
  return JSONTableDelegate;
});
//# sourceMappingURL=JSONTableDelegate-dbg.js.map
