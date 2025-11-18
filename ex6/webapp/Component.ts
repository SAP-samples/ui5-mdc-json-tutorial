import UIComponent from "sap/ui/core/UIComponent"

/**
 * @namespace mdc.tutorial
 */
export default class Component extends UIComponent {
    public static metadata = {
        manifest: "json"
    };

    public init(): void {
        // call the base component's init function
        super.init();
    };
}