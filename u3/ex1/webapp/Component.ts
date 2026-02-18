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
    };
}
