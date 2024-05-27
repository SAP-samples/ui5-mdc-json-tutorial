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
    return JSONPropertyInfo.filter(p => p.key !== "$search");
  };
  const _createColumn = (propertyInfo, table) => {
    const name = propertyInfo.key;
    const id = table.getId() + "---col-" + name;
    const column = Element.getElementById(id);
    return column ?? new Column(id, {
      propertyKey: name,
      header: propertyInfo.label,
      template: new Text({
        text: {
          path: "mountains>" + name,
          type: propertyInfo.dataType
        }
      })
    });
  };
  JSONTableDelegate.addItem = async (table, propertyKey) => {
    const propertyInfo = JSONPropertyInfo.find(p => p.key === propertyKey);
    return _createColumn(propertyInfo, table);
  };
  JSONTableDelegate.updateBindingInfo = (table, bindingInfo) => {
    TableDelegate.updateBindingInfo.call(JSONTableDelegate, table, bindingInfo);
    bindingInfo.path = table.getPayload().bindingPath;
    bindingInfo.templateShareable = true;
  };
  const _createSearchFilters = (search, keys) => {
    const filters = keys.map(key => new Filter({
      path: key,
      operator: FilterOperator.Contains,
      value1: search
    }));
    return [new Filter(filters, false)];
  };
  JSONTableDelegate.getFilters = table => {
    const search = Element.getElementById(table.getFilter()).getSearch();
    const keys = table.getPayload().searchKeys;
    let filters = TableDelegate.getFilters(table);
    if (search && keys) {
      filters = filters.concat(_createSearchFilters(search, keys));
    }
    return filters;
  };
  return JSONTableDelegate;
});
//# sourceMappingURL=JSONTableDelegate-dbg.js.map
