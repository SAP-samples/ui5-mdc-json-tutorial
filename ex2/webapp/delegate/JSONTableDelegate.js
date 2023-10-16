sap.ui.define([
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/ui/core/Core",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"mdc/tutorial/model/metadata/JSONPropertyInfo"
], function (
	TableDelegate, Column, Text, Core, Filter, FilterOperator, JSONPropertyInfo) {
	"use strict";

	const JSONTableDelegate = Object.assign({}, TableDelegate);

	JSONTableDelegate.fetchProperties = async () =>
		JSONPropertyInfo.filter((oPI) => oPI.name !== "$search");

	JSONTableDelegate.addItem = async (oTable, sPropertyName) => {
		const oPropertyInfo = JSONPropertyInfo.find(oPI => oPI.name === sPropertyName);
		const sId = oTable.getId() + "---col-" + sPropertyName;
		return Core.byId(sId) ??_createColumn(sId, oPropertyInfo);
	};

	const _createColumn = async (sId, oPropertyInfo) => {
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
	}

	JSONTableDelegate.removeItem = async (oTable, oColumn) => {
		oColumn.destroy();
		return true; // allow default handling
	};

	JSONTableDelegate.updateBindingInfo = (oTable, oBindingInfo) => {
		TableDelegate.updateBindingInfo.call(JSONTableDelegate, oTable, oBindingInfo);
		oBindingInfo.path = oTable.getPayload().bindingPath;
	};

	JSONTableDelegate.getFilters = oTable => {
		const sSearch = Core.byId(oTable.getFilter()).getSearch();
		const aKeys = oTable.getPayload().searchKeys;
		let aFilters = TableDelegate.getFilters(oTable)
		if (sSearch && aKeys) {
			aFilters = aFilters.concat(_createSearchFilters(sSearch, aKeys));
		}
		return aFilters;
	};

	const _createSearchFilters = (sSearch, aKeys) => {
		const aFilters = aKeys.map(aKey => new Filter({
			path: aKey,
			operator: FilterOperator.Contains,
			value1: sSearch
		}));
		return [new Filter(aFilters, false)];
	}

	return JSONTableDelegate;
}, /* bExport= */false);