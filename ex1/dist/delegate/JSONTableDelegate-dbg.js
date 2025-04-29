sap.ui.define(["sap/ui/mdc/TableDelegate", "sap/m/Text", "sap/ui/core/Element", "mdc/tutorial/model/metadata/JSONPropertyInfo", "sap/ui/mdc/table/Column"], function (TableDelegate, Text, Element, __JSONPropertyInfo, Column) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const JSONPropertyInfo = _interopRequireDefault(__JSONPropertyInfo);
  const JSONTableDelegate = Object.assign({}, TableDelegate);
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
  return JSONTableDelegate;
});
//# sourceMappingURL=JSONTableDelegate-dbg.js.map
