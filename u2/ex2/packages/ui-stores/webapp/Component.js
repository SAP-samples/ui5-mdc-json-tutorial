sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/stores/localService/DemoMockServer"
], function (UIComponent, JSONModel, DemoMockServer) {
    "use strict";

    return UIComponent.extend("sap.ui.stores.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            var bDemo = this._isDemoMode();
            this.setModel(new JSONModel({ enabled: bDemo }), "demo");

            if (bDemo) {
                DemoMockServer.init();
                this._patchGeomapWorker();
            }

            UIComponent.prototype.init.apply(this, arguments);
            this.getRouter().initialize();
        },

        _isDemoMode: function () {
            // Check URL parameter ?demo=true
            var oParams = new URLSearchParams(window.location.search);
            if (oParams.get("demo") === "true") {
                return true;
            }
            // Check if demo-config.json marker exists (set by build script)
            var sPath = sap.ui.require.toUrl("sap/ui/stores/demo-config.json");
            try {
                var oReq = new XMLHttpRequest();
                oReq.open("HEAD", sPath, false);
                oReq.send();
                return oReq.status === 200;
            } catch (e) {
                return false;
            }
        },

        /**
         * Patches the Worker constructor to redirect cross-origin geomap worker
         * to the local worker.js bridge. The library's terra-draw.modern.js calls
         * setWorkerUrl with a CDN URL which fails cross-origin. We intercept
         * new Worker(cdnUrl) and redirect to our local bridge.
         */
        _patchGeomapWorker: function () {
            var sWorkerBridge = new URL(
                sap.ui.require.toUrl("sap/ui/stores/worker.js"),
                document.baseURI
            ).href;
            var OriginalWorker = window.Worker;

            window.Worker = function (sUrl, oOpts) {
                if (typeof sUrl === "string" && sUrl.indexOf("maplibre-gl-csp-worker") !== -1) {
                    var sRedirect = sWorkerBridge + "?worker=" + encodeURIComponent(sUrl);
                    return new OriginalWorker(sRedirect, oOpts);
                }
                return new OriginalWorker(sUrl, oOpts);
            };
            window.Worker.prototype = OriginalWorker.prototype;
        }
    });
});
