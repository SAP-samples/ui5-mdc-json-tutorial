[![solution](https://flat.badgen.net/badge/solution/available/green?icon=github)](webapp)
[![demo](https://flat.badgen.net/badge/demo/deployed/blue?icon=github)](https://sap-samples.github.io/ui5-mdc-json-tutorial/ex4/dist)
# Exercise 4: How to Add Custom Types
At this point the application can display the height of the mountains. However, it lacks the corresponding unit, "meters", which would provide a more accurate description. This exercise will illustrate how to add specific types and integrate them with the sap.ui.mdc controls.

## Step 1: Add a New Type
Begin by creating a new folder named `type` within the `model` folder of the application. Inside this folder, create a file called `LengthMeter.ts`. While the name might seem unusual, it's derived from the corresponding cldr unit.
###### model/type/LengthMeter.ts
```typescript
import Integer from "sap/ui/model/type/Integer"
import NumberFormat from "sap/ui/core/format/NumberFormat"

export default class LengthMeter extends Integer {
    formatValue(iHeight: number) {
        const oUnitFormat = NumberFormat.getUnitInstance()
        return oUnitFormat.format(iHeight, "length-meter")
    }
}
```
>ℹ️ This is only an exemplary type, which makes not much sense and if we look very carefully we might find some issues with it. For a complete implementation of a custom type, see the corresponding article in the [UI5 Documentation](https://sdk.openui5.org/topic/07e4b920f5734fd78fdaa236f26236d8).
## Step 2: Add the Type Map
In the same `type` folder, create a file named `TypeMap.ts`. This file will define a module that extends the `sap/ui/mdc/DefaultTypeMap`. This extension allows us to supplement the default set of type mappings with our specific type `LengthMeter`. Remember to import and freeze our custom-type map as indicated in the following snippet.
###### model/type/TypeMap.ts
```typescript
import DefaultTypeMap from "sap/ui/mdc/DefaultTypeMap"
import BaseType from "sap/ui/mdc/enums/BaseType"
import LengthMeter from "mdc/tutorial/model/type/LengthMeter"

const TypeMap = Object.assign({}, DefaultTypeMap)
TypeMap.import(DefaultTypeMap)
TypeMap.set("mdc.tutorial.model.type.LengthMeter", BaseType.Numeric)
TypeMap.freeze()

export default TypeMap
```
>ℹ️ We have to require the type here, as there is no library where we could declare them and ensure, that they will be loaded in our application. A small change to improve this is currently under consideration.
## Step 3: Create BaseDelegate & Use It
Since our controls need to utilize the new type map, the delegates are equipped with a special `getTypeMap` hook. Let's create a basic delegate in the `delegate` folder and name it `JSONBaseDelegate.ts`. This delegate can be reused, eliminating the need for all delegates to implement it.
###### delegate/JSONBaseDelegate.ts
```typescript
import TypeMap from "mdc/tutorial/model/type/TypeMap"

export default {
    getTypeMap: function() {
        return TypeMap;
    }
}
```
In both `JSONTableDelegate` and `JSONFilterBarDelegate` files, import and add the new `JSONBaseDelegate` to the assigned call as a third argument.
###### delegate/JSONTableDelegate.ts
```typescript
import JSONBaseDelegate from "./JSONBaseDelegate"

const JSONTableDelegate = Object.assign({}, TableDelegate, JSONBaseDelegate)
```
###### delegate/JSONFilterBarDelegate.ts
```typescript
import JSONBaseDelegate from "./JSONBaseDelegate"

var JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate, JSONBaseDelegate)
```
## Step 4: Add Type Definition
The final step involves using the type for the `height` property in our `Mountains.view.xml` file and adding it to the `PropertyInfo.ts` file, from where it will be assigned automatically to all other columns and FilterFields via the delegates.
###### view/Mountains.view.xml
```xml
				<mdct:Column
					propertyKey="height"
					header="Height">
					<Text text="{path: 'mountains>height' , type: 'mdc.tutorial.model.type.LengthMeter'}"/>
				</mdct:Column>
```
###### model/metadata/JSONPropertyInfo.ts
```js
	},{
		name: "height",
		label: "Height",
		visible: true,
		path: "height",
		dataType: "mdc.tutorial.model.type.LengthMeter"
	},{
		name: "prominence",
		label: "Prominence",
		visible: true,
		path: "prominence",
		dataType: "mdc.tutorial.model.type.LengthMeter"
	},{
```
Check if the application now shows the meters properly in FilterFields and columns! 🏔️

![Exercise 4 Result](ex4.png)

## Summary
In this exercise, we've learned how to add a specific type, "LengthMeter", to the sap.ui.mdc controls in our application. This included creating a new file for the type, extending the default type map, creating a base delegate, and adding the type definition to the view and property info files.

Proceed to - [Exercise 5](../ex5/readme.md)