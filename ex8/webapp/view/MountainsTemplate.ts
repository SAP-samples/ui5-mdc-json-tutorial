import Control from "sap/ui/core/Control";
import "sap/ui/core/mvc/View";
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
            preprocessors: {
                xml: {
                    models: {
                        pim: new JSONModel(JSONPropertyInfo)
                    }
                }
            },
            viewName: "mdc.tutorial.view.Mountains"
        });
    } 
}