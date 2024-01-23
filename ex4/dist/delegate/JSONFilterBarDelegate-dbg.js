"use strict";

sap.ui.define(["sap/ui/mdc/FilterBarDelegate", "mdc/tutorial/model/metadata/JSONPropertyInfo", "sap/ui/mdc/FilterField", "sap/ui/core/Element", "sap/ui/core/Fragment", "./JSONBaseDelegate"], function (FilterBarDelegate, __JSONPropertyInfo, FilterField, Element, Fragment, __JSONBaseDelegate) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const JSONPropertyInfo = _interopRequireDefault(__JSONPropertyInfo);
  const JSONBaseDelegate = _interopRequireDefault(__JSONBaseDelegate);
  var JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate, JSONBaseDelegate);
  JSONFilterBarDelegate.fetchProperties = async () => JSONPropertyInfo;
  const _createValueHelp = async (oFilterBar, sPropertyName) => {
    const sPath = "mdc.tutorial.view.fragment.";
    const oValueHelp = await Fragment.load({
      name: sPath + oFilterBar.getPayload().valueHelp[sPropertyName]
    });
    oFilterBar.addDependent(oValueHelp);
    return oValueHelp;
  };
  const _createFilterField = async (sId, oProperty, oFilterBar) => {
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
    if (oFilterBar.getPayload().valueHelp[sPropertyName]) {
      const aDependents = oFilterBar.getDependents();
      let oValueHelp = aDependents.find(oD => oD.getId().includes(sPropertyName));
      oValueHelp ??= await _createValueHelp(oFilterBar, sPropertyName);
      oFilterField.setValueHelp(oValueHelp);
    }
    return oFilterField;
  };
  JSONFilterBarDelegate.addItem = async (oFilterBar, sPropertyName) => {
    const oProperty = JSONPropertyInfo.find(oPI => oPI.name === sPropertyName);
    const sId = `${oFilterBar.getId()}--filter--${sPropertyName}`;
    return Element.getElementById(sId) ?? (await _createFilterField(sId, oProperty, oFilterBar));
  };
  return JSONFilterBarDelegate;
});
//# sourceMappingURL=JSONFilterBarDelegate-dbg.js.map
