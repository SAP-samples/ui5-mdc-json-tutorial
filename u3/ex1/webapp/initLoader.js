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
