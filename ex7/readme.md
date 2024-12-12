[![solution](https://flat.badgen.net/badge/solution/available/green?icon=github)](webapp)
[![demo](https://flat.badgen.net/badge/demo/deployed/blue?icon=github)](https://sap-samples.github.io/ui5-mdc-json-tutorial/ex5/dist)
# Exercise 7: Use Templating
Yay, us it in views

## Step 1: Add the model
* Add the property infos as JSON

```json
                    models: {
                        pim: {
                            PropertyInfo: JSONPropertyInfo
                        }
                    }
```

## Step2: Render the filter fields
* Use template repeat to render fields
```xml
<template:repeat list="{pim>/PropertyInfo}">
    <template:if test="{= ${pim>key} !== '$search'}">
        <mdc:FilterField
            label="{pim>label}"
            propertyKey="{pim>key}"
            dataType="sap.ui.model.type.String"
            conditions="{:= '{$filters>/conditions/' + ${pim>key} + '}' }"
            valueHelp="name-vh"
            delegate="{name: 'sap/ui/mdc/field/FieldBaseDelegate'}"/>
    </template:if>
</template:repeat>
```

## Step 3: Render the columns
* Same here
```xml
<template:repeat list="{pim>/PropertyInfo}">
    <template:if test="{= ${pim>key} !== '$search'}">
        <mdct:Column
            propertyKey="{pim>key}"
            header="{pim>label}">
            <Text text="{:= '{mountains>' + ${pim>key} + '}' }"/>
        </mdct:Column>
    </template:if>
</template:repeat>
```

## Conclusion
Bravo! 🎉