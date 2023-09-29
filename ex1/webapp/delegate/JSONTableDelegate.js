sap.ui.define([
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/ui/core/Core",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"mdc/tutorial/model/metadata/JSONPropertyInfo"
], function (
	TableDelegate, Column, Text,
	Core, Filter, FilterOperator, JSONPropertyInfo) {
	"use strict";

	const JSONTableDelegate = Object.assign({}, TableDelegate);

	JSONTableDelegate.fetchProperties = function () {
		return Promise.resolve(JSONPropertyInfo.filter((oPropertyInfo) => oPropertyInfo.name !== "$search"));
	};

	JSONTableDelegate.addItem = function (oTable, sPropertyName) {
		const oPropertyInfo = JSONPropertyInfo.find((oPropertyInfo) => oPropertyInfo.name === sPropertyName);
		return Promise.resolve(_addColumn(oPropertyInfo, oTable));
	};

	function _addColumn(oPropertyInfo, oTable) {
		const sName = oPropertyInfo.name;
		const sId = oTable.getId() + "---col-" + sName;
		let oColumn = Core.byId(sId);
		if (!oColumn) {
			oColumn = new Column(sId, {
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
		return oColumn;
	}

	JSONTableDelegate.removeItem = function(oTable, oColumn) {
		oColumn.destroy();
		return Promise.resolve(true);
	};

	JSONTableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		TableDelegate.updateBindingInfo.apply(this, arguments);
		oBindingInfo.path = oTable.getPayload().bindingPath;
	};

	return JSONTableDelegate;
}, /* bExport= */false);
