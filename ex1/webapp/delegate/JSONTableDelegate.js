sap.ui.define([
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/ui/core/Core",
	"mdc/tutorial/model/metadata/JSONPropertyInfo"
], function (TableDelegate, Column, Text, Core, JSONPropertyInfo) {
	"use strict";

	const JSONTableDelegate = Object.assign({}, TableDelegate);

	JSONTableDelegate.fetchProperties = async () =>
		JSONPropertyInfo.filter((oPI) => oPI.name !== "$search");

	const _createColumn = (sId, oPropertyInfo) => {
		const sPropertyName = oPropertyInfo.name;
		return new Column(sId, {
			propertyKey: sPropertyName,
			header: oPropertyInfo.label,
			template: new Text({
				text: {
					path: "mountains>" + sPropertyName,
					type: oPropertyInfo.dataType
				}
			})
		});
	};

	JSONTableDelegate.addItem = async (oTable, sPropertyName) => {
		const oPropertyInfo = JSONPropertyInfo.find((oPI) => oPI.name === sPropertyName);
		const sId = oTable.getId() + "---col-" + sPropertyName;
		return Core.byId(sId) ?? await _createColumn(sId, oPropertyInfo);
	};

	JSONTableDelegate.updateBindingInfo = (oTable, oBindingInfo) => {
		TableDelegate.updateBindingInfo.call(JSONTableDelegate, oTable, oBindingInfo);
		oBindingInfo.path = oTable.getPayload().bindingPath;
		oBindingInfo.templateShareable = true;
	};

	return JSONTableDelegate;
}, /* bExport= */false);