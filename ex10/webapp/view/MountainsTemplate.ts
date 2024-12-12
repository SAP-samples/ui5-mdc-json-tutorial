import Control from "sap/ui/core/Control";
import View from "sap/ui/core/mvc/View";
import XMLView from "sap/ui/core/mvc/XMLView";
import JSONPropertyInfo from "../model/metadata/JSONPropertyInfo";
import JSONModel from "sap/ui/model/json/JSONModel";

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
                    models: {
                        pim: new JSONModel(JSONPropertyInfo)
                    }
                }
            },
            cache: {
                keys: [this.calculateCacheKey()+Date.now()]
            }
        });
    }

    // simple cache key calculation as an example
    private calculateCacheKey(): string {
        const month = new Date().getMonth();
        return `cacheKeyMonth${month}`;
    }
}