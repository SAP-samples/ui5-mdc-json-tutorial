sap.ui.define([
    "sap/ui/mdc/GeomapDelegate",
    "./BaseDelegate",
    "sap/ui/geomap/Geomap",
    "sap/ui/geomap/GeomapProvider",
    "sap/ui/geomap/GeomapSpot",
    "sap/ui/geomap/GeomapNavigationControl",
    "sap/ui/geomap/GeomapScaleControl",
    "sap/ui/geomap/GeomapCopyrightControl",
    "sap/ui/mdc/enums/GeomapControlPosition",
    "sap/ui/model/json/JSONModel",
    "sap/m/Text",
    "sap/m/Link",
    "sap/m/Popover",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/Bar",
    "sap/m/Title"
], function (
    GeomapDelegate, BaseDelegate,
    Geomap, GeomapProvider, GeomapSpot,
    GeomapNavigationControl, GeomapScaleControl, GeomapCopyrightControl,
    GeomapControlPosition, JSONModel, Text, Link,
    Popover, List, StandardListItem, Bar, Title
) {
    "use strict";

    var StoreDetailGeomapDelegate = Object.assign({}, GeomapDelegate, BaseDelegate);

    StoreDetailGeomapDelegate.fetchProperties = function () {
        return Promise.resolve([
            { key: "latitude", label: "Latitude", path: "latitude", dataType: "sap.ui.model.type.Float", visible: true },
            { key: "longitude", label: "Longitude", path: "longitude", dataType: "sap.ui.model.type.Float", visible: true }
        ]);
    };

    StoreDetailGeomapDelegate.initializeGeomap = function (oGeomap) {
        return StoreDetailGeomapDelegate._createContentFromPropertyInfos(oGeomap, false);
    };

    StoreDetailGeomapDelegate._createContentFromPropertyInfos = function (oGeomap, bForceRebind) {
        return new Promise(function (resolve) {
            var aMapControls = [];

            aMapControls.push(new GeomapProvider({
                styleUrl: StoreDetailGeomapDelegate._getProviderUrl()
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

            // Cleanup previous inner geomap
            var oExisting = oGeomap.getAggregation("_geomap");
            if (oExisting) {
                oExisting.destroy();
                oGeomap.removeAggregation("_geomap");
            }

            // Try to read binding context immediately for center coordinates
            var fInitLat = parseFloat(oGeomap.getCenterLat()) || 0;
            var fInitLng = parseFloat(oGeomap.getCenterLng()) || 0;
            var iInitZoom = oGeomap.getZoom() || 4;

            var oContext = oGeomap.getBindingContext();
            if (oContext) {
                var oObj = oContext.getObject();
                if (oObj && oObj.latitude != null && oObj.longitude != null) {
                    fInitLat = parseFloat(oObj.latitude);
                    fInitLng = parseFloat(oObj.longitude);
                    iInitZoom = 14;
                }
            }

            var oGeomapInstance = new Geomap({
                centerLat: fInitLat,
                centerLng: fInitLng,
                zoom: iInitZoom,
                height: oGeomap.getHeight(),
                width: oGeomap.getWidth(),
                mapControls: aMapControls,
                items: []
            });

            oGeomap.setAggregation("_geomap", oGeomapInstance);

            // Re-attach location picker if enabled (survives rebind)
            if (StoreDetailGeomapDelegate._bPickerEnabled) {
                StoreDetailGeomapDelegate._attachMapClickListener(oGeomapInstance);
            }

            var oModel = oGeomap.getModel();
            if (oModel) {
                oGeomapInstance.setModel(oModel);

                // Render spot from binding context
                var fnRenderSpot = function () {
                    var oBCtx = oGeomap.getBindingContext();
                    if (!oBCtx) {
                        return;
                    }

                    var oData = oBCtx.getObject();
                    if (oData && oData.latitude != null && oData.longitude != null) {
                        var fLat = parseFloat(oData.latitude);
                        var fLng = parseFloat(oData.longitude);

                        oGeomapInstance.setCenterLat(fLat);
                        oGeomapInstance.setCenterLng(fLng);
                        oGeomapInstance.setZoom(14);

                        var aFlattened = [{
                            geometry: { type: "Point", coordinates: [fLng, fLat] },
                            properties: oData
                        }];

                        var oFlatModel = new JSONModel(aFlattened);
                        oGeomapInstance.setModel(oFlatModel);
                        oGeomapInstance.bindAggregation("items", {
                            path: "/",
                            factory: function (sId, oCtx) {
                                var oItem = oCtx.getObject();
                                var oSpot = new GeomapSpot({
                                    lng: oItem.geometry.coordinates[0],
                                    lat: oItem.geometry.coordinates[1],
                                    color: "#CC0000",
                                    width: "3rem",
                                    height: "3rem"
                                });

                                oSpot.attachClick(function (oEvent) {
                                    var oTarget = oEvent.getSource();
                                    var oPopover = new Popover({
                                        contentWidth: "280px",
                                        placement: "Auto",
                                        customHeader: new Bar({
                                            contentLeft: [
                                                new Title({ text: oItem.properties.name, level: "H5" })
                                            ]
                                        }),
                                        content: [
                                            new List({
                                                showSeparators: "None",
                                                items: [
                                                    new StandardListItem({ title: oItem.properties.city + ", " + oItem.properties.country, icon: "sap-icon://map" }),
                                                    new StandardListItem({ title: oItem.properties.address || "-", icon: "sap-icon://address-book" }),
                                                    new StandardListItem({ title: oItem.properties.phone || "-", icon: "sap-icon://phone" }),
                                                    new StandardListItem({ title: oItem.properties.openingHours || "-", icon: "sap-icon://clock" })
                                                ]
                                            })
                                        ]
                                    });
                                    oTarget.addDependent(oPopover);
                                    oPopover.openBy(oTarget);
                                });

                                return oSpot;
                            },
                            templateShareable: false
                        });
                    }
                };

                // If context is already available (rebind case), render immediately
                if (oContext && oContext.getObject() && oContext.getObject().latitude != null) {
                    fnRenderSpot();
                } else {
                    // Initial load: wait for binding context to become available
                    setTimeout(fnRenderSpot, 1000);
                }
            }

            resolve(oGeomap);
        });
    };

    StoreDetailGeomapDelegate.rebind = function (oGeomap) {
        return StoreDetailGeomapDelegate._createContentFromPropertyInfos(oGeomap, true);
    };

    StoreDetailGeomapDelegate._getProviderUrl = function () {
        var sPath = sap.ui.require.toUrl("sap/ui/stores/model/osm.json");
        if (sPath.startsWith("/")) {
            return window.location.origin + sPath;
        }
        return new URL(sPath, window.location.href).href;
    };

    StoreDetailGeomapDelegate._getInnerGeomap = function (oGeomap) {
        return oGeomap.getAggregation("_geomap");
    };

    StoreDetailGeomapDelegate.getGeomapBound = function (oGeomap) {
        return !!oGeomap.getAggregation("_geomap");
    };

    /**
     * Updates the spot position in-place without recreating the map.
     * Preserves the current center and zoom so the user's view is not disrupted.
     */
    StoreDetailGeomapDelegate.updateLocationSpot = function (oGeomap, fLat, fLng) {
        var oInnerGeomap = oGeomap.getAggregation("_geomap");
        if (!oInnerGeomap) {
            return;
        }

        // Remove existing items and add new spot at clicked position
        oInnerGeomap.destroyItems();
        var aFlattened = [{
            geometry: { type: "Point", coordinates: [fLng, fLat] },
            properties: {}
        }];
        var oFlatModel = new JSONModel(aFlattened);
        oInnerGeomap.setModel(oFlatModel);
        oInnerGeomap.bindAggregation("items", {
            path: "/",
            factory: function (sId, oCtx) {
                var oItem = oCtx.getObject();
                return new GeomapSpot({
                    lng: oItem.geometry.coordinates[0],
                    lat: oItem.geometry.coordinates[1],
                    color: "#CC0000",
                    width: "3rem",
                    height: "3rem"
                });
            },
            templateShareable: false
        });
    };

    /**
     * Enables map click to pick a location. In edit mode, clicking on the map
     * places/moves a spot and calls fnCallback with {lat, lng}.
     */
    StoreDetailGeomapDelegate.enableLocationPicker = function (oGeomap, fnCallback) {
        StoreDetailGeomapDelegate._fnLocationCallback = fnCallback;
        StoreDetailGeomapDelegate._bPickerEnabled = true;

        var oInnerGeomap = oGeomap.getAggregation("_geomap");
        if (oInnerGeomap) {
            StoreDetailGeomapDelegate._attachMapClickListener(oInnerGeomap);
        }
    };

    /**
     * Disables the location picker.
     */
    StoreDetailGeomapDelegate.disableLocationPicker = function (oGeomap) {
        StoreDetailGeomapDelegate._bPickerEnabled = false;
        StoreDetailGeomapDelegate._fnLocationCallback = null;

        // Remove MapLibre click handler if attached
        var oInnerGeomap = oGeomap.getAggregation("_geomap");
        if (oInnerGeomap && StoreDetailGeomapDelegate._mapClickHandler) {
            var oMap = StoreDetailGeomapDelegate._getMapInstance(oInnerGeomap);
            if (oMap) {
                oMap.off("click", StoreDetailGeomapDelegate._mapClickHandler);
            }
            StoreDetailGeomapDelegate._mapClickHandler = null;
        }
    };

    StoreDetailGeomapDelegate._getMapInstance = function (oInnerGeomap) {
        // Try multiple accessors for the MapLibre map instance
        if (oInnerGeomap._oMap) { return oInnerGeomap._oMap; }
        if (oInnerGeomap.getMap && oInnerGeomap.getMap()) { return oInnerGeomap.getMap(); }

        var oDomRef = oInnerGeomap.getDomRef();
        if (oDomRef) {
            // The web component may expose the map on its DOM element
            if (oDomRef._map) { return oDomRef._map; }
            if (oDomRef.map) { return oDomRef.map; }
            if (oDomRef.getMap) { return oDomRef.getMap(); }
            // Check shadow root for maplibregl container
            if (oDomRef.shadowRoot) {
                var oShadowChild = oDomRef.shadowRoot.firstElementChild;
                if (oShadowChild && oShadowChild._map) { return oShadowChild._map; }
            }
        }
        return null;
    };

    StoreDetailGeomapDelegate._attachMapClickListener = function (oInnerGeomap) {
        // Remove any existing handler
        if (StoreDetailGeomapDelegate._mapClickHandler) {
            var oExistingMap = StoreDetailGeomapDelegate._getMapInstance(oInnerGeomap);
            if (oExistingMap) {
                oExistingMap.off("click", StoreDetailGeomapDelegate._mapClickHandler);
            }
            StoreDetailGeomapDelegate._mapClickHandler = null;
        }

        // Define the handler that uses MapLibre's native click event (provides lngLat directly)
        StoreDetailGeomapDelegate._mapClickHandler = function (e) {
            if (!StoreDetailGeomapDelegate._bPickerEnabled || !StoreDetailGeomapDelegate._fnLocationCallback) {
                return;
            }
            StoreDetailGeomapDelegate._fnLocationCallback({
                lat: e.lngLat.lat,
                lng: e.lngLat.lng
            });
        };

        // Try to attach immediately
        var oMap = StoreDetailGeomapDelegate._getMapInstance(oInnerGeomap);
        if (oMap) {
            oMap.on("click", StoreDetailGeomapDelegate._mapClickHandler);
            return;
        }

        // MapLibre may not be initialized yet — use onAfterRendering + retry
        var iRetryCount = 0;
        var fnRetry = function () {
            var oMapRetry = StoreDetailGeomapDelegate._getMapInstance(oInnerGeomap);
            if (oMapRetry) {
                if (StoreDetailGeomapDelegate._bPickerEnabled && StoreDetailGeomapDelegate._mapClickHandler) {
                    oMapRetry.on("click", StoreDetailGeomapDelegate._mapClickHandler);
                }
            } else if (iRetryCount < 10) {
                iRetryCount++;
                setTimeout(fnRetry, 500);
            }
        };

        oInnerGeomap.addEventDelegate({
            onAfterRendering: function () {
                setTimeout(fnRetry, 500);
            }
        });

        // Also start retrying immediately in case already rendered
        setTimeout(fnRetry, 1000);
    };

    return StoreDetailGeomapDelegate;
});
