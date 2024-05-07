import TableDelegate from "sap/ui/mdc/TableDelegate"
import Text from "sap/m/Text"
import Element from "sap/ui/core/Element"
import JSONPropertyInfo from "mdc/tutorial/model/metadata/JSONPropertyInfo"
import {default as Table, PropertyInfo as TablePropertyInfo} from "sap/ui/mdc/Table"
import Column from "sap/ui/mdc/table/Column"
import Filter from "sap/ui/model/Filter"
import FilterOperator from "sap/ui/model/FilterOperator"
import FilterBar from "sap/ui/mdc/FilterBar"
import JSONBaseDelegate from "./JSONBaseDelegate"

interface TablePayload {
	bindingPath: string
	searchKeys: string[]
}

const JSONTableDelegate = Object.assign({}, TableDelegate, JSONBaseDelegate)

JSONTableDelegate.fetchProperties = async () => {
	return JSONPropertyInfo.filter((p) => p.key !== "$search")
}

const _createColumn = (propertyInfo:TablePropertyInfo, table:Table) => {
	const name = propertyInfo.key
	const id = table.getId() + "---col-" + name
	return Element.getElementById(id) ?? new Column(id, {
		propertyKey: name,
		header: propertyInfo.label,
		template: new Text({
			text: {
				path: "mountains>" + name,
				type: propertyInfo.dataType
			}
		})
	})
}

JSONTableDelegate.addItem = async (table:Table, propertyKey:string) => {
	const propertyInfo = JSONPropertyInfo.find((p) => p.key === propertyKey)
	return _createColumn(propertyInfo, table)
}

JSONTableDelegate.updateBindingInfo = (table, bindingInfo) => {
	TableDelegate.updateBindingInfo.call(JSONTableDelegate, table, bindingInfo)
	bindingInfo.path = (table.getPayload() as TablePayload).bindingPath
	bindingInfo.templateShareable = true
}

const _createSearchFilters = (search:string, keys:string[]) => {
	const filters = keys.map((key) => new Filter({
		path: key,
		operator: FilterOperator.Contains,
		value1: search
	}))
	return [new Filter(filters, false)]
}

JSONTableDelegate.getFilters = (table) => {
	const search = (Element.getElementById(table.getFilter()) as FilterBar).getSearch()
	const keys = (table.getPayload() as TablePayload).searchKeys
	let filters = TableDelegate.getFilters(table)
	if (search && keys) {
		filters = filters.concat(_createSearchFilters(search, keys))
	}
	return filters
}

export default JSONTableDelegate