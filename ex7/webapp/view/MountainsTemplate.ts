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
                    models: {
                        pim: {
                            PropertyInfo: JSONPropertyInfo
                        }
                    }
                }
            }
        });
    } 
}