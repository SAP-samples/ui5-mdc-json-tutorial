import TableDelegate from "sap/ui/mdc/TableDelegate"
import Text from "sap/m/Text"
import Element from "sap/ui/core/Element"
import JSONPropertyInfo from "mdc/tutorial/model/metadata/JSONPropertyInfo"
import {default as Table, PropertyInfo as TablePropertyInfo} from "sap/ui/mdc/Table"
import Column from "sap/ui/mdc/table/Column"

interface TablePayload {
	bindingPath: string
}

const JSONTableDelegate = Object.assign({}, TableDelegate)

JSONTableDelegate.fetchProperties = async () => {
	return JSONPropertyInfo.filter((p) => p.key !== "$search")
}

const _createColumn = (propertyInfo:TablePropertyInfo, table:Table) => {
	const name = propertyInfo.key
	const id = table.getId() + "---col-" + name
	const column = Element.getElementById(id) as Column
	return column ?? new Column(id, {
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

export default JSONTableDelegate