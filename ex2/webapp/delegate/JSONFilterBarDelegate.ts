import FilterBarDelegate from "sap/ui/mdc/FilterBarDelegate"
import JSONPropertyInfo from "mdc/tutorial/model/metadata/JSONPropertyInfo"
import FilterField from "sap/ui/mdc/FilterField"
import Element from "sap/ui/core/Element"
import {default as FilterBar, PropertyInfo as FilterBarPropertyInfo} from "sap/ui/mdc/FilterBar"

var JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate)

JSONFilterBarDelegate.fetchProperties = async () => JSONPropertyInfo

const _createFilterField = (id:string, property:FilterBarPropertyInfo, filterBar:FilterBar) => {
	const propertyName = property.name
	const filterField = new FilterField(id, {
		dataType: property.dataType,
		conditions: `{$filters>/conditions/${propertyName}}`,
		propertyKey: propertyName,
		required: property.required,
		label: property.label,
		maxConditions: property.maxConditions,
		delegate: {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {}}
	})
	return filterField
}

JSONFilterBarDelegate.addItem = async (filterBar:FilterBar, propertyName:string) => {
	const property = JSONPropertyInfo.find((oPI) => oPI.name === propertyName) as FilterBarPropertyInfo
	const id = `${filterBar.getId()}--filter--${propertyName}`
	return Element.getElementById(id) ?? _createFilterField(id, property, filterBar)
}

export default JSONFilterBarDelegate