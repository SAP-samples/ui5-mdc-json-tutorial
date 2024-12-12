[![solution](https://flat.badgen.net/badge/solution/available/green?icon=github)](webapp)
[![demo](https://flat.badgen.net/badge/demo/deployed/blue?icon=github)](https://sap-samples.github.io/ui5-mdc-json-tutorial/ex5/dist)
# Exercise 8: Configure the initial screen
As we do not want to see everything from the start, maybe

## Step 1: Add a view model
Add the view config and add a property to the PropertyInfo file (for now)
```json
	ViewConfig: {
		filterFields: ["name", "range"],
		valueHelp: ["name", "range", "parent_mountain", "countries"],
		columns: ["name", "height", "range", "parent_mountain", "countries"]
	},
	PropertyInfo: [
```

## Step 2: Adapt the typed template view
We should make it a jsonmodel now
```ts
                    models: {
                        pim: new JSONModel(JSONPropertyInfo)
                    }
```

## Step 3: Expression binding in actino
Adapt the view to check on the view config for the initial screen
```xml
	<template:if test="{= ${pim>/ViewConfig/filterFields}.includes(${pim>key})}">
```

```xml
	<template:if test="{= ${pim>/ViewConfig/columns}.includes(${pim>key})}">
```

## Step 4: 
<add more cool stuff here>


## Conclusion
Bravo! 🎉