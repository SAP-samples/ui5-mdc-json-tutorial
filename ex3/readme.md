[![solution](https://flat.badgen.net/badge/solution/available/green?icon=github)](webapp)
[![demo](https://flat.badgen.net/badge/demo/deployed/blue?icon=github)](https://sap-samples.github.io/ui5-mdc-json-tutorial/ex3/dist)
# Exercise 3: How to Build Advanced Value Helps
In this exercise, we will build advanced value helps and integrate them into the filter fields. This enhancement will improve the user's filtering experience and expedite the search for desired results.

## Step 1: Build Value Helps as Fragments
Let's begin by creating a subfolder in the `view` folder of our web application, and name it `fragment`. Here, we will build two value helps of varying complexity. These value helps are defined in conjunction with the table wrappers, [`MTable`](https://sdk.openui5.org/api/sap.ui.mdc.valuehelp.content.MTable) and [`MDCTable`](https://sdk.openui5.org/api/sap.ui.mdc.valuehelp.content.MDCTable), which manage the orchestration of the associated table and the communication with the value help dialog.

Firstly, create `RangeValueHelp.fragment.xml` and insert the following value help template. It includes a simple suggestion (type-ahead) for the specific mountain range.
###### view/fragment/RangeValueHelp.fragment.xml
```xml
<core:FragmentDefinition
	xmlns="sap.m"
	xmlns:core="sap.ui.core"
	xmlns:mdc="sap.ui.mdc"
	xmlns:mdct="sap.ui.mdc.table"
	xmlns:vh="sap.ui.mdc.valuehelp"
	xmlns:vhc="sap.ui.mdc.valuehelp.content"
	xmlns:vhfb="sap.ui.mdc.filterbar.vh">

	<mdc:ValueHelp id="range-vh" delegate="{name: 'sap/ui/mdc/ValueHelpDelegate', payload: {}}">
		<mdc:typeahead>
			<vh:Popover title="Range">
				<vhc:MTable keyPath="range" filterFields="*range*">
					<Table id="range-vh-table" items='{path : "mountains>/ranges"}' width="30rem">
						<columns>
							<Column>
								<header>
									<Text text="Range" />
								</header>
							</Column>
						</columns>
						<items>
							<ColumnListItem type="Active">
								<cells>
									<Text text="{mountains>range}" />
								</cells>
							</ColumnListItem>
						</items>
					</Table>
				</vhc:MTable>
			</vh:Popover>
		</mdc:typeahead>
	</mdc:ValueHelp>

</core:FragmentDefinition>
```
Next, construct `NameValueHelp.fragment.xml` with the template provided below. This time we are incorporating a comprehensive value help dialog with a selection table. The dialog will also host the default value help condition tab.
###### view/fragment/NameValueHelp.fragment.xml
```xml
<core:FragmentDefinition
	xmlns="sap.m"
	xmlns:core="sap.ui.core"
	xmlns:mdc="sap.ui.mdc"
	xmlns:mdct="sap.ui.mdc.table"
	xmlns:vh="sap.ui.mdc.valuehelp"
	xmlns:vhc="sap.ui.mdc.valuehelp.content"
	xmlns:vhfb="sap.ui.mdc.filterbar.vh">

	<mdc:ValueHelp id="name-vh" delegate="{name: 'sap/ui/mdc/ValueHelpDelegate', payload: {}}">
		<mdc:typeahead>
			<vh:Popover title="Name">
				<vhc:MTable keyPath="name" filterFields="*name*">
					<Table id="name-vht-table" items='{path : "mountains>/mountains", length: 10}'
						width="30rem">
						<columns>
							<Column>
								<header>
									<Text text="Name" />
								</header>
							</Column>
						</columns>
						<items>
							<ColumnListItem type="Active">
								<cells>
									<Text text="{mountains>name}" />
								</cells>
							</ColumnListItem>
						</items>
					</Table>
				</vhc:MTable>
			</vh:Popover>
		</mdc:typeahead>
		<mdc:dialog>
			<vh:Dialog title="Name">
				<vhc:MDCTable keyPath="name">
					<vhc:filterBar>
						<vhfb:FilterBar id="name-vhd-fb" delegate="{name: 'mdc/tutorial/delegate/JSONFilterBarDelegate'}">
							<vhfb:basicSearchField>
								<mdc:FilterField delegate="{name: 'sap/ui/mdc/field/FieldBaseDelegate'}"
									dataType="sap.ui.model.type.String"
									placeholder= "Search Mountains"
									conditions="{$filters>/conditions/$search}"
									maxConditions="1"/>
							</vhfb:basicSearchField>
						</vhfb:FilterBar>
					</vhc:filterBar>
					<mdc:Table id="name-vhd-table"
						type="ResponsiveTable"
						selectionMode="Multi"
						delegate="{
							name: 'mdc/tutorial/delegate/JSONTableDelegate',
							payload: {
								bindingPath: 'mountains>/mountains',
								searchKeys: ['name']
							}
						}"
						filter="name-vhd-fb">
						<mdc:columns>
							<mdct:Column
								header="Name"
								propertyKey="name">
								<Text text="{mountains>name}"/>
							</mdct:Column>
						</mdc:columns>
					</mdc:Table>
				</vhc:MDCTable>
				<vhc:Conditions label="Name"/>
			</vh:Dialog>
		</mdc:dialog>
	</mdc:ValueHelp>

</core:FragmentDefinition>
```
>ℹ️ To simplify matters, we are using the same data set here as in our table. However, in a real scenario, we may want to consider using a value help from a different set of data to find the values, which is entirely possible.
## Step 2: Link Value Helps with Filter Fields
To utilize the advanced value help in our view, we need to attach it as a dependent of our filter bar. This ensures its lifecycle is tied to the filter bar and will be terminated along with it, for instance, when the application is closed or navigated away from.
###### view/Mountains.view.xml
```xml
					<mdc:dependents>
						<core:Fragment fragmentName="mdc.tutorial.view.fragment.NameValueHelp" type="XML"/>
					</mdc:dependents>
```
Subsequently, it is crucial to connect the value help to the corresponding filter field by setting the `valueHelp` association. For the other value help, we are going to use a delegate-based method in the next step.
###### view/Mountains.view.xml
```xml
						<mdc:FilterField
							label="Name"
							propertyKey="name"
							dataType="sap.ui.model.type.String"
							conditions="{$filters>/conditions/name}"
							valueHelp="name-vh"
							delegate="{name: 'sap/ui/mdc/field/FieldBaseDelegate'}"/>
```
## Step 3: Incorporate Payload
To determine which properties should be associated with a value help in our delegate, we can define a delegate-specific payload for this particular table instance. The payload can be added as follows:
###### view/Mountains.view.xml
```xml
                <mdc:FilterBar id="filterbar" delegate="{
                        name: 'mdc/tutorial/delegate/JSONFilterBarDelegate',
                        payload: {
                            valueHelp: {
                                name: 'NameValueHelp',
                                range: 'RangeValueHelp'
                            }
                        }
                    }"
                    p13nMode = "Item,Value">
```
## Step 4: Add Value Help Creation in Delegate
Accessing the payload allows us to identify if a specific filter field requires a value help if created by the delegate. Using this information, we can tie the filter field to the value help and attach it as a dependent to the filter bar, but this time within the appropriate callback. Replace the old implementation of `_createFilterField` as follows and add a interface for the `FilterBarPayload`, which defines its content:
###### delegate/JSONFilterBarDelegate.ts
```typescript
interface FilterBarPayload {
	valueHelp: {
		[key:string]: string
	}
}

const _createValueHelp = async (oFilterBar:FilterBar, sPropertyName:string) => {
	const sPath = "mdc.tutorial.view.fragment."
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
```
Check that our value helps work by using the suggestion and the value help dialog of the corresponding fields! 🤓

![Exercise 3 Result](ex3.png)
## Summary
In this exercise, we learned how to construct value helps as fragments and improve the user's filtering experience. These value helps were linked with filter fields and added as dependents to the filter bar. Additionally, a delegate specific payload was incorporated into the delegate to specify which properties should have a value help attached.

Proceed to - [Exercise 4](../ex4/readme.md)