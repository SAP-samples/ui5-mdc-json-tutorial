[![solution](https://flat.badgen.net/badge/solution/available/green?icon=github)](webapp)

# Exercise 7: How to Use the MDC Chart with Chart.js
In this exercise we will learn how to create a ChartJSDelegate for an MDC Chart using the popular [Chart.js](https://www.chartjs.org/) library. This demonstrates how to integrate a third-party charting library with the MDC Chart control.

## Step 1: Set Up the Chart.js Libraries

First, we need to include the Chart.js library and its plugins. Create a `control` directory in the `webapp` folder and add the following files:

- `ChartJS.js` - The Chart.js library
- `hammerjs.js` - Required for touch gestures
- `chartjs-plugin-zoom.js` - Zoom plugin for Chart.js
- `ChartWrapper.js` - A UI5 control wrapper for Chart.js
- `ChartWrapperRenderer.js` - The renderer for ChartWrapper

### Configure the UI5 Loader

Since Chart.js is an AMD module, we need to configure the UI5 loader to properly load it. Create an `initLoader.js` file in the `webapp` directory:

###### initLoader.js
```javascript
// Loader initialization - configures paths and shims before Component loads
sap.ui.loader.config({
    paths: {
        "custom/Chart": sap.ui.require.toUrl("mdc/tutorial/control/ChartJS"),
        "custom/Hammer": sap.ui.require.toUrl("mdc/tutorial/control/hammerjs"),
        "custom/ChartZoom": sap.ui.require.toUrl("mdc/tutorial/control/chartjs-plugin-zoom")
    },
    shim: {
        "custom/Chart": {
            amd: true,
            exports: "Chart"
        },
        "custom/Hammer": {
            amd: true,
            exports: "Hammer"
        },
        "custom/ChartZoom": {
            amd: true,
            deps: ["custom/Chart"],
            exports: "ChartZoom"
        }
    }
});

// Now load ComponentSupport to initialize the component
sap.ui.require(["sap/ui/core/ComponentSupport"], function() {
    // ComponentSupport will auto-initialize components with data-sap-ui-component
});
```

Update the `index.html` to use this loader instead of directly loading ComponentSupport:

###### index.html
```html
<script id="sap-ui-bootstrap"
        src="https://sdk.openui5.org/1.144.0/resources/sap-ui-core.js"
    data-sap-ui-theme="sap_horizon"
    data-sap-ui-resourceroots='{
        "mdc.tutorial": "./"
    }'
    data-sap-ui-flexibilityServices='[{"connector": "LocalStorageConnector"}]'
    data-sap-ui-compatVersion="edge"
    data-sap-ui-async="true"
    data-sap-ui-frameOptions="trusted"
    data-sap-ui-oninit="module:mdc/tutorial/initLoader">
</script>
```

## Step 2: Create a ChartJSPropertyHelper

Create a `ChartJSPropertyHelper.ts` file in the `delegate` directory. This helper extends the MDC PropertyHelper to support Chart.js-specific properties like `groupable` (dimensions) and `aggregatable` (measures).

###### delegate/ChartJSPropertyHelper.ts
```typescript
import PropertyHelperBase from "sap/ui/mdc/chart/PropertyHelper";
import type ManagedObject from "sap/ui/base/ManagedObject";

interface ChartProperty {
    groupable?: boolean;
    aggregatable?: boolean;
    kind?: string;
    typeConfig?: any;
    dataType?: string;
    formatOptions?: object;
    constraints?: object;
    visible?: boolean;
}

export default class ChartJSPropertyHelper extends PropertyHelperBase {
    constructor(aProperties: ChartProperty[], oParent?: ManagedObject) {
        super(aProperties, oParent, {
            filterable: true,
            sortable: true,
            groupable: {
                type: "boolean"
            },
            aggregatable: {
                type: "boolean"
            }
        });
    }

    prepareProperty(oProperty: ChartProperty): void {
        if (oProperty.groupable) {
            oProperty.kind = "Groupable";
        } else if (oProperty.aggregatable) {
            oProperty.kind = "Aggregatable";
        }
        if (!oProperty.typeConfig && oProperty.dataType) {
            const oFormatOptions = oProperty.formatOptions ? oProperty.formatOptions : null;
            const oConstraints = oProperty.constraints ? oProperty.constraints : {};
            oProperty.typeConfig = this.getParent().getTypeMap().getTypeConfig(
                oProperty.dataType,
                oFormatOptions,
                oConstraints
            );
        }
        oProperty.visible = true;
    }
}
```

## Step 3: Create the ChartJSDelegate

Create a `ChartJSDelegate.ts` file in the `delegate` directory. This delegate extends the [`sap/ui/mdc/ChartDelegate`](https://sdk.openui5.org/api/module:sap/ui/mdc/ChartDelegate) and implements the required methods to integrate Chart.js with MDC Chart.

### Create the delegate and state management

###### delegate/ChartJSDelegate.ts
```typescript
import BaseDelegate from "sap/ui/mdc/ChartDelegate";
import ChartWrapper from "mdc/tutorial/control/ChartWrapper";
import ChartJSPropertyHelper from "./ChartJSPropertyHelper";
import ChartItem from "sap/ui/mdc/chart/Item";
import ChartItemRoleType from "sap/ui/mdc/enums/ChartItemRoleType";
import ChartItemPanel from "sap/ui/mdc/p13n/panels/ChartItemPanel";
import Sorter from "sap/ui/model/Sorter";

type Chart = any;

const ChartDelegate: any = { ...BaseDelegate };
const mStateMap = new window.WeakMap();

ChartDelegate._getState = function(oChart: Chart) {
    if (mStateMap.has(oChart)) {
        return mStateMap.get(oChart);
    }
    return {};
};

ChartDelegate._setState = function(oChart: Chart, oState: any) {
    mStateMap.set(oChart, oState);
};

ChartDelegate._getInnerChart = function(oChart: Chart) {
    return this._getState(oChart).innerChart;
};

export default ChartDelegate;
```

### Implement chart initialization

The delegate creates a `ChartWrapper` control that wraps the Chart.js canvas:

###### delegate/ChartJSDelegate.ts: initialization
```typescript
ChartDelegate.initializeInnerChart = function(oChart: Chart) {
    return new Promise(function(resolve, reject) {
        const oState = this._getState(oChart);
        oState.innerChart = new ChartWrapper({ width: oChart.getWidth() });
        this._setState(oChart, oState);
        resolve(oState.innerChart);
    }.bind(this));
};

ChartDelegate.createInnerChartContent = function(oChart: Chart, fnCallbackDataLoaded: Function) {
    return new Promise(function(resolve, reject) {
        const oState = this._getState(oChart);
        oState.fnCallbackDataLoaded = fnCallbackDataLoaded;
        this._setState(oChart, oState);
        const oBindingInfo = this.getBindingInfo(oChart);
        this.updateBindingInfo(oChart, oBindingInfo);
        this.rebind(oChart, oBindingInfo);
        resolve();
    }.bind(this));
};
```

### Implement item management

Items (dimensions and measures) are added/removed through the P13n dialog:

###### delegate/ChartJSDelegate.ts: item management
```typescript
ChartDelegate.addItem = function(oChart: Chart, sPropertyKey: string, mPropertyBag: any, sRole: string) {
    return new Promise(function(resolve, reject) {
        const oPropertyInfo = oChart.getPropertyHelper().getProperty(sPropertyKey);
        const oItem = new ChartItem(oChart.getId() + "--Item--" + oPropertyInfo.key, {
            propertyKey: oPropertyInfo.key,
            label: oPropertyInfo.label,
            role: oPropertyInfo.role,
            type: oPropertyInfo.groupable ? "groupable" : "aggregatable"
        });
        resolve(oItem);
    });
};

ChartDelegate.removeItem = function(oChart: Chart, oItem: any, mPropertyBag: any) {
    oItem.destroy();
    return Promise.resolve(true);
};
```

### Implement chart type handling

Chart.js supports multiple chart types. The delegate provides methods to switch between them:

###### delegate/ChartJSDelegate.ts: chart types
```typescript
ChartDelegate.setChartType = function(oChart: Chart, sChartType: string) {
    this._getInnerChart(oChart).setChartType(sChartType);
    this._getInnerChart(oChart).updateChart();
};

ChartDelegate.getAvailableChartTypes = function(oChart: Chart) {
    return this._getInnerChart(oChart).getAvailableChartTypes();
};

ChartDelegate.getChartTypeLayoutConfig = function() {
    const aLayoutOptions = [ChartItemRoleType.axis1, ChartItemRoleType.category];
    return [
        { key: "bar", allowedLayoutOptions: aLayoutOptions },
        { key: "line", allowedLayoutOptions: aLayoutOptions },
        { key: "pie", allowedLayoutOptions: aLayoutOptions },
        { key: "radar", allowedLayoutOptions: aLayoutOptions },
        { key: "doughnut", allowedLayoutOptions: aLayoutOptions },
        { key: "polarArea", allowedLayoutOptions: aLayoutOptions }
    ];
};
```

### Implement data binding

The delegate transforms the JSON model data into Chart.js format:

###### delegate/ChartJSDelegate.ts: data binding
```typescript
ChartDelegate.fetchProperties = function(oChart: Chart) {
    const oPayload = oChart.getDelegate().payload;
    const aModelInfos = oChart.getModel(oPayload.infomodel).getData();
    return Promise.resolve(aModelInfos);
};

ChartDelegate.getPropertyHelperClass = function() {
    return ChartJSPropertyHelper;
};
```

>ℹ️ The full version of the ChartJSDelegate is available [here](webapp/delegate/ChartJSDelegate.ts).

## Step 4: Create the ChartWrapper Control

The `ChartWrapper` is a UI5 control that wraps the Chart.js canvas. It handles:
- Chart rendering
- Chart type switching
- Zoom functionality
- Legend and tooltip visibility

###### control/ChartWrapper.js (excerpt)
```javascript
const ChartWrapper = Control.extend("mdc.tutorial.control.ChartWrapper", {
    metadata: {
        properties: {
            width: { type: "sap.ui.core.CSSSize", defaultValue: "auto" },
            height: { type: "sap.ui.core.CSSSize", defaultValue: "100%" },
            chartType: { type: "string", defaultValue: "bar" },
            datasets: { type: "array", defaultValue: null },
            scales: { type: "object", defaultValue: null },
            labels: { type: "array", defaultValue: [] },
            displayLegend: { type: "boolean", defaultValue: true },
            showTooltip: { type: "boolean", defaultValue: true }
        },
        aggregations: {
            data: { type: "sap.ui.core.Element", multiple: true, bindable: "bindable" }
        }
    },
    onAfterRendering: function() {
        if (!this.chart) {
            const ctx = document.getElementById(this.getId() + "--canvas");
            this.chart = new Chart(ctx, this._getConfig());
        }
    }
});
```

## Step 5: Set Up the Component

The Component registers the Chart.js zoom plugin:

###### Component.ts
```typescript
import UIComponent from "sap/ui/core/UIComponent";
import Chart from "custom/Chart";
import ChartZoom from "custom/ChartZoom";

/**
 * @namespace mdc.tutorial
 */
export default class Component extends UIComponent {
    public static metadata = {
        manifest: "json"
    };

    public init(): void {
        super.init();
        Chart.register(ChartZoom);
    }
}
```

### TypeScript Type Declarations

For TypeScript support, create type declarations for the custom modules in `types/custom.d.ts`:

###### types/custom.d.ts
```typescript
declare module "custom/Chart" {
    const Chart: {
        register: (...plugins: any[]) => void;
        [key: string]: any;
    };
    export default Chart;
}

declare module "custom/ChartZoom" {
    const ChartZoom: {
        id: string;
        [key: string]: any;
    };
    export default ChartZoom;
}
```

## Step 6: Define PropertyInfos

Create a `PropertyInfos.json` file in the `model` directory to define the chart properties:

###### model/PropertyInfos.json
```json
[
    {
        "key": "Name",
        "path": "Name",
        "dataType": "sap.ui.model.type.String",
        "label": "Name",
        "sortable": true,
        "filterable": true,
        "aggregatable": false,
        "groupable": true,
        "role": "category"
    },
    {
        "key": "Price",
        "path": "Price",
        "dataType": "sap.ui.model.type.Float",
        "label": "Price",
        "sortable": false,
        "filterable": true,
        "aggregatable": true,
        "groupable": false,
        "role": "axis1"
    }
]
```

>ℹ️ Properties with `groupable: true` are treated as dimensions (X-axis), while properties with `aggregatable: true` are treated as measures (Y-axis).

## Step 7: Use the MDC Chart in the View

Add the MDC Chart to your XML view with the ChartJSDelegate:

###### view/Demo.view.xml
```xml
<mvc:View
    controllerName="mdc.tutorial.controller.Demo"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns:mdc="sap.ui.mdc"
    xmlns:mdcc="sap.ui.mdc.chart"
    xmlns:variants="sap.ui.fl.variants"
    xmlns="sap.m">
    <App id="app">
        <Page>
            <mdc:Chart id="chart"
                autoBindOnInit="true"
                p13nMode="Type,Item,Sort,Filter"
                showChartTooltip="true"
                legendVisible="true"
                delegate="{
                    'name': 'mdc/tutorial/delegate/ChartJSDelegate',
                    'payload': {
                        model: 'products>/',
                        infomodel: 'propertyinfos'
                    }
                }"
                chartType="bar"
                header="Products"
                height="100%"
                width="100%">
                <mdc:variant>
                    <variants:VariantManagement id="IDVariantManagementOfChart" for="chart"/>
                </mdc:variant>
                <mdc:items>
                    <mdcc:Item propertyKey="Name" type="groupable" label="Name" role="category" />
                    <mdcc:Item propertyKey="Price" type="aggregatable" role="axis1" label="Price"/>
                    <mdcc:Item propertyKey="Quantity" type="aggregatable" role="axis1" label="Quantity"/>
                </mdc:items>
            </mdc:Chart>
        </Page>
    </App>
</mvc:View>
```

Run the application to see the MDC Chart powered by Chart.js! 🎉

## Summary

In this exercise, we learned how to:
- Integrate a third-party charting library (Chart.js) with MDC Chart
- Configure the UI5 loader to load AMD modules with shims
- Create a custom ChartDelegate that bridges MDC Chart with Chart.js
- Create a ChartWrapper control to manage Chart.js rendering

## License
This package uses ChartJs, hammerjs, chartjs-zoom-plugin under the terms of the [MIT](https://github.com/UI5/openui5/blob/master/LICENSES/MIT.txt).
