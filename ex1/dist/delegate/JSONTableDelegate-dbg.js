"use strict";

sap.ui.define(["sap/ui/mdc/TableDelegate", "sap/m/Text", "sap/ui/core/Element", "mdc/tutorial/model/metadata/JSONPropertyInfo", "sap/ui/mdc/table/Column"], function (TableDelegate, Text, Element, __JSONPropertyInfo, Column) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const JSONPropertyInfo = _interopRequireDefault(__JSONPropertyInfo);
  const JSONTableDelegate = Object.assign({}, TableDelegate);
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
  return JSONTableDelegate;
});
//# sourceMappingURL=JSONTableDelegate-dbg.js.map
