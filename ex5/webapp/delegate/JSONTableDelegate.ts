import TableDelegate from "sap/ui/mdc/TableDelegate"
import Text from "sap/m/Text"
import Element from "sap/ui/core/Element"
import JSONPropertyInfo from "mdc/tutorial/model/metadata/JSONPropertyInfo"
import {default as Table, PropertyInfo as TablePropertyInfo} from "sap/ui/mdc/Table"
import Column from "sap/ui/mdc/table/Column"
import Filter from "sap/ui/model/Filter"
import FilterOperator from "sap/ui/model/FilterOperator"
import FilterBar from "sap/ui/mdc/FilterBar"

interface TablePayload {
	bindingPath: string
	searchKeys: string[]
}

const JSONTableDelegate = Object.assign({}, TableDelegate)

JSONTableDelegate.fetchProperties = async () => {
	return JSONPropertyInfo.filter((oPI) => oPI.name !== "$search")
}

const _createColumn = (oPropertyInfo:TablePropertyInfo, oTable:Table) => {
	const sName = oPropertyInfo.name
	const sId = oTable.getId() + "---col-" + sName
	return Element.getElementById(sId) ?? new Column(sId, {
		propertyKey: sName,
		header: oPropertyInfo.label,
		template: new Text({
			text: {
				path: "mountains>" + sName,
				type: oPropertyInfo.dataType
			}
		})
	})
}

JSONTableDelegate.addItem = async (oTable:Table, sPropertyName:string) => {
	const oPropertyInfo = JSONPropertyInfo.find((oPI) => oPI.name === sPropertyName)
	return _createColumn(oPropertyInfo, oTable)
}

JSONTableDelegate.updateBindingInfo = (oTable, oBindingInfo) => {
	TableDelegate.updateBindingInfo.call(JSONTableDelegate, oTable, oBindingInfo)
	oBindingInfo.path = (oTable.getPayload() as TablePayload).bindingPath
	oBindingInfo.templateShareable = true
}

const _createSearchFilters = (sSearch:string, aKeys:string[]) => {
	const aFilters = aKeys.map((aKey) => new Filter({
		path: aKey,
		operator: FilterOperator.Contains,
		value1: sSearch
	}))
	return [new Filter(aFilters, false)]
}

JSONTableDelegate.getFilters = (oTable) => {
	const sSearch = (Element.getElementById(oTable.getFilter()) as FilterBar).getSearch()
	const aKeys = (oTable.getPayload() as TablePayload).searchKeys
	let aFilters = TableDelegate.getFilters(oTable)
	if (sSearch && aKeys) {
		aFilters = aFilters.concat(_createSearchFilters(sSearch, aKeys))
	}
	return aFilters
}

export default JSONTableDelegate