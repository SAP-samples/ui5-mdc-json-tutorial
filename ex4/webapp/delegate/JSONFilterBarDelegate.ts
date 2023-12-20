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

const _createValueHelp = async (oFilterBar:FilterBar, sPropertyName:string) => {
	const sPath = "mdc.sample.view.fragment."
	const oValueHelp = await Fragment.load({
		name: sPath + (oFilterBar.getPayload() as FilterBarPayload).valueHelp[sPropertyName]
	}) as unknown as ValueHelp
	oFilterBar.addDependent(oValueHelp)
	return oValueHelp
}

const _createFilterField = async (sId:string, oProperty:FilterBarPropertyInfo, oFilterBar:FilterBar) => {
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
	if ((oFilterBar.getPayload() as FilterBarPayload).valueHelp[sPropertyName] ) {
		const aDependents = oFilterBar.getDependents()
		let oValueHelp = aDependents.find((oD) => oD.getId().includes(sPropertyName)) as ValueHelp
		oValueHelp ??= await _createValueHelp(oFilterBar, sPropertyName)
		oFilterField.setValueHelp(oValueHelp)
	}
	return oFilterField
}

JSONFilterBarDelegate.addItem = async (oFilterBar:FilterBar, sPropertyName:string) => {
	const oProperty = JSONPropertyInfo.find((oPI) => oPI.name === sPropertyName) as FilterBarPropertyInfo
	const sId = `${oFilterBar.getId()}--filter--${sPropertyName}`
	return Element.getElementById(sId) ?? await _createFilterField(sId, oProperty, oFilterBar)
}

export default JSONFilterBarDelegate