sap.ui.define([
	"sap/ui/mdc/FilterBarDelegate",
	"mdc/tutorial/model/metadata/JSONPropertyInfo",
	"sap/ui/mdc/FilterField",
	"sap/ui/core/Core",
	"sap/ui/core/Fragment"
], function (FilterBarDelegate, JSONPropertyInfo, FilterField, Core, Fragment) {
	"use strict";

	const JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	JSONFilterBarDelegate.fetchProperties = async () => JSONPropertyInfo;

	JSONFilterBarDelegate.addItem = async (oFilterBar, sPropertyName) => {
		const oProperty = JSONPropertyInfo.find(oPI => oPI.name === sPropertyName);
		const sId = oFilterBar.getId() + "--filter--" + sPropertyName;
		return Core.byId(sId) ?? _createFilterField(sId, oProperty, oFilterBar);
	};

	JSONFilterBarDelegate.removeItem = async (oFilterBar, oFilterField) => {
		oFilterField.destroy();
		return true; // allow default handling
	};

	const _createFilterField = async (sId, oProperty, oFilterBar) => {
		const sName = oProperty.name;
		return new FilterField(sId, {
			dataType: oProperty.dataType,
			conditions: "{$filters>/conditions/" + sName + '}',
			propertyKey: sName,
			required: oProperty.required,
			label: oProperty.label,
			maxConditions: oProperty.maxConditions,
			delegate: {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {}},
		});
	}

	return JSONFilterBarDelegate;
}, /* bExport= */false);