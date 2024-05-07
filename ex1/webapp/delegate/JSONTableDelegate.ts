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
	return JSONPropertyInfo.filter((oPI) => oPI.name !== "$search")
}

const _createColumn = (propertyInfo:TablePropertyInfo, table:Table) => {
	const name = propertyInfo.name
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

JSONTableDelegate.addItem = async (table:Table, propertyName:string) => {
	const propertyInfo = JSONPropertyInfo.find((oPI) => oPI.name === propertyName)
	return _createColumn(propertyInfo, table)
}

JSONTableDelegate.updateBindingInfo = (table, bindingInfo) => {
	TableDelegate.updateBindingInfo.call(JSONTableDelegate, table, bindingInfo)
	bindingInfo.path = (table.getPayload() as TablePayload).bindingPath
	bindingInfo.templateShareable = true
}

export default JSONTableDelegate