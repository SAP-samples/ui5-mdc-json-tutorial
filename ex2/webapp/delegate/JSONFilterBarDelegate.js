sap.ui.define([
	"sap/ui/mdc/FilterBarDelegate",
	"mdc/tutorial/model/metadata/JSONPropertyInfo",
	"sap/ui/mdc/FilterField",
	"sap/ui/core/Core"
], function (FilterBarDelegate, JSONPropertyInfo, FilterField, Core) {
	"use strict";

	const JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate);

	JSONFilterBarDelegate.fetchProperties = async () => JSONPropertyInfo;

	const _createFilterField = (sId, oProperty, oFilterBar) => {
		const sPropertyName = oProperty.name;
		const oFilterField = new FilterField(sId, {
			dataType: oProperty.dataType,
			conditions: "{$filters>/conditions/" + sPropertyName + '}',
			propertyKey: sPropertyName,
			required: oProperty.required,
			label: oProperty.label,
			maxConditions: oProperty.maxConditions,
			delegate: {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {}}
		});
		return oFilterField;
	};

	JSONFilterBarDelegate.addItem = async (oFilterBar, sPropertyName) => {
		const oProperty = JSONPropertyInfo.find((oPI) => oPI.name === sPropertyName);
		const sId = oFilterBar.getId() + "--filter--" + sPropertyName;
		return Core.byId(sId) ?? await _createFilterField(sId, oProperty, oFilterBar);
	};
	return JSONFilterBarDelegate;
}, /* bExport= */false);