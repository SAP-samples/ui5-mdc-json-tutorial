
import FilterBarDelegate from "sap/ui/mdc/FilterBarDelegate"
import JSONPropertyInfo from "mdc/tutorial/model/metadata/JSONPropertyInfo"
import FilterField from "sap/ui/mdc/FilterField"
import Element from "sap/ui/core/Element"
import {default as FilterBar, PropertyInfo as FilterBarPropertyInfo} from "sap/ui/mdc/FilterBar"

var JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate)

JSONFilterBarDelegate.fetchProperties = async () => JSONPropertyInfo

const _createFilterField = (sId:string, oProperty:FilterBarPropertyInfo, oFilterBar:FilterBar) => {
	const sPropertyName = oProperty.name
	const oFilterField = new FilterField(sId, {
		dataType: oProperty.dataType,
		conditions: `{$filters>/conditions/${sPropertyName}}`,
		propertyKey: sPropertyName,
		required: oProperty.required,
		label: oProperty.label,
		maxConditions: oProperty.maxConditions,
		delegate: {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {}}
	})
	return oFilterField
}

JSONFilterBarDelegate.addItem = async (oFilterBar:FilterBar, sPropertyName:string) => {
	const oProperty = JSONPropertyInfo.find((oPI) => oPI.name === sPropertyName) as FilterBarPropertyInfo
	const sId = `${oFilterBar.getId()}--filter--${sPropertyName}`
	return Element.getElementById(sId) ?? _createFilterField(sId, oProperty, oFilterBar)
}

export default JSONFilterBarDelegate