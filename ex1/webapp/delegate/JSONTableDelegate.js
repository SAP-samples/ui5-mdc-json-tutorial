sap.ui.define([
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/ui/core/Core",
	"mdc/tutorial/model/metadata/JSONPropertyInfo"
], function (
	TableDelegate, Column, Text, Core, JSONPropertyInfo) {
	"use strict";

	const JSONTableDelegate = Object.assign({}, TableDelegate);

	JSONTableDelegate.fetchProperties = async () =>
		JSONPropertyInfo.filter((oPI) => oPI.name !== "$search");

	JSONTableDelegate.addItem = async (oTable, sPropertyName) => {
		const oPropertyInfo = JSONPropertyInfo.find(oPI => oPI.name === sPropertyName);
		const sId = oTable.getId() + "---col-" + sName;
		return Core.byId(sId) ??_createColumn(oPropertyInfo);
	};

	const _createColumn = async oPropertyInfo => {
		const sName = oPropertyInfo.name;
		return new Column(sId, {
			propertyKey: sName,
			header: oPropertyInfo.label,
			template: new Text({
				text: {
					path: "mountains>" + sName,
					type: oPropertyInfo.dataType
				}
			})
		});
	}

	JSONTableDelegate.removeItem = async (oTable, oColumn) => {
		oColumn.destroy();
		return true; // allow default handling
	};

	JSONTableDelegate.updateBindingInfo = (oTable, oBindingInfo) => {
		TableDelegate.updateBindingInfo(oTable, oBindingInfo);
		oBindingInfo.path = oTable.getPayload().bindingPath;
	};

	return JSONTableDelegate;
}, /* bExport= */false);