sap.ui.define(["sap/ui/mdc/FilterBarDelegate", "mdc/tutorial/model/metadata/JSONPropertyInfo", "sap/ui/mdc/FilterField", "sap/ui/core/Element"], function (FilterBarDelegate, __JSONPropertyInfo, FilterField, Element) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const JSONPropertyInfo = _interopRequireDefault(__JSONPropertyInfo);
  var JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);
  JSONFilterBarDelegate.fetchProperties = async () => JSONPropertyInfo;
  const _createFilterField = (id, property, filterBar) => {
    const propertyKey = property.key;
    const filterField = new FilterField(id, {
      dataType: property.dataType,
      conditions: `{$filters>/conditions/${propertyKey}}`,
      propertyKey: propertyKey,
      required: property.required,
      label: property.label,
      maxConditions: property.maxConditions,
      delegate: {
        name: "sap/ui/mdc/field/FieldBaseDelegate",
        payload: {}
      }
    });
    return filterField;
  };
  JSONFilterBarDelegate.addItem = async (filterBar, propertyKey) => {
    const property = JSONPropertyInfo.find(p => p.key === propertyKey);
    const id = `${filterBar.getId()}--filter--${propertyKey}`;
    const filterField = Element.getElementById(id);
    return filterField ?? _createFilterField(id, property, filterBar);
  };
  return JSONFilterBarDelegate;
});
//# sourceMappingURL=JSONFilterBarDelegate-dbg.js.map
