import Controller from "sap/ui/core/mvc/Controller"
import JSONModel from "sap/ui/model/json/JSONModel"

/**
 * @namespace Mountains.controller
 */
export default class Mountains extends Controller {
    public onInit(): void {
        const oDataModel = this.createDataModel();
        this.getView().setModel(oDataModel, "data");
        this.getView().byId("geomap").setModel(oDataModel);
    }
    createDataModel(): JSONModel {
        return new JSONModel(sap.ui.require.toUrl("mdc/tutorial/model/mountains.json"));
    }
}
