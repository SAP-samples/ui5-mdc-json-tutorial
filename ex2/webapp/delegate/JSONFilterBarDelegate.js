sap.ui.define([
	"sap/ui/mdc/FilterBarDelegate",
	"mdc/tutorial/model/metadata/JSONPropertyInfo",
	"sap/ui/mdc/FilterField",
	"sap/ui/core/Core",
	"sap/ui/core/Fragment"
], function (FilterBarDelegate, JSONPropertyInfo, FilterField, Core, Fragment) {
	"use strict";

	const JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	JSONFilterBarDelegate.fetchProperties = function () {
		return Promise.resolve(JSONPropertyInfo);
	};

	JSONFilterBarDelegate.addItem = function(oFilterBar, sPropertyName) {
		const oProperty = JSONPropertyInfo.find((oPropertyInfo) => oPropertyInfo.name === sPropertyName);
		return _addFilterField(oProperty, oFilterBar);
	};

	JSONFilterBarDelegate.removeItem = function(oFilterBar, oFilterField) {
		oFilterField.destroy();
		return Promise.resolve(true);
	};

	function _addFilterField(oProperty, oFilterBar) {
		const sName = oProperty.name;
		const sFilterFieldId = oFilterBar.getId() + "--filter--" + sName;
		let oFilterField = Core.byId(sFilterFieldId);
		let pFilterField;

		if (oFilterField) {
			pFilterField = Promise.resolve(oFilterField);
		} else {
			oFilterField = new FilterField(sFilterFieldId, {
				dataType: oProperty.dataType,
				conditions: "{$filters>/conditions/" + sName + '}',
				propertyKey: sName,
				required: oProperty.required,
				label: oProperty.label,
				maxConditions: oProperty.maxConditions,
				delegate: { name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {} }
			});
			pFilterField = Promise.resolve(oFilterField);
		}
		return pFilterField;
	}

	return JSONFilterBarDelegate;
}, /* bExport= */false);