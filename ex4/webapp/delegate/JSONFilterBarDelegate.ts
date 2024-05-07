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

JSONFilterBarDelegate.fetchProperties = async () => JSONPropertyInfo

const _createValueHelp = async (filterBar:FilterBar, propertyName:string) => {
	const path = "mdc.tutorial.view.fragment."
	const valueHelp = await Fragment.load({
		name: path + (filterBar.getPayload() as FilterBarPayload).valueHelp[propertyName]
	}) as unknown as ValueHelp
	filterBar.addDependent(valueHelp)
	return valueHelp
}

const _createFilterField = async (id:string, property:FilterBarPropertyInfo, filterBar:FilterBar) => {
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
	if ((filterBar.getPayload() as FilterBarPayload).valueHelp[propertyName] ) {
		const dependents = filterBar.getDependents()
		let valueHelp = dependents.find((dependent) => dependent.getId().includes(propertyName)) as ValueHelp
		valueHelp ??= await _createValueHelp(filterBar, propertyName)
		filterField.setValueHelp(valueHelp)
	}
	return filterField
}

JSONFilterBarDelegate.addItem = async (filterBar:FilterBar, propertyName:string) => {
	const property = JSONPropertyInfo.find((oPI) => oPI.name === propertyName) as FilterBarPropertyInfo
	const id = `${filterBar.getId()}--filter--${propertyName}`
	return Element.getElementById(id) ?? await _createFilterField(id, property, filterBar)
}

export default JSONFilterBarDelegate