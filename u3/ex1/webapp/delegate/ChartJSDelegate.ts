import BaseDelegate from "sap/ui/mdc/ChartDelegate";
import ChartWrapper from "mdc/tutorial/control/ChartWrapper";
import ChartJSPropertyHelper from "./ChartJSPropertyHelper";
import ChartItem from "sap/ui/mdc/chart/Item";
import ChartItemRoleType from "sap/ui/mdc/enums/ChartItemRoleType";
import ChartItemPanel from "sap/ui/mdc/p13n/panels/ChartItemPanel";
import Sorter from "sap/ui/model/Sorter";
import Element from "sap/ui/core/Element";
import FilterField from "sap/ui/mdc/FilterField";

type Chart = any;
type ChartItemType = any;
type PropertyBag = any;

const ChartDelegate: any = { ...BaseDelegate };
const mStateMap = new WeakMap();

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
ChartDelegate.getFilterDelegate = function(oChart: Chart) {
    return {
        addItem: function(oChart: Chart, sPropertyKey: string) {
            const oPropertyInfo = oChart.getPropertyHelper().getProperty(sPropertyKey);
            return Promise.resolve(
                new FilterField(
                    oChart.getId() + "--" + sPropertyKey,
                    {
                        propertyKey: oPropertyInfo.key,
                        conditions: `{$filters>/conditions/${sPropertyKey}}`
                    }
                )
            );
        }
    };
};
ChartDelegate.addItem = function(oChart: Chart, sPropertyKey: string, mPropertyBag: PropertyBag, sRole: string) {
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
ChartDelegate.removeItem = function(oChart: Chart, oItem: ChartItemType, mPropertyBag: PropertyBag) {
    oItem.destroy();
    return Promise.resolve(true);
};

//  * Inserts a chart item (measure / dimension for <code>sap.chart.Chart</code>) into the inner chart.<br>
ChartDelegate.insertItemToInnerChart = function(oChart: Chart, oItem: ChartItemType, iIndex: number) {
    // console.log("insertItemToInnerChart " + oItem.getLabel());
};

// * Removes a chart item (measure / dimension for <code>sap.chart.Chart</code>) from the inner chart.<br>
ChartDelegate.removeItemFromInnerChart = function(oChart: Chart, oItem: ChartItemType) {
    // console.log("removeItemFromInnerChart " + oItem.getLabel());
};
ChartDelegate.initializeInnerChart = function(oChart: Chart) {
    return new Promise(function(resolve, reject) {
        const oState = this._getState(oChart);
        oState.innerChart = new ChartWrapper({ width: oChart.getWidth() });
        this._setState(oChart, oState);
        resolve(oState.innerChart);
    }.bind(this));
};

//  * Creates the initial content for the chart before the metadata is retrieved.<br>
//  * This can be used by chart libraries that can already show some information without the actual data (for example, axis labels, legend, ...).
ChartDelegate.createInitialChartContent = function(oChart: Chart) {
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
ChartDelegate.setChartType = function(oChart: Chart, sChartType: string) {
    this._getInnerChart(oChart).setChartType(sChartType);
    this._getInnerChart(oChart).updateChart();
};
ChartDelegate.getChartTypeInfo = function(oChart: Chart) {
    let oChartType = {
        icon: "sap-icon://vertical-bar-chart",
        text: "Bar Chart"
    };
    if (this._getInnerChart(oChart)) {
        const sType = oChart.getChartType();
        const aChartTypes = this.getAvailableChartTypes(oChart);
        oChartType = aChartTypes.filter((oType: any) => oType.key === sType)[0];
    }
    return {
        icon: oChartType.icon,
        text: oChartType.text
    };
};
ChartDelegate.getAvailableChartTypes = function(oChart: Chart) {
    return this._getInnerChart(oChart).getAvailableChartTypes();
};
ChartDelegate.getDrillStack = function(oChart: Chart) {
    const aItems = oChart.getItems();
    const aDrillStack: string[] = [];
    aItems.forEach(function(oItem: any) {
        if (oItem.getType() === "groupable") {
            aDrillStack.push(oItem.getPropertyKey());
        }
    });
    return [{ dimension: aDrillStack }];
};
ChartDelegate.getSortedDimensions = function(oChart: Chart) {
    const sortPropertyDimensions = function(aProperties: any[]) {
        const aDimensions = aProperties.filter((oProperty) => oProperty.groupable);
        if (aDimensions) {
            aDimensions.sort((a, b) => {
                if (a.label && b.label) {
                    return a.label.localeCompare(b.label);
                }
            });
        }
        return aDimensions;
    };
    return new Promise(function(resolve, reject) {
        if (oChart.isPropertyHelperFinal()) {
            resolve(sortPropertyDimensions(oChart.getPropertyHelper().getProperties()));
        } else {
            oChart.finalizePropertyHelper().then(() => {
                resolve(sortPropertyDimensions(oChart.getPropertyHelper().getProperties()));
            });
        }
    });
};
ChartDelegate.getBindingInfo = function(oChart: Chart) {
    return {};
};
ChartDelegate.updateBindingInfo = function(oChart: Chart, oBindingInfo: any) {
    oBindingInfo.filters = this.getFilters(oChart);
    oBindingInfo.sorter = this.getSorters(oChart);
};
ChartDelegate.rebind = function(oChart: Chart, oBindingInfo: any) {
    this._rebind(oChart, oBindingInfo);
    // this._getInnerChart(oChart).updateChart();
    const oState = this._getState(oChart);
    oState.fnCallbackDataLoaded();
};
const bindingFormatter = function(oChart: Chart, aData: any[]) {
    const labels: any[] = [];
    const datasets: any[] = [];
    const aItems = oChart.getItems();
    const aDimensionItems = aItems.filter((oItem: any) => oItem.getType() === "groupable");
    const aMeasureItems = aItems.filter((oItem: any) => oItem.getType() === "aggregatable");
    let sXLabel = "";
    aDimensionItems.forEach(function(oItem: any, index: number) {
        const sPropertyKey = oItem.getPropertyKey();
        const oProperty = oChart.getPropertyHelper().getProperty(sPropertyKey);
        sXLabel += (index ? " / " : "") + oProperty.label;
    });
    let sYLabel = "";
    aMeasureItems.forEach(function(oItem: any, index: number) {
        const sPropertyKey = oItem.getPropertyKey();
        const oProperty = oChart.getPropertyHelper().getProperty(sPropertyKey);
        sYLabel += (index ? " / " : "") + oProperty.label;
        const aColors = [
            "rgba(249, 222, 89)",
            "rgba(232, 166, 40)",
            "rgba(249, 131, 101)",
            "rgba(195, 49, 36)",
            "rgba(161, 223, 251)"
        ];
        datasets.push({
            "backgroundColor": [aColors[index % 5]],
            data: []
        });
        aData.forEach(function(oProd: any) {
            if (index === 0) {
                const aLabels: any[] = [];
                aDimensionItems.forEach(function(oItem: any) {
                    const sPropertyKey = oItem.getPropertyKey();
                    const oProperty = oChart.getPropertyHelper()?.getProperty(sPropertyKey);
                    aLabels.push(oProd[oProperty?.path]);
                });
                labels.push(aLabels);
            }
            const val = oProd[oProperty?.path];
            datasets[index].label = oProperty?.label;
            datasets[index].data.push(val);
        });
    });
    const scales = {
        x: {
            title: {
                display: true,
                text: sXLabel
            }
        },
        y: {
            title: {
                display: true,
                text: sYLabel
            },
            beginAtZero: true
        }
    };
    return { labels, datasets, scales };
};
ChartDelegate._rebind = function(oChart: Chart, oBindingInfo: any) {
    const oPayload = oChart.getDelegate().payload;
    const oDataBindingInfo = { ...oBindingInfo };
    oDataBindingInfo.path = oPayload.model;
    oDataBindingInfo.factory = function(s: any, oContext: any) {
        return new Element();
    };
    this._getInnerChart(oChart).bindData(oDataBindingInfo);
    const aProductsModelData: any[] = [];
    const aProductsModelDataAll = oChart.getModel(oPayload.model.substring(0, oPayload.model.length - 2)).getData();
    this._getInnerChart(oChart).getData().forEach(function(oWrapper: any) {
        const index = oWrapper.oBindingContexts.products.sPath.substring(1);
        aProductsModelData.push(aProductsModelDataAll[index]);
    });
    const oResult = bindingFormatter(oChart, aProductsModelData);
    this._getInnerChart(oChart).setDatasets(oResult.datasets);
    this._getInnerChart(oChart).setLabels(oResult.labels);
    this._getInnerChart(oChart).setScales(oResult.scales);
};
ChartDelegate.getInnerChartBound = function(oChart: Chart) {
    return true;
};
ChartDelegate.getPropertyHelperClass = function() {
    return ChartJSPropertyHelper;
};
ChartDelegate.fetchProperties = function(oChart: Chart) {
    const oPayload = oChart.getDelegate().payload;
    const aModelInfos = oChart.getModel(oPayload.infomodel).getData();
    return Promise.resolve(aModelInfos);
};
ChartDelegate.getInnerChartSelectionHandler = function(oChart: Chart) {
    return {};
};
ChartDelegate.getChartTypeLayoutConfig = function() {
    const aLayoutOptions = [ChartItemRoleType.axis1, ChartItemRoleType.category];
    const aChartTypeLayout = [
        { key: "bar", allowedLayoutOptions: aLayoutOptions },
        { key: "line", allowedLayoutOptions: aLayoutOptions },
        { key: "pie", allowedLayoutOptions: aLayoutOptions },
        { key: "radar", allowedLayoutOptions: aLayoutOptions },
        { key: "doughnut", allowedLayoutOptions: aLayoutOptions },
        { key: "polarArea", allowedLayoutOptions: aLayoutOptions }
    ];
    return aChartTypeLayout;
};
ChartDelegate.getAdaptionUI = function(oChart: Chart) {
    const oLayoutConfig = this.getChartTypeLayoutConfig().find((chart: any) => chart.key === oChart.getChartType());
    oLayoutConfig.templateConfig = [{ kind: "Groupable" }, { kind: "Aggregatable" }];
    const oPanel = new ChartItemPanel({ panelConfig: oLayoutConfig });
    return Promise.resolve(oPanel);
};
ChartDelegate.zoomIn = function(oChart: Chart) {
    this._getInnerChart(oChart).zoom({ y: 1.1, x: 1.1 });
};
ChartDelegate.zoomOut = function(oChart: Chart) {
    this._getInnerChart(oChart).zoom({ y: 0.9, x: 0.9 });
};
ChartDelegate.getZoomState = function(oChart: Chart) {
    return { enabled: true, currentZoomLevel: 0.5 };
};
ChartDelegate.setLegendVisible = function(oChart: Chart, bVisible: boolean) {
    this._getInnerChart(oChart).setDisplayLegend(bVisible);
    this._getInnerChart(oChart).updateChart();
};
ChartDelegate.setChartTooltipVisibility = function(oChart: Chart, bVisible: boolean) {
    this._getInnerChart(oChart).setShowTooltip(bVisible);
    this._getInnerChart(oChart).updateChart();
};
ChartDelegate.getDrillableItems = function(oChart: Chart) {
    return oChart.getItems().filter((oItem: any) => oItem.getType() === "groupable");
};
ChartDelegate.getInternalChartNameFromPropertyNameAndKind = function(sName: string, sKind: string, oChart: Chart) {
    return sName;
};
ChartDelegate.getSorters = function(oChart: Chart) {
    let aSorters: any[] = [];
    const aSorterProperties = oChart.getSortConditions() ? oChart.getSortConditions().sorters : [];
    aSorterProperties.forEach((oSortProperty: any) => {
        const oItem = oChart.getItems().find((oItem: any) => oItem.getPropertyKey() === oSortProperty.key);
        if (!oItem) {
            return;
        }
        const oSorter = this._getSorterForItem(oItem, oSortProperty);
        aSorters.push(oSorter);
    });
    return aSorters;
};
ChartDelegate._getSorterForItem = function(oItem: any, oSortProperty: any) {
    let sName = "";
    if (oItem.getType() === "aggregatable") {
        sName = this.getInternalChartNameFromPropertyNameAndKind(oItem.getPropertyKey(), "aggregatable", oItem.getParent());
    } else if (oItem.getType() === "groupable") {
        sName = this.getInternalChartNameFromPropertyNameAndKind(oSortProperty.key, "groupable", oItem.getParent());
    }
    return new Sorter(sName, oSortProperty.descending);
};

export default ChartDelegate;
