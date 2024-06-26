[![solution](https://flat.badgen.net/badge/solution/available/green?icon=github)](webapp)
[![demo](https://flat.badgen.net/badge/demo/deployed/blue?icon=github)](https://sap-samples.github.io/ui5-mdc-json-tutorial/ex1/dist)
# Exercise 1: How to Use the MDC Table
In this exercise we will learn how to create a JSONTableDelegate for an MDC Table in an XMLView. These elements are crucial when building an MDC application that interacts with JSON data.

## Step 1: Create a JSONTableDelegate

Firstly, let's create a new directory named `delegate` within the `webapp` directory. Also, add a JavaScript file named `JSONTableDelegate.ts` inside the `delegate` directory.

This file serves as a delegate for a UI5 table. Delegates offer a method to customize the behavior of a control without modifying the control itself. In this example, it contains the logic of how the table interacts with the sample JSON data.

Below is the code for the delegate. It extends the [`sap/ui/mdc/TableDelegate`](https://sdk.openui5.org/api/module:sap/ui/mdc/TableDelegate) and includes functions to extract properties from the JSON metadata provided in `JSONPropertyInfo.ts` in the model folder, add items to the table, delete items from the table, and revise the table's binding information.

Thanks to TypeScript we can provide a delegate-specific interface for the payload, which clearly defines what content can be provided. In this case, the `bindingPath` is specified, so that the table knows from there to get its data. Take a look at the implementation!
###### delegate/JSONTableDelegate.ts
```typescript
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
	return JSONPropertyInfo.filter((p) => p.key !== "$search")
}

const _createColumn = (propertyInfo:TablePropertyInfo, table:Table) => {
	const name = propertyInfo.key
	const id = table.getId() + "---col-" + name
	const column = Element.getElementById(id) as Column
	return column ?? new Column(id, {
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

JSONTableDelegate.addItem = async (table:Table, propertyKey:string) => {
	const propertyInfo = JSONPropertyInfo.find((p) => p.key === propertyKey)
	return _createColumn(propertyInfo, table)
}

JSONTableDelegate.updateBindingInfo = (table, bindingInfo) => {
	TableDelegate.updateBindingInfo.call(JSONTableDelegate, table, bindingInfo)
	bindingInfo.path = (table.getPayload() as TablePayload).bindingPath
	bindingInfo.templateShareable = true
}

export default JSONTableDelegate
```

>⚠️ The `fetchProperties` is a special function as its return value is used for further UI adaptation functionalities. Due to this, the result of this function must be kept stable throughout the lifecycle of your application. Any changes of the returned values might result in undesired effects. As we're using a PropertyInfo at this point, be aware to keep it stable throughout the lifecycle of your application.

The PropertyInfo provides all necessary metadata for the MDC Table to function. Take a look at this excerpt of the `JSONPropertyInfo.ts` file to understand how the two properties, `name` and `height` are defined.
###### model/metadata/JSONPropertInfo.ts
```js
	{
		key: "name",
		label: "Name",
		visible: true,
		path: "name",
		dataType: "sap.ui.model.type.String"
	},{
		key: "height",
		label: "Height",
		visible: true,
		path: "height",
		dataType: "sap.ui.model.type.Integer"
	}
```
>ℹ️ For a comprehensive description of what information should be contained within `PropertyInfo` objects, see the [API Reference](https://sdk.openui5.org/api/sap.ui.mdc.table.PropertyInfo). In real-life scenarios we might retrieve this metadata from the data service and we would have to translate it into the PropertyInfo format, easy to digest for the controls.
## Step 2: Use the MDC Table

Next, let's enhance the XML view named `Mountains.view.xml` in the `view` directory.

This XML view defines the user interface for a screen in our UI5 application. The view comprises a DynamicPage with a Table control in its content area. The table is set up to use our custom JSONTableDelegate.

Below is the code we can add to the content aggregation of the DynamicPage in the XML view. It includes a table with columns for name, height, range, first ascent, countries, and parent mountain, along with the data bindings. The corresponding model is automatically generated based on our sample data via the `manifest.json`.
###### view/Mountains.view.xml
```xml
		<f:content>
			<mdc:Table
				id="table"
				header="Mountains"
				p13nMode="Sort,Column"
				type="ResponsiveTable"
				threshold="100"
				filter="filterbar"
				showRowCount="false"
				delegate="{
				name: 'mdc/tutorial/delegate/JSONTableDelegate',
				payload: {
					bindingPath: 'mountains>/mountains'
				}
			}">
				<mdct:Column
					propertyKey="name"
					header="Name">
					<Text text="{mountains>name}" />
				</mdct:Column>
				<mdct:Column
					propertyKey="height"
					header="Height">
					<Text text="{path: 'mountains>height'}" />
				</mdct:Column>
				<mdct:Column
					propertyKey="range"
					header="Range">
					<Text text="{mountains>range}" />
				</mdct:Column>
				<mdct:Column
					propertyKey="first_ascent"
					header="First Ascent">
					<Text text="{mountains>first_ascent}" />
				</mdct:Column>
				<mdct:Column
					propertyKey="countries"
					header="Countries">
					<Text text="{mountains>countries}" />
				</mdct:Column>
				<mdct:Column
					propertyKey="parent_mountain"
					header="Parent Mountain">
					<Text text="{mountains>parent_mountain}" />
				</mdct:Column>
			</mdc:Table>
		</f:content>
```
> ℹ️ Pay attention to how the controls are specified. All the MDCs included in the XML view will initially appear on the screen without any additional personalization. While this may seem superfluous when also providing the control creation method in the delegate, it allows us to establish a default without any hassle. Alternatively, we could opt to not provide any controls here and add them later through personalization.

>⚠️ The columns we define in our table are used for UI adaptation functionalities like the aforementioned `fetchProperties` function. Hence, the values must again be kept stable throughout the lifecycle of your application to prevent undesired effects. For this reason, using bindings or changing the aggregation's value dynamically through controller code is not advised.

Run the application and see how, with just a few lines of code we added, we get a personalizable table that shows the properties of our JSON data! 😱

![Exercise 1 Result](ex1.png)
## Summary

The main takeaway is that delegates offer a potent mechanism to adapt the behavior of sap.ui.mdc controls without altering the controls themselves. With a custom delegate, we can customize a control to handle a specific type of data, such as JSON data. Furthermore, XML views provide declarative means to define the user interface for a screen in a UI5 application.

Proceed to - [Exercise 2](../ex2/readme.md)