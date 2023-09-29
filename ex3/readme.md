# Exercise 3
In this exercise, we will build advanced value helps and integrate them into the filter fields. This enhancement will improve the user's filtering experience and expedite the search for desired results.

## Step 1: Build Value Helps as Fragments
Let's begin by creating a subfolder in the `view` folder of our web application, and name it `fragment`. Here, we will build two value helps of varying complexity. These value helps are defined in conjunction with the table wrappers, [`MTable`](https://sdk.openui5.org/api/sap.ui.mdc.valuehelp.content.MTable) and [`MDCTable`](https://sdk.openui5.org/api/sap.ui.mdc.valuehelp.content.MDCTable), which manage the orchestration of the associated table and the communication with the Value Help Dialog.

Firstly, create `RangeValueHelp.fragment.xml` and insert the following value help template. It includes a simple suggestion (typeahead) for the specific mountain range. 
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
								bindingPath: 'mountains>/mountains'
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
>ℹ️ To simplify matters, we are using the same data set here as in our table. However, in a real scenario, you may want to consider using a value help from a different set of data to find the values, which is entirely possible.
## Step 2: Link Value Helps with Filter Fields
To utilize the advanced value help in our view, we need to attach it as a dependent of our Filter Bar. This ensures its lifecycle is tied to the Filter Bar and will be terminated along with it, for instance, when the application is closed or navigated away from.
###### view/Mountains.view.xml
```xml
					<mdc:dependents>
						<core:Fragment fragmentName="mdc.tutorial.view.fragment.NameValueHelp" type="XML"/>
					</mdc:dependents>
```
Subsequently, it is crucial to connect the Value Help to the corresponding Filter Field by setting the `valueHelp` association. 
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
To determine in our delegate which properties should be associated with a value help, we can define a delegate-specific payload for this particular table instance. The payload can be added as follows:
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
Accessing the payload allows us to identify if a specific filter field requires a value help when created by the delegate. Using this information, we can tie the filter field with the value help and attach it as a dependent to the filter bar, but this time within the appropriate JavaScript callback. Replace the old implmentation of `_addFilterField` as follows:
###### delegate/JSONTableDelegate.js
```javascript
	function _addFilterField(oProperty, oFilterBar) {
		const sName = oProperty.name;
		const sFilterFieldId = oFilterBar.getId() + "--filter--" + sName;
		let oFilterField = Core.byId(sFilterFieldId);
		let pFilterField;

		if (oFilterField) {
			pFilterField = Promise.resolve(oFilterField);
		} else {
			oFilterField = new FilterField(sFilterFieldId, {
				dataType: oProperty.dataType,
				conditions: "{$filters>/conditions/" + sName + '}',
				propertyKey: sName,
				required: oProperty.required,
				label: oProperty.label,
				maxConditions: oProperty.maxConditions,
				delegate: { name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {} }
			});

			if (oFilterBar.getPayload().valueHelp[sName]) {
				pFilterField = _addValueHelp(oFilterBar, oFilterField, sName);
			} else {
				pFilterField = Promise.resolve(oFilterField);
			}
		}
		return pFilterField;
	}

	function _addValueHelp(oFilterBar, oFilterField, sName) {
		const oValueHelp = oFilterBar.getDependents().find((oD) => oD.getId().includes(sName));
		let pFieldWithVH;

		if (oValueHelp) {
			oFilterField.setValueHelp(oValueHelp);
			pFieldWithVH = Promise.resolve(oFilterField);
		} else {
			const sPath = "mdc.tutorial.view.fragment.";
			pFieldWithVH = Fragment.load({
				name: sPath + oFilterBar.getPayload().valueHelp[sName]
			}).then(function(oValueHelp) {
				oFilterBar.addDependent(oValueHelp);
				oFilterField.setValueHelp(oValueHelp);
				return oFilterField;
			});
		}

		return pFieldWithVH;
	}
```
Check that your value helps work by using the suggestion and the value help dialog of the corresponding fields! 🤓

![Exercise 3 Result](ex3.png)
## Summary
In this exercise, you learned how to construct value helps as fragments and improve the user's filtering experience. These value helps were linked with filter fields and added as dependents to the Filter Bar. Additionally, a delegate specific payload was incorporated into the delegate to specify which properties should have a value help attached.

Proceed to - [Exercise 4](../ex4/readme.md)