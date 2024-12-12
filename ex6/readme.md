[![solution](https://flat.badgen.net/badge/solution/available/green?icon=github)](webapp)
[![demo](https://flat.badgen.net/badge/demo/deployed/blue?icon=github)](https://sap-samples.github.io/ui5-mdc-json-tutorial/ex5/dist)
# Exercise 6: Enable XML Templating
Yay - template xml stuff :)

## Step 1: Enable XML Templating
* Create a MountainsTemplate.ts typed view view with preprocessor config

```typescript
import Control from "sap/ui/core/Control";
import View from "sap/ui/core/mvc/View";
import XMLView from "sap/ui/core/mvc/XMLView";
import JSONPropertyInfo from "../model/metadata/JSONPropertyInfo";

/**
 * @namespace mdc.tutorial.view
 */
export default class Mountains extends View {
    async createContent(): Promise<Control> {
        return XMLView.create({
            id: "mountains",
            viewName: "mdc.tutorial.view.Mountains",
            preprocessors: {
                xml: {

                }
            }
        });
    } 
}
```

## Step 2: Route to template view
* Adapt routing config to render view

```json
    "rootView": {
        "viewName": "module:mdc/tutorial/view/MountainsTemplate",
        "async": true,
        "id": "sample"
    }
```

## Step 3: Test
* add random button with templating
```xml
	<template:if test="true">
		<Button text="Hello World"/>
	</template:if>
```

## Conclusion
Congratulations! 🎉
