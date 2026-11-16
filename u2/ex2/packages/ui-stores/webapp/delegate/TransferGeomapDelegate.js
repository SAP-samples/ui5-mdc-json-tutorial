sap.ui.define([
    "sap/ui/mdc/GeomapDelegate",
    "./BaseDelegate",
    "sap/ui/geomap/Geomap",
    "sap/ui/geomap/GeomapProvider",
    "sap/ui/geomap/GeomapNavigationControl",
    "sap/ui/geomap/GeomapScaleControl",
    "sap/ui/geomap/GeomapCopyrightControl",
    "sap/ui/mdc/enums/GeomapControlPosition",
    "sap/m/Text",
    "sap/m/Link"
], function (
    GeomapDelegate, BaseDelegate,
    Geomap, GeomapProvider,
    GeomapNavigationControl, GeomapScaleControl, GeomapCopyrightControl,
    GeomapControlPosition, Text, Link
) {
    "use strict";

    var TransferGeomapDelegate = Object.assign({}, GeomapDelegate, BaseDelegate);

    TransferGeomapDelegate.fetchProperties = function () {
        return Promise.resolve([]);
    };

    TransferGeomapDelegate.initializeGeomap = function (oGeomap) {
        return TransferGeomapDelegate._createMap(oGeomap);
    };

    TransferGeomapDelegate.rebind = function (oGeomap) {
        // No-op: controller manages spots and routes programmatically
        if (!oGeomap.getAggregation("_geomap")) {
            TransferGeomapDelegate._createMap(oGeomap);
        }
    };

    TransferGeomapDelegate._createMap = function (oGeomap) {
        return new Promise(function (resolve) {
            var oExisting = oGeomap.getAggregation("_geomap");
            if (oExisting) {
                oExisting.destroy();
                oGeomap.removeAggregation("_geomap");
            }

            var aMapControls = [];
            aMapControls.push(new GeomapProvider({
                styleUrl: TransferGeomapDelegate._getProviderUrl()
            }));
            aMapControls.push(new GeomapNavigationControl({
                position: GeomapControlPosition.TopLeft
            }));
            aMapControls.push(new GeomapScaleControl({
                position: GeomapControlPosition.BottomLeft
            }));

            var oText = new Text({ text: "Map data from " });
            var oLink = new Link({
                text: "OpenStreetMap",
                href: "https://www.openstreetmap.org/copyright",
                target: "_blank"
            });
            aMapControls.push(new GeomapCopyrightControl({
                position: GeomapControlPosition.BottomRight,
                content: [oText, oLink]
            }));

            var oGeomapInstance = new Geomap({
                centerLat: oGeomap.getCenterLat(),
                centerLng: oGeomap.getCenterLng(),
                zoom: oGeomap.getZoom(),
                height: oGeomap.getHeight(),
                width: oGeomap.getWidth(),
                mapControls: aMapControls,
                items: []
            });

            oGeomap.setAggregation("_geomap", oGeomapInstance);
            resolve(oGeomap);
        });
    };

    TransferGeomapDelegate._getProviderUrl = function () {
        var sPath = sap.ui.require.toUrl("sap/ui/stores/model/osm.json");
        if (sPath.startsWith("/")) {
            return window.location.origin + sPath;
        }
        return new URL(sPath, window.location.href).href;
    };

    TransferGeomapDelegate._getMapInstance = function (oInnerGeomap) {
        if (oInnerGeomap._oMap) { return oInnerGeomap._oMap; }
        if (oInnerGeomap.getMap && oInnerGeomap.getMap()) { return oInnerGeomap.getMap(); }
        var oDomRef = oInnerGeomap.getDomRef();
        if (oDomRef) {
            if (oDomRef._map) { return oDomRef._map; }
            if (oDomRef.map) { return oDomRef.map; }
            if (oDomRef.getMap) { return oDomRef.getMap(); }
            if (oDomRef.shadowRoot) {
                var oShadowChild = oDomRef.shadowRoot.firstElementChild;
                if (oShadowChild && oShadowChild._map) { return oShadowChild._map; }
            }
        }
        return null;
    };

    /**
     * Fits the map view to show both source and destination points with padding.
     * @param {sap.ui.mdc.Geomap} oGeomap - The MDC Geomap control
     * @param {object} oSource - Source point {lat, lng}
     * @param {object} oDest - Destination point {lat, lng}
     */
    TransferGeomapDelegate.fitBounds = function (oGeomap, oSource, oDest) {
        var oInnerGeomap = oGeomap.getAggregation("_geomap");
        if (!oInnerGeomap) { return; }

        var oMap = TransferGeomapDelegate._getMapInstance(oInnerGeomap);
        if (oMap && oMap.fitBounds) {
            oMap.fitBounds(
                [[Math.min(oSource.lng, oDest.lng), Math.min(oSource.lat, oDest.lat)],
                 [Math.max(oSource.lng, oDest.lng), Math.max(oSource.lat, oDest.lat)]],
                { padding: 60, maxZoom: 12 }
            );
        } else {
            // Fallback if map instance not yet ready
            oInnerGeomap.setCenterLat((oSource.lat + oDest.lat) / 2);
            oInnerGeomap.setCenterLng((oSource.lng + oDest.lng) / 2);
            oInnerGeomap.setZoom(5);
        }
    };

    return TransferGeomapDelegate;
});
