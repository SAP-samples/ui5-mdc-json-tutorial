"use strict";

sap.ui.define(["sap/ui/mdc/FilterBarDelegate", "mdc/tutorial/model/metadata/JSONPropertyInfo", "sap/ui/mdc/FilterField", "sap/ui/core/Element"], function (FilterBarDelegate, __JSONPropertyInfo, FilterField, Element) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const JSONPropertyInfo = _interopRequireDefault(__JSONPropertyInfo);
  var JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);
  JSONFilterBarDelegate.fetchProperties = async () => JSONPropertyInfo;
  const _createFilterField = (sId, oProperty, oFilterBar) => {
    const sPropertyName = oProperty.name;
    const oFilterField = new FilterField(sId, {
      dataType: oProperty.dataType,
      conditions: `{$filters>/conditions/${sPropertyName}}`,
      propertyKey: sPropertyName,
      required: oProperty.required,
      label: oProperty.label,
      maxConditions: oProperty.maxConditions,
      delegate: {
        name: "sap/ui/mdc/field/FieldBaseDelegate",
        payload: {}
      }
    });
    return oFilterField;
  };
  JSONFilterBarDelegate.addItem = async (oFilterBar, sPropertyName) => {
    const oProperty = JSONPropertyInfo.find(oPI => oPI.name === sPropertyName);
    const sId = `${oFilterBar.getId()}--filter--${sPropertyName}`;
    return Element.getElementById(sId) ?? _createFilterField(sId, oProperty, oFilterBar);
  };
  return JSONFilterBarDelegate;
});
//# sourceMappingURL=JSONFilterBarDelegate-dbg.js.map
