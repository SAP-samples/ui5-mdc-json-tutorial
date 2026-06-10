sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/mdc/condition/ConditionModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/geomap/GeomapLine",
    "sap/ui/geomap/GeomapPoint"
], function (Controller, ConditionModel, Filter, FilterOperator,
    Dialog, Button, List, StandardListItem, MessageToast,
    JSONModel, GeomapLine, GeomapPoint) {
    "use strict";

    return Controller.extend("sap.ui.stores.controller.Stores", {
        onInit: function () {
            this.getView().setModel(new ConditionModel(), "$filters");
            this._aSelectedStores = [];
            this._aRouteLines = [];
            this._sMapMode = "spots"; // "spots" or "choropleth"

            var oAppModel = new JSONModel({ hasRoutes: false });
            this.getView().setModel(oAppModel, "appView");

            sap.ui.getCore().getEventBus().subscribe("StoresMap", "ShowTransferRoutes", this._onShowTransferRoutes, this);
        },

        onExit: function () {
            sap.ui.getCore().getEventBus().unsubscribe("StoresMap", "ShowTransferRoutes", this._onShowTransferRoutes, this);
        },

        onSwitchToSpots: function () {
            this._switchMapMode("spots");
        },

        onSwitchToChoropleth: function () {
            this._switchMapMode("choropleth");
        },

        onZoomIn: function () {
            var oGeomap = this.byId("storesGeomap");
            var oInnerGeomap = oGeomap.getAggregation("_geomap");
            if (oInnerGeomap) {
                var iZoom = oInnerGeomap.getZoom();
                oInnerGeomap.setZoom(Math.min(iZoom + 1, 20));
            }
        },

        onZoomOut: function () {
            var oGeomap = this.byId("storesGeomap");
            var oInnerGeomap = oGeomap.getAggregation("_geomap");
            if (oInnerGeomap) {
                var iZoom = oInnerGeomap.getZoom();
                oInnerGeomap.setZoom(Math.max(iZoom - 1, 1));
            }
        },

        _switchMapMode: function (sMode) {
            if (sMode === this._sMapMode) {
                return;
            }
            this._sMapMode = sMode;

            var oGeomap = this.byId("storesGeomap");
            var oDelegate = oGeomap.getDelegate();
            var sModuleName = oDelegate.name;
            var that = this;

            sap.ui.require([sModuleName], function (GeomapDelegate) {
                if (sMode === "choropleth") {
                    GeomapDelegate.renderChoropleth(oGeomap);
                } else {
                    GeomapDelegate.rebind(oGeomap, that._getCurrentFilters());
                }
            });
        },

        _getCurrentFilters: function () {
            var oFilterBar = this.byId("filterBar");
            var aFilterItems = oFilterBar.getFilterItems();
            var aFilters = [];

            aFilterItems.forEach(function (oFilterField) {
                var aConditions = oFilterField.getConditions();
                if (aConditions && aConditions.length > 0) {
                    // Derive field path from conditions binding
                    var oBindingInfo = oFilterField.getBindingInfo("conditions");
                    var sPath = "";
                    if (oBindingInfo && oBindingInfo.parts && oBindingInfo.parts[0]) {
                        sPath = oBindingInfo.parts[0].path.split("/").pop();
                    }
                    if (!sPath) {
                        return;
                    }

                    aConditions.forEach(function (oCondition) {
                        if (oCondition.values && oCondition.values.length > 0) {
                            aFilters.push(new Filter({
                                path: sPath,
                                operator: FilterOperator.Contains,
                                value1: oCondition.values[0]
                            }));
                        }
                    });
                }
            });
            return aFilters;
        },

        onSearch: function () {
            var aFilters = this._getCurrentFilters();
            var oGeomap = this.getView().byId("storesGeomap");
            var oDelegate = oGeomap.getDelegate();
            var sModuleName = oDelegate.name;
            var that = this;

            sap.ui.require([sModuleName], function (GeomapDelegate) {
                if (that._sMapMode === "choropleth") {
                    GeomapDelegate.renderChoropleth(oGeomap, aFilters);
                } else {
                    GeomapDelegate.rebind(oGeomap, aFilters);
                }
            });
        },

        onShowRoute: function () {
            var that = this;
            this._aSelectedStores = [];

            var oModel = this.getView().getModel();
            var oListBinding = oModel.bindList("/Stores", null, null, [
                new Filter({ path: "IsActiveEntity", operator: FilterOperator.EQ, value1: true })
            ], { $$ownRequest: true });

            oListBinding.requestContexts(0, Infinity).then(function (aContexts) {
                var aStores = aContexts.map(function (oCtx) {
                    return oCtx.getObject();
                });

                var oStoreModel = new JSONModel(aStores);

                var oList = new List({
                    mode: "MultiSelect",
                    items: {
                        path: "storeList>/",
                        template: new StandardListItem({
                            title: "{storeList>name}",
                            description: "{storeList>city}, {storeList>country}"
                        })
                    }
                });
                oList.setModel(oStoreModel, "storeList");

                if (that._oRouteDialog) {
                    that._oRouteDialog.destroy();
                }

                that._oRouteDialog = new Dialog({
                    title: "Select Two Stores for Route",
                    contentWidth: "500px",
                    contentHeight: "400px",
                    content: [oList],
                    beginButton: new Button({
                        text: "Draw Route",
                        type: "Emphasized",
                        press: function () {
                            var aSelectedItems = oList.getSelectedItems();
                            if (aSelectedItems.length !== 2) {
                                MessageToast.show("Please select exactly 2 stores.");
                                return;
                            }

                            var oStore1 = aSelectedItems[0].getBindingContext("storeList").getObject();
                            var oStore2 = aSelectedItems[1].getBindingContext("storeList").getObject();
                            that._drawRoute(oStore1, oStore2);
                            that._oRouteDialog.close();
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            that._oRouteDialog.close();
                        }
                    })
                });

                that.getView().addDependent(that._oRouteDialog);
                that._oRouteDialog.open();
            });
        },

        _drawRoute: function (oStore1, oStore2) {
            var oGeomap = this.byId("storesGeomap");
            var oInnerGeomap = oGeomap.getAggregation("_geomap");
            if (!oInnerGeomap) {
                return;
            }

            var fLat1 = parseFloat(oStore1.latitude);
            var fLng1 = parseFloat(oStore1.longitude);
            var fLat2 = parseFloat(oStore2.latitude);
            var fLng2 = parseFloat(oStore2.longitude);
            var that = this;

            // Fetch actual road route from OSRM
            var sUrl = "https://router.project-osrm.org/route/v1/driving/"
                + fLng1 + "," + fLat1 + ";" + fLng2 + "," + fLat2
                + "?overview=full&geometries=geojson";

            fetch(sUrl).then(function (oResponse) {
                return oResponse.json();
            }).then(function (oData) {
                var aPoints = [];

                if (oData.code === "Ok" && oData.routes && oData.routes.length > 0) {
                    // Use real road geometry from OSRM
                    var aCoords = oData.routes[0].geometry.coordinates;
                    aCoords.forEach(function (aCoord) {
                        aPoints.push(new GeomapPoint({ lat: aCoord[1], lng: aCoord[0] }));
                    });
                } else {
                    // Fallback to straight line
                    aPoints.push(new GeomapPoint({ lat: fLat1, lng: fLng1 }));
                    aPoints.push(new GeomapPoint({ lat: fLat2, lng: fLng2 }));
                }

                var oLine = new GeomapLine({
                    width: 4,
                    points: aPoints
                });

                oInnerGeomap.addItem(oLine);
                that._aRouteLines.push(oLine);
                that.getView().getModel("appView").setProperty("/hasRoutes", true);

                var fCenterLat = (fLat1 + fLat2) / 2;
                var fCenterLng = (fLng1 + fLng2) / 2;
                oInnerGeomap.setCenterLat(fCenterLat);
                oInnerGeomap.setCenterLng(fCenterLng);

                var fDist = Math.sqrt(Math.pow(fLat2 - fLat1, 2) + Math.pow(fLng2 - fLng1, 2));
                var iZoom;
                if (fDist < 1) {
                    iZoom = 10;
                } else if (fDist < 5) {
                    iZoom = 7;
                } else if (fDist < 20) {
                    iZoom = 5;
                } else {
                    iZoom = 3;
                }
                oInnerGeomap.setZoom(iZoom);

                MessageToast.show("Route: " + oStore1.name + " \u2192 " + oStore2.name);
            }).catch(function () {
                // Network error — draw straight line as fallback
                var oLine = new GeomapLine({
                    width: 4,
                    points: [
                        new GeomapPoint({ lat: fLat1, lng: fLng1 }),
                        new GeomapPoint({ lat: fLat2, lng: fLng2 })
                    ]
                });
                oInnerGeomap.addItem(oLine);
                that._aRouteLines.push(oLine);
                that.getView().getModel("appView").setProperty("/hasRoutes", true);
                MessageToast.show("Route: " + oStore1.name + " \u2192 " + oStore2.name + " (straight line)");
            });
        },

        onClearRoutes: function () {
            this._clearRoutes();
            MessageToast.show("Routes cleared.");
        },

        _clearRoutes: function () {
            var oGeomap = this.byId("storesGeomap");
            var oInnerGeomap = oGeomap.getAggregation("_geomap");
            if (!oInnerGeomap) {
                return;
            }

            this._aRouteLines.forEach(function (oLine) {
                oInnerGeomap.removeItem(oLine);
                oLine.destroy();
            });
            this._aRouteLines = [];
            this.getView().getModel("appView").setProperty("/hasRoutes", false);
        },

        onCreate: function () {
            this.getOwnerComponent().getRouter().navTo("storeCreate");
        },

        onTableRowPress: function (oEvent) {
            var oContext = oEvent.getParameter("bindingContext");
            if (!oContext) {
                return;
            }
            var fLat = parseFloat(oContext.getProperty("latitude"));
            var fLng = parseFloat(oContext.getProperty("longitude"));

            if (isNaN(fLat) || isNaN(fLng)) {
                return;
            }

            var oGeomap = this.byId("storesGeomap");
            var oInnerGeomap = oGeomap.getAggregation("_geomap");
            if (oInnerGeomap && oInnerGeomap.flyTo) {
                oInnerGeomap.flyTo(fLng, fLat, 12);
            }
        },

        onTableSelectionChange: function (oEvent) {
            var oContext = oEvent.getParameter("bindingContext");
            if (!oContext) {
                var oTable = oEvent.getSource();
                var aContexts = oTable.getSelectedContexts();
                if (aContexts && aContexts.length > 0) {
                    oContext = aContexts[0];
                }
            }
            if (!oContext) {
                return;
            }

            var fLat = parseFloat(oContext.getProperty("latitude"));
            var fLng = parseFloat(oContext.getProperty("longitude"));

            if (isNaN(fLat) || isNaN(fLng)) {
                return;
            }

            var oGeomap = this.byId("storesGeomap");
            var oGeomapDom = oGeomap.getDomRef();
            if (oGeomapDom) {
                oGeomapDom.scrollIntoView({ behavior: "smooth", block: "center" });
            }

            var oInnerGeomap = oGeomap.getAggregation("_geomap");
            if (oInnerGeomap && oInnerGeomap.flyTo) {
                oInnerGeomap.flyTo(fLng, fLat, 12);
            }
        },

        _onShowTransferRoutes: function (sChannel, sEvent, oData) {
            var that = this;
            var oModel = this.getView().getModel();
            var sStoreId = oData.storeId;

            // Clear existing routes first
            this._clearRoutes();

            // Fetch all active transfers involving this store (both directions)
            var aFilters = [
                new Filter({
                    filters: [
                        new Filter("sourceStore_ID", FilterOperator.EQ, sStoreId),
                        new Filter("destStore_ID", FilterOperator.EQ, sStoreId)
                    ],
                    and: false
                }),
                new Filter("status", FilterOperator.NE, "Completed")
            ];

            var oListBinding = oModel.bindList("/Transfers", null, null, aFilters, {
                $expand: "sourceStore,destStore",
                $$ownRequest: true
            });

            oListBinding.requestContexts(0, 50).then(function (aContexts) {
                if (aContexts.length === 0) {
                    MessageToast.show("No active transfers found.");
                    return;
                }

                var iOutgoing = 0;
                var iIncoming = 0;
                aContexts.forEach(function (oCtx) {
                    var oTransfer = oCtx.getObject();
                    var bOutgoing = (oTransfer.sourceStore_ID === sStoreId);
                    var sColor = bOutgoing ? "#0050FF" : "#FF6600";
                    if (bOutgoing) { iOutgoing++; } else { iIncoming++; }
                    that._drawTransferRouteLine(oTransfer, sColor);
                });

                that.getView().getModel("appView").setProperty("/hasRoutes", true);
                MessageToast.show("Showing " + aContexts.length + " transfer route(s) ("
                    + iOutgoing + " outgoing, " + iIncoming + " incoming)");
            });
        },

        _drawTransferRouteLine: function (oTransfer, sColor) {
            var that = this;
            var oGeomap = this.byId("storesGeomap");
            var oInnerGeomap = oGeomap.getAggregation("_geomap");
            if (!oInnerGeomap) {
                return;
            }

            var oSrc = oTransfer.sourceStore;
            var oDst = oTransfer.destStore;
            var fLat1 = parseFloat(oSrc.latitude);
            var fLng1 = parseFloat(oSrc.longitude);
            var fLat2 = parseFloat(oDst.latitude);
            var fLng2 = parseFloat(oDst.longitude);

            var sUrl = "https://router.project-osrm.org/route/v1/driving/"
                + fLng1 + "," + fLat1 + ";" + fLng2 + "," + fLat2
                + "?overview=full&geometries=geojson";

            fetch(sUrl).then(function (oResponse) {
                return oResponse.json();
            }).then(function (oData) {
                var aPoints = [];
                if (oData.code === "Ok" && oData.routes && oData.routes.length > 0) {
                    oData.routes[0].geometry.coordinates.forEach(function (aCoord) {
                        aPoints.push(new GeomapPoint({ lat: aCoord[1], lng: aCoord[0] }));
                    });
                } else {
                    aPoints = [
                        new GeomapPoint({ lat: fLat1, lng: fLng1 }),
                        new GeomapPoint({ lat: fLat2, lng: fLng2 })
                    ];
                }

                var oLine = new GeomapLine({ width: 4, color: sColor, points: aPoints });
                oLine.attachLayerClick(function () {
                    that.getOwnerComponent().getRouter().navTo("transferDetail", {
                        transferId: oTransfer.ID
                    });
                });
                oInnerGeomap.addItem(oLine);
                that._aRouteLines.push(oLine);
            }).catch(function () {
                var aPoints = [
                    new GeomapPoint({ lat: fLat1, lng: fLng1 }),
                    new GeomapPoint({ lat: fLat2, lng: fLng2 })
                ];
                var oLine = new GeomapLine({ width: 4, color: sColor, points: aPoints });
                oLine.attachLayerClick(function () {
                    that.getOwnerComponent().getRouter().navTo("transferDetail", {
                        transferId: oTransfer.ID
                    });
                });
                oInnerGeomap.addItem(oLine);
                that._aRouteLines.push(oLine);
            });
        }
    });
});
