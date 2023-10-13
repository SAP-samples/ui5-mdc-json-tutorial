
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
	oBindingInfo.templateShareable = true;
}

export default JSONTableDelegate
