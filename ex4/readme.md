[![solution](https://flat.badgen.net/badge/solution/available/green?icon=github)](webapp)
# Exercise 4: How to Add Custom Types
You may have noticed that the application can display the height of the mountains. However, it lacks the corresponding unit, "meters", which would provide a more accurate description. This exercise will illustrate how to add specific types and integrate them with the sap.ui.mdc controls.

## Step 1: Add a New Type
Begin by creating a new folder named `type` within the `model` folder of the application. Inside this folder, create a file called `LengthMeter.js`. While the name might seem unusual, it's derived from the corresponding cldr unit.
###### model/type/LengthMeter.js
```javascript
sap.ui.define([
    "sap/ui/model/type/Integer",
    "sap/ui/core/format/NumberFormat"
], function(Integer, NumberFormat) {
	"use strict";

    return Integer.extend("mdc.tutorial.model.type.LengthMeter", {
        formatValue: function(iHeight) {
            const oUnitFormat = NumberFormat.getUnitInstance();
            return oUnitFormat.format(iHeight, "length-meter");
        }
    });

}, /* bExport= */false);
```
>ℹ️ This is only an exemplary type, which makes not much sense and if you look very carefully you might find some issues with it. For a complete implementation implementation of custom type see the corresponding article in the [UI5 Documentation](https://sdk.openui5.org/topic/07e4b920f5734fd78fdaa236f26236d8).
## Step 2: Add the Type Map
In the same `type` folder, create a file named `TypeMap.js`. This file will define a module that extends the `sap/ui/mdc/DefaultTypeMap`. This extension allows us to supplement the default set of type mappings with our specific type `LengthMeter`. Remember to import and freeze your custom type map as indicated in the following snippet.
###### model/type/TypeMap.js
```javascript
sap.ui.define([
	"sap/ui/mdc/DefaultTypeMap",
	"sap/ui/mdc/enums/BaseType",
	"mdc/tutorial/model/type/LengthMeter" // workaround
], function(DefaultTypeMap, BaseType, LengthMeter) {
    "use strict";

	const TypeMap = Object.assign({}, DefaultTypeMap);
	TypeMap.import(DefaultTypeMap);
	TypeMap.set("mdc.tutorial.model.type.LengthMeter", BaseType.Numeric);
	TypeMap.freeze();

	return TypeMap;
});
```
>ℹ️ You have to require the type here, as there is no library where we could declare them and ensure, that they will be loaded in our application. A small change to improve this is currently under consideration.
## Step 3: Create BaseDelegate & Use It
Since our controls need to utilize the new type map, the delegates are equipped with a special `getTypeMap` hook. Let's create a basic delegate in the `delegate` folder and name it `JSONBaseDelegate.js`. This delegate can be reused, eliminating the need for all delegates to implement it.
###### delegate/JSONBaseDelegate.js
```javascript
sap.ui.define([
	"mdc/tutorial/model/type/TypeMap"
], function (TypeMap) {
	"use strict";

	return { getTypeMap: () => TypeMap };

}, /* bExport= */false);
```
In both `JSONTableDelegate` and `JSONFilterBarDelegate` files, require and add the new `JSONBaseDelegate` to the assign call as a third argument.
###### delegate/JSONTableDelegate.js
```javascript
	"mdc/tutorial/delegate/JSONBaseDelegate"
], function (
	TableDelegate, Column, Text, Core, Filter, FilterOperator, JSONPropertyInfo,
	JSONBaseDelegate) {
	"use strict";

	const JSONTableDelegate = Object.assign({}, TableDelegate, JSONBaseDelegate);
```
###### delegate/JSONFilterBarDelegate.js
```javascript
	"mdc/tutorial/delegate/JSONBaseDelegate"
], function (FilterBarDelegate, JSONPropertyInfo, FilterField, Core, Fragment,
	JSONBaseDelegate) {
	"use strict";

	const JSONFilterBarDelegate = Object.assign({}, FilterBarDelegate, JSONBaseDelegate);
```
## Step 4: Add Type Definition
The final step involves using the type for the `height` property in our `Mountains.view.xml` file and adding it to the `PropertyInfo.js` file, from where it will be assigned automaticall to all other columns and filter fields via the delegates.
###### view/Mountains.view.xml
```xml
				<mdct:Column
					propertyKey="height"
					header="Height">
					<Text text="{path: 'mountains>height' , type: 'mdc.tutorial.model.type.LengthMeter'}"/>
				</mdct:Column>
```
###### model/metadata/JSONPropertyInfo.js
```javascript
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
Check, if the application now shows the meters properly in filter fields and columns! 🏔️

![Exercise 4 Result](ex4.png)

## Summary
In this exercise, you've learned how to add a specific type, "LengthMeter", to the sap.ui.mdc controls in your application. This included creating a new file for the type, extending the default type map, creating a base delegate, and adding the type definition to the view and property info files.

Proceed to - [Exercise 5](../ex5/readme.md)