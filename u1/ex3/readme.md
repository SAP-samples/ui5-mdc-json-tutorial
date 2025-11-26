[![solution](https://flat.badgen.net/badge/solution/available/green?icon=github)](webapp)
[![demo](https://flat.badgen.net/badge/demo/deployed/blue?icon=github)](https://sap-samples.github.io/ui5-mdc-json-tutorial/u1/ex3/dist)
# Exercise 3: How to Build Advanced Value Helps
In this exercise, we will build advanced value helps and integrate them into the FilterFields. This enhancement will improve the user's filtering experience and expedite the search for desired results.

## Step 1: Build Value Helps as Fragments
Let's begin by creating a subfolder in the `view` folder of our web application, and name it `fragment`. Here, we will build two value helps of varying complexity. These ValueHelps are defined in conjunction with the table wrappers, [`MTable`](https://sdk.openui5.org/api/sap.ui.mdc.valuehelp.content.MTable) and [`MDCTable`](https://sdk.openui5.org/api/sap.ui.mdc.valuehelp.content.MDCTable), which manage the orchestration of the associated table and the communication with the ValueHelp dialog.

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
Next, construct `NameValueHelp.fragment.xml` with the template provided below. This time we are incorporating a comprehensive value help dialog with a selection table. The dialog will also host the default ValueHelp condition tab.
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
>ℹ️ To simplify matters, we are using the same data set here as in our table. However, in a real scenario, we may want to consider using a ValueHelp from a different set of data to find the values, which is entirely possible.
## Step 2: Link ValueHelps with FilterFields
To utilize the advanced ValueHelp in our view, we need to attach it as a dependent of our FilterBar. This ensures its lifecycle is tied to the FilterBar and will be terminated along with it, for instance, when the application is closed or navigated away from.
###### view/Mountains.view.xml
```xml
					<mdc:dependents>
						<core:Fragment fragmentName="mdc.tutorial.view.fragment.NameValueHelp" type="XML"/>
					</mdc:dependents>
```
Subsequently, it is crucial to connect the ValueHelp to the corresponding FilterField by setting the `valueHelp` association. For the other ValueHelp, we are going to use a delegate-based method in the next step.
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
To determine which properties should be associated with a ValueHelp in our delegate, we can define a delegate-specific payload for this particular table instance. The payload can be added as follows:
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
## Step 4: Add ValueHelp Creation in Delegate
Accessing the payload allows us to identify if a specific FilterField requires a ValueHelp if created by the delegate. Using this information, we can tie the FilterField to the ValueHelp and attach it as a dependent to the FilterBar, but this time within the appropriate callback. Replace the old implementation of `_createFilterField` as follows and add an interface for the `FilterBarPayload`, which defines its content:
###### delegate/JSONFilterBarDelegate.ts
```typescript
interface FilterBarPayload {
	valueHelp: {
		[key:string]: string
	}
}

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
```
Check that our ValueHelps work by using the suggestion and the ValueHelp dialog of the corresponding fields! 🤓

![Exercise 3 Result](u1/ex3.png)
## Summary
In this exercise, we learned how to construct ValueHelps as fragments and improve the user's filtering experience. These ValueHelps were linked with FilterFields and added as dependents to the FilterBar. Additionally, a delegate-specific payload was incorporated into the delegate to specify which properties should have a ValueHelp attached.

Proceed to - [Exercise 4](../u1/ex4/readme.md)