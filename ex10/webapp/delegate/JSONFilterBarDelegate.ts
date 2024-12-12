import FilterBarDelegate from "sap/ui/mdc/FilterBarDelegate"
import JSONPropertyInfo from "mdc/tutorial/model/metadata/JSONPropertyInfo"
import FilterField from "sap/ui/mdc/FilterField"
import Element from "sap/ui/core/Element"
import {default as FilterBar, PropertyInfo as FilterBarPropertyInfo} from "sap/ui/mdc/FilterBar"
import Fragment from "sap/ui/core/Fragment"
import ValueHelp from "sap/ui/mdc/ValueHelp"
import JSONBaseDelegate from "./JSONBaseDelegate"

interface FilterBarPayload {
	valueHelp: {
		[key:string]: string
	}
}

var JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate, JSONBaseDelegate)

JSONFilterBarDelegate.fetchProperties = async () => JSONPropertyInfo.PropertyInfo

const _createValueHelp = async (filterBar:FilterBar, propertyKey:string) => {
	const path = "mdc.tutorial.view.fragment."
	const valueHelp = await Fragment.load({
		name: path + (filterBar.getPayload() as FilterBarPayload).valueHelp[propertyKey]
	}) as unknown as ValueHelp
	filterBar.addDependent(valueHelp)
	return valueHelp
}

const _createFilterField = async (id:string, property:FilterBarPropertyInfo, filterBar:FilterBar) => {
	const propertyKey = property.key
	const filterField = new FilterField(id, {
		dataType: property.dataType,
		conditions: `{$filters>/conditions/${propertyKey}}`,
		propertyKey: propertyKey,
		required: property.required,
		label: property.label,
		maxConditions: property.maxConditions,
		delegate: {name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {}}
	})
	if ((filterBar.getPayload() as FilterBarPayload).valueHelp[propertyKey] ) {
		const dependents = filterBar.getDependents()
		let valueHelp = dependents.find((dependent) => dependent.getId().includes(propertyKey)) as ValueHelp
		valueHelp ??= await _createValueHelp(filterBar, propertyKey)
		filterField.setValueHelp(valueHelp)
	}
	return filterField
}

JSONFilterBarDelegate.addItem = async (filterBar:FilterBar, propertyKey:string) => {
	const property = JSONPropertyInfo.PropertyInfo.find((p) => p.key === propertyKey) as FilterBarPropertyInfo
	const id = `${filterBar.getId()}--filter--${propertyKey}`
	const filterField = Element.getElementById(id) as FilterField
	return filterField ?? _createFilterField(id, property, filterBar)
}

export default JSONFilterBarDelegate