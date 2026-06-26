sap.ui.define([
    "sap/ui/mdc/GeomapDelegate",
    "./BaseDelegate",
    "sap/ui/geomap/Geomap",
    "sap/ui/geomap/GeomapProvider",
    "sap/ui/geomap/GeomapSpot",
    "sap/ui/geomap/GeomapNavigationControl",
    "sap/ui/geomap/GeomapSelectionControl",
    "sap/ui/geomap/GeomapScaleControl",
    "sap/ui/geomap/GeomapCopyrightControl",
    "sap/ui/mdc/enums/GeomapControlPosition",
    "sap/m/Popover",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/ui/model/json/JSONModel",
    "sap/m/Text",
    "sap/m/Link",
    "sap/m/Button",
    "sap/m/Bar",
    "sap/m/Title",
    "sap/m/MessageToast",
    "sap/ui/core/Component",
    "sap/ui/geomap/GeomapPolygon",
    "sap/ui/geomap/GeomapPoint",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    GeomapDelegate, BaseDelegate,
    Geomap, GeomapProvider, GeomapSpot,
    GeomapNavigationControl, GeomapSelectionControl, GeomapScaleControl, GeomapCopyrightControl,
    GeomapControlPosition, Popover, List, StandardListItem,
    JSONModel, Text, Link, Button, Bar, Title, MessageToast, Component,
    GeomapPolygon, GeomapPoint, Filter, FilterOperator
) {
    "use strict";

    var StoresGeomapDelegate = Object.assign({}, GeomapDelegate, BaseDelegate);

    StoresGeomapDelegate.fetchProperties = function (oGeomap) {
        return Promise.resolve([
            { key: "name", label: "Name", path: "name", dataType: "sap.ui.model.type.String", visible: true },
            { key: "city", label: "City", path: "city", dataType: "sap.ui.model.type.String", visible: true },
            { key: "country", label: "Country", path: "country", dataType: "sap.ui.model.type.String", visible: true },
            { key: "latitude", label: "Latitude", path: "latitude", dataType: "sap.ui.model.type.Float", visible: true },
            { key: "longitude", label: "Longitude", path: "longitude", dataType: "sap.ui.model.type.Float", visible: true }
        ]);
    };

    StoresGeomapDelegate.initializeGeomap = function (oGeomap) {
        return StoresGeomapDelegate._createContentFromPropertyInfos(oGeomap, false);
    };

    StoresGeomapDelegate._createContentFromPropertyInfos = function (oGeomap, bForceRebind) {
        return new Promise(function (resolve) {
            var aMapControls = [];

            aMapControls.push(new GeomapProvider({
                styleUrl: StoresGeomapDelegate._getProviderUrl()
            }));
            aMapControls.push(new GeomapNavigationControl({
                position: GeomapControlPosition.TopLeft
            }));
            aMapControls.push(new GeomapSelectionControl({
                position: GeomapControlPosition.TopRight
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

            // Cleanup previous inner geomap if rebinding
            var oExisting = oGeomap.getAggregation("_geomap");
            if (oExisting) {
                oExisting.destroy();
            }

            var oGeomapInstance = new Geomap({
                centerLat: oGeomap.getCenterLat(),
                centerLng: oGeomap.getCenterLng(),
                zoom: oGeomap.getZoom(),
                height: oGeomap.getHeight(),
                width: oGeomap.getWidth(),
                mapControls: aMapControls,
                items: []
            });

            var oModel = oGeomap.getModel();

            // Model may not be propagated yet (e.g. demo mode with mock server)
            if (!oModel) {
                oGeomap.setAggregation("_geomap", oGeomapInstance);
                var fnModelAvailable = function () {
                    var oM = oGeomap.getModel();
                    if (oM) {
                        oGeomap.detachModelContextChange(fnModelAvailable);
                        StoresGeomapDelegate._loadSpots(oGeomap, oGeomapInstance, oM);
                    }
                };
                oGeomap.attachModelContextChange(fnModelAvailable);
                resolve(oGeomapInstance);
                return;
            }

            StoresGeomapDelegate._loadSpots(oGeomap, oGeomapInstance, oModel);

            oGeomap.setAggregation("_geomap", oGeomapInstance);
            resolve(oGeomapInstance);
        });
    };

    StoresGeomapDelegate._loadSpots = function (oGeomap, oGeomapInstance, oModel) {
            oGeomapInstance.setModel(oModel);

            // Fetch data via OData V4 list binding
            var sDelegatePayload = oGeomap.getDelegate().payload || {};
            var sCollectionName = sDelegatePayload.collectionName || "Stores";

            var oListBinding = oModel.bindList(
                "/" + sCollectionName,
                null, null,
                [new Filter({ path: "IsActiveEntity", operator: FilterOperator.EQ, value1: true })],
                { $$ownRequest: true }
            );

            oListBinding.requestContexts(0, Infinity).then(function (aContexts) {
                var aFlattened = [];
                var oSpotConfig = sDelegatePayload.spotConfig || {};

                aContexts.forEach(function (oContext) {
                    var oObj = oContext.getObject();
                    if (oObj.latitude != null && oObj.longitude != null) {
                        aFlattened.push({
                            geometry: {
                                type: "Point",
                                coordinates: [parseFloat(oObj.longitude), parseFloat(oObj.latitude)]
                            },
                            properties: oObj
                        });
                    }
                });

                // Store flattened data for selection queries
                StoresGeomapDelegate._aStoreData = aFlattened;

                var oFlatModel = new JSONModel(aFlattened);
                oGeomapInstance.setModel(oFlatModel);
                oGeomapInstance.bindAggregation("items", {
                    path: "/",
                    factory: StoresGeomapDelegate._createItemFactory.bind(null, oSpotConfig, oGeomap),
                    templateShareable: false
                });
            });

            // Attach selection-finish event on the inner geomap DOM element
            StoresGeomapDelegate._attachSelectionFinish(oGeomapInstance, oGeomap);
    };

    StoresGeomapDelegate._createItemFactory = function (oSpotConfig, oMdcGeomap, sId, oContext) {
        var oObj = oContext.getObject();
        var oSpot = new GeomapSpot({
            lng: oObj.geometry.coordinates[0],
            lat: oObj.geometry.coordinates[1],
            color: oSpotConfig.color || "#CC0000",
            width: oSpotConfig.width || "1.5rem",
            height: oSpotConfig.height || "1.5rem"
        });

        oSpot.attachClick(function (oEvent) {
            var oTarget = oEvent.getSource();

            var oPopover = new Popover({
                title: oObj.properties.name,
                contentWidth: "280px",
                placement: "Auto",
                customHeader: new Bar({
                    contentLeft: [
                        new Title({ text: oObj.properties.name, level: "H5" })
                    ],
                    contentRight: [
                        new Button({
                            icon: "sap-icon://navigation-right-arrow",
                            type: "Transparent",
                            tooltip: "Show Details",
                            press: function () {
                                var oComponent = Component.getOwnerComponentFor(oPopover);
                                if (!oComponent) {
                                    var oParent = oPopover.getParent();
                                    while (oParent && !oComponent) {
                                        oComponent = Component.getOwnerComponentFor(oParent);
                                        oParent = oParent.getParent();
                                    }
                                }
                                if (oComponent) {
                                    oComponent.getRouter().navTo("storeDetail", {
                                        storeId: oObj.properties.ID
                                    });
                                }
                                oPopover.close();
                            }
                        })
                    ]
                }),
                content: [
                    new List({
                        showSeparators: "None",
                        items: [
                            new StandardListItem({ title: oObj.properties.city + ", " + oObj.properties.country, icon: "sap-icon://map" }),
                            new StandardListItem({ title: oObj.properties.address || "-", icon: "sap-icon://address-book" }),
                            new StandardListItem({ title: oObj.properties.phone || "-", icon: "sap-icon://phone" })
                        ]
                    }),
                    new Button({
                        text: "Transfer Goods",
                        icon: "sap-icon://shipping-status",
                        type: "Transparent",
                        width: "100%",
                        enabled: false,
                        press: function () {
                            var oComp = Component.getOwnerComponentFor(oPopover);
                            if (!oComp) {
                                var oPar = oPopover.getParent();
                                while (oPar && !oComp) {
                                    oComp = Component.getOwnerComponentFor(oPar);
                                    oPar = oPar.getParent();
                                }
                            }
                            if (oComp) {
                                oComp.getRouter().navTo("transfer", {
                                    storeId: oObj.properties.ID
                                });
                            }
                            oPopover.close();
                        }
                    }),
                    new Button({
                        text: "Outgoing Transfers",
                        icon: "sap-icon://arrow-right",
                        type: "Transparent",
                        width: "100%",
                        visible: false,
                        press: function () {
                            var oComp = Component.getOwnerComponentFor(oPopover);
                            if (!oComp) {
                                var oPar = oPopover.getParent();
                                while (oPar && !oComp) {
                                    oComp = Component.getOwnerComponentFor(oPar);
                                    oPar = oPar.getParent();
                                }
                            }
                            var sTransferId = oPopover.getContent()[2].data("transferId");
                            if (oComp && sTransferId) {
                                oComp.getRouter().navTo("transferDetail", {
                                    transferId: sTransferId
                                });
                            }
                            oPopover.close();
                        }
                    }),
                    new Button({
                        text: "Incoming Transfers",
                        icon: "sap-icon://arrow-left",
                        type: "Transparent",
                        width: "100%",
                        visible: false,
                        press: function () {
                            var oComp = Component.getOwnerComponentFor(oPopover);
                            if (!oComp) {
                                var oPar = oPopover.getParent();
                                while (oPar && !oComp) {
                                    oComp = Component.getOwnerComponentFor(oPar);
                                    oPar = oPar.getParent();
                                }
                            }
                            var sTransferId = oPopover.getContent()[3].data("transferId");
                            if (oComp && sTransferId) {
                                oComp.getRouter().navTo("transferDetail", {
                                    transferId: sTransferId
                                });
                            }
                            oPopover.close();
                        }
                    }),
                    new Button({
                        text: "Show Routes",
                        icon: "sap-icon://route-to",
                        type: "Transparent",
                        width: "100%",
                        visible: false,
                        press: function () {
                            oPopover.close();
                            sap.ui.getCore().getEventBus().publish("StoresMap", "ShowTransferRoutes", {
                                storeId: oObj.properties.ID
                            });
                        }
                    })
                ]
            });
            oTarget.addDependent(oPopover);
            oPopover.openBy(oTarget);

            // Check inventory availability and enable/disable transfer button
            var oODataModel = oMdcGeomap.getModel();
            if (oODataModel) {
                var sInvPath = "/Stores(ID=" + oObj.properties.ID + ",IsActiveEntity=true)/inventory";
                var oListBinding = oODataModel.bindList(sInvPath);
                oListBinding.requestContexts(0, 1).then(function (aContexts) {
                    var oTransferBtn = oPopover.getContent()[1];
                    if (oTransferBtn) {
                        oTransferBtn.setEnabled(aContexts.length > 0);
                    }
                });

                // Check active transfers (exclude Completed)
                var sStoreId = oObj.properties.ID;
                var oOutBinding = oODataModel.bindList("/Transfers", null, null, [
                    new Filter("sourceStore_ID", FilterOperator.EQ, sStoreId),
                    new Filter("status", FilterOperator.NE, "Completed")
                ]);
                var oInBinding = oODataModel.bindList("/Transfers", null, null, [
                    new Filter("destStore_ID", FilterOperator.EQ, sStoreId),
                    new Filter("status", FilterOperator.NE, "Completed")
                ]);

                Promise.all([
                    oOutBinding.requestContexts(0, 5),
                    oInBinding.requestContexts(0, 5)
                ]).then(function (aResults) {
                    var aOut = aResults[0];
                    var aIn = aResults[1];
                    var oOutBtn = oPopover.getContent()[2];
                    var oInBtn = oPopover.getContent()[3];
                    var oShowRoutesBtn = oPopover.getContent()[4];

                    if (aOut.length > 0 && oOutBtn) {
                        oOutBtn.setVisible(true);
                        oOutBtn.setText("Outgoing Transfers (" + aOut.length + ")");
                        oOutBtn.data("transferId", aOut[0].getObject().ID);
                    }
                    if (aIn.length > 0 && oInBtn) {
                        oInBtn.setVisible(true);
                        oInBtn.setText("Incoming Transfers (" + aIn.length + ")");
                        oInBtn.data("transferId", aIn[0].getObject().ID);
                    }
                    if ((aOut.length > 0 || aIn.length > 0) && oShowRoutesBtn) {
                        oShowRoutesBtn.setVisible(true);
                    }
                });
            }
        });

        return oSpot;
    };

    StoresGeomapDelegate.rebind = function (oGeomap, aFilters) {
        var oExisting = oGeomap.getAggregation("_geomap");
        if (oExisting) {
            oExisting.destroy();
        }

        // Remove choropleth legend if present
        var oDomRef = oGeomap.getDomRef();
        if (oDomRef) {
            var oLegend = oDomRef.querySelector(".choropleth-legend");
            if (oLegend) {
                oLegend.remove();
            }
        }

        return new Promise(function (resolve) {
            var aMapControls = [];

            aMapControls.push(new GeomapProvider({
                styleUrl: StoresGeomapDelegate._getProviderUrl()
            }));
            aMapControls.push(new GeomapNavigationControl({
                position: GeomapControlPosition.TopLeft
            }));
            aMapControls.push(new GeomapSelectionControl({
                position: GeomapControlPosition.TopRight
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

            var oModel = oGeomap.getModel();
            oGeomapInstance.setModel(oModel);

            var sDelegatePayload = oGeomap.getDelegate().payload || {};
            var sCollectionName = sDelegatePayload.collectionName || "Stores";

            var aAllFilters = [new Filter({ path: "IsActiveEntity", operator: FilterOperator.EQ, value1: true })];
            if (aFilters && aFilters.length > 0) {
                aAllFilters = aAllFilters.concat(aFilters);
            }

            var oListBinding = oModel.bindList(
                "/" + sCollectionName,
                null, null,
                aAllFilters,
                { $$ownRequest: true }
            );

            oListBinding.requestContexts(0, Infinity).then(function (aContexts) {
                var aFlattened = [];
                var oSpotConfig = sDelegatePayload.spotConfig || {};

                aContexts.forEach(function (oContext) {
                    var oObj = oContext.getObject();
                    if (oObj.latitude != null && oObj.longitude != null) {
                        aFlattened.push({
                            geometry: {
                                type: "Point",
                                coordinates: [parseFloat(oObj.longitude), parseFloat(oObj.latitude)]
                            },
                            properties: oObj
                        });
                    }
                });

                // Update stored data for selection queries
                StoresGeomapDelegate._aStoreData = aFlattened;

                var oFlatModel = new JSONModel(aFlattened);
                oGeomapInstance.setModel(oFlatModel);
                oGeomapInstance.bindAggregation("items", {
                    path: "/",
                    factory: StoresGeomapDelegate._createItemFactory.bind(null, oSpotConfig, oGeomap),
                    templateShareable: false
                });
            });

            // Attach selection-finish event
            StoresGeomapDelegate._attachSelectionFinish(oGeomapInstance, oGeomap);

            oGeomap.setAggregation("_geomap", oGeomapInstance);
            resolve(oGeomap);
        });
    };

    StoresGeomapDelegate._getProviderUrl = function () {
        var sPath = sap.ui.require.toUrl("sap/ui/stores/model/osm.json");
        if (sPath.startsWith("/")) {
            return window.location.origin + sPath;
        }
        return new URL(sPath, window.location.href).href;
    };

    StoresGeomapDelegate._getInnerGeomap = function (oGeomap) {
        return oGeomap.getAggregation("_geomap");
    };

    StoresGeomapDelegate.getGeomapBound = function (oGeomap) {
        return !!oGeomap.getAggregation("_geomap");
    };

    /**
     * Attaches selection-finish event on the inner geomap's DOM element.
     * When the user finishes drawing a selection area, finds stores within
     * that polygon and shows them in a popover.
     */
    StoresGeomapDelegate._attachSelectionFinish = function (oGeomapInstance, oMdcGeomap) {
        oGeomapInstance.addEventDelegate({
            onAfterRendering: function () {
                var oDomRef = oGeomapInstance.getDomRef();
                if (!oDomRef || oDomRef._selectionFinishAttached) {
                    return;
                }
                oDomRef._selectionFinishAttached = true;

                oDomRef.addEventListener("selection-finish", function (evt) {
                    var aSnapshot = evt.detail && evt.detail.snapshot;
                    if (!aSnapshot || aSnapshot.length === 0) {
                        return;
                    }

                    // Find the polygon geometry from the snapshot
                    var oPolygonFeature = null;
                    for (var i = 0; i < aSnapshot.length; i++) {
                        if (aSnapshot[i].geometry && aSnapshot[i].geometry.type === "Polygon") {
                            oPolygonFeature = aSnapshot[i];
                            break;
                        }
                    }
                    if (!oPolygonFeature) {
                        return;
                    }

                    var aRing = oPolygonFeature.geometry.coordinates[0]; // outer ring [[lng,lat],...]
                    var aStoreData = StoresGeomapDelegate._aStoreData || [];
                    var aMatched = [];

                    aStoreData.forEach(function (oStore) {
                        var fLng = oStore.geometry.coordinates[0];
                        var fLat = oStore.geometry.coordinates[1];
                        if (StoresGeomapDelegate._pointInPolygon([fLng, fLat], aRing)) {
                            aMatched.push(oStore.properties);
                        }
                    });

                    if (aMatched.length === 0) {
                        MessageToast.show("No stores found in selected area.");
                        return;
                    }

                    // Show popover with matched stores
                    var oStoreList = new List({
                        items: aMatched.map(function (oProps) {
                            return new StandardListItem({
                                title: oProps.name,
                                description: oProps.city + ", " + oProps.country
                            });
                        })
                    });

                    var oPopover = new Popover({
                        title: aMatched.length + " Store(s) in Selection",
                        contentWidth: "350px",
                        content: [oStoreList],
                        placement: "Auto"
                    });

                    oMdcGeomap.addDependent(oPopover);
                    oPopover.openBy(oMdcGeomap);
                });
            }
        });
    };

    /**
     * Ray-casting point-in-polygon check.
     * @param {number[]} point - [lng, lat]
     * @param {number[][]} ring - array of [lng, lat] forming the polygon ring
     * @returns {boolean}
     */
    StoresGeomapDelegate._pointInPolygon = function (point, ring) {
        var x = point[0], y = point[1];
        var inside = false;
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            var xi = ring[i][0], yi = ring[i][1];
            var xj = ring[j][0], yj = ring[j][1];
            var intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    };

    /**
     * Renders the map in choropleth mode - countries with stores are colored.
     * Color intensity is based on number of stores in each country.
     */
    StoresGeomapDelegate.renderChoropleth = function (oGeomap, aFilters) {
        var oExisting = oGeomap.getAggregation("_geomap");
        if (oExisting) {
            oExisting.destroy();
        }

        var aMapControls = [];
        aMapControls.push(new GeomapProvider({
            styleUrl: StoresGeomapDelegate._getProviderUrl()
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

        var oModel = oGeomap.getModel();
        oGeomapInstance.setModel(oModel);

        var sDelegatePayload = oGeomap.getDelegate().payload || {};
        var sCollectionName = sDelegatePayload.collectionName || "Stores";

        var aChoroplethFilters = [new Filter({ path: "IsActiveEntity", operator: FilterOperator.EQ, value1: true })];
        if (aFilters && aFilters.length > 0) {
            aChoroplethFilters = aChoroplethFilters.concat(aFilters);
        }

        var oListBinding = oModel.bindList(
            "/" + sCollectionName,
            null, null,
            aChoroplethFilters,
            { $$ownRequest: true }
        );

        oListBinding.requestContexts(0, Infinity).then(function (aContexts) {
            // Count stores per region
            var sGeoJsonPath = sap.ui.require.toUrl("sap/ui/stores/model/sales_regions.geojson.json");
            var oGeoJsonModel = new JSONModel();
            oGeoJsonModel.loadData(sGeoJsonPath, null, false);
            var oGeoJson = oGeoJsonModel.getData();

            if (!oGeoJson || !oGeoJson.features) {
                return;
            }

            // Build country → region_code lookup
            var mCountryToRegion = {};
            oGeoJson.features.forEach(function (oFeature) {
                var sCode = oFeature.properties.region_code;
                (oFeature.properties.countries_included || []).forEach(function (sCountry) {
                    mCountryToRegion[sCountry] = sCode;
                });
            });

            // Count stores per region
            var mRegionCount = {};
            aContexts.forEach(function (oContext) {
                var oObj = oContext.getObject();
                var sCountry = oObj.country;
                var sRegion = mCountryToRegion[sCountry];
                if (sRegion) {
                    mRegionCount[sRegion] = (mRegionCount[sRegion] || 0) + 1;
                }
            });

            var aItems = [];
            oGeoJson.features.forEach(function (oFeature) {
                var sRegionCode = oFeature.properties.region_code;
                var sRegionName = oFeature.properties.region_name;
                var iCount = mRegionCount[sRegionCode] || 0;

                if (iCount === 0) {
                    return; // Skip regions with no stores
                }

                // Color intensity based on store count
                var sFillColor;
                if (iCount >= 8) {
                    sFillColor = "#E65100"; // dark orange
                } else if (iCount >= 5) {
                    sFillColor = "#FF8C00"; // medium orange
                } else if (iCount >= 3) {
                    sFillColor = "#FFA940"; // light orange
                } else {
                    sFillColor = "#FFD591"; // pale orange
                }

                // Handle both Polygon and MultiPolygon geometries
                var aPolygons = [];
                if (oFeature.geometry.type === "MultiPolygon") {
                    oFeature.geometry.coordinates.forEach(function (aPolyCoords) {
                        aPolygons.push(aPolyCoords[0]); // outer ring of each polygon
                    });
                } else {
                    aPolygons.push(oFeature.geometry.coordinates[0]);
                }

                aPolygons.forEach(function (aCoords) {
                    var oPolygon = new GeomapPolygon({
                        fillColor: sFillColor,
                        layerClick: function (oEvt) {
                            var oTarget = oEvt.getSource();
                            var oPopover = new Popover({
                                title: sRegionName,
                                contentWidth: "200px",
                                content: [
                                    new List({
                                        items: [
                                            new StandardListItem({
                                                title: "Stores",
                                                description: iCount + " location(s)"
                                            })
                                        ]
                                    })
                                ]
                            });
                            oTarget.addDependent(oPopover);
                            oPopover.openBy(oTarget);
                        },
                        points: aCoords.map(function (aPoint) {
                            return new GeomapPoint({
                                lng: aPoint[0],
                                lat: aPoint[1]
                            });
                        })
                    });
                    aItems.push(oPolygon);
                });
            });

            aItems.forEach(function (oItem) {
                oGeomapInstance.addItem(oItem);
            });
        });

        oGeomap.setAggregation("_geomap", oGeomapInstance);

        // Add legend overlay to the MDC Geomap container
        setTimeout(function () {
            var oDomRef = oGeomap.getDomRef();
            if (!oDomRef) {
                return;
            }
            // Remove existing legend if any
            var oExistingLegend = oDomRef.querySelector(".choropleth-legend");
            if (oExistingLegend) {
                oExistingLegend.remove();
            }

            var oLegend = document.createElement("div");
            oLegend.className = "choropleth-legend";
            oLegend.innerHTML =
                '<div class="choropleth-legend-title">Stores per Region</div>' +
                '<div class="choropleth-legend-item"><span class="choropleth-legend-color" style="background:#E65100"></span> 8+</div>' +
                '<div class="choropleth-legend-item"><span class="choropleth-legend-color" style="background:#FF8C00"></span> 5 \u2013 7</div>' +
                '<div class="choropleth-legend-item"><span class="choropleth-legend-color" style="background:#FFA940"></span> 3 \u2013 4</div>' +
                '<div class="choropleth-legend-item"><span class="choropleth-legend-color" style="background:#FFD591"></span> 1 \u2013 2</div>';
            oDomRef.style.position = "relative";
            oDomRef.appendChild(oLegend);
        }, 500);
    };

    return StoresGeomapDelegate;
});
