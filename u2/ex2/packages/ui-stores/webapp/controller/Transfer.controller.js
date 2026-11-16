sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Popover",
    "sap/m/VBox",
    "sap/m/Text",
    "sap/m/Title",
    "sap/ui/geomap/GeomapLine",
    "sap/ui/geomap/GeomapPoint",
    "sap/ui/geomap/GeomapSpot"
], function (Controller, JSONModel,
    MessageToast, Popover, VBox, Text, Title,
    GeomapLine, GeomapPoint, GeomapSpot) {
    "use strict";

    return Controller.extend("sap.ui.stores.controller.Transfer", {
        onInit: function () {
            var oViewModel = new JSONModel({
                showMap: false,
                sourceStoreName: "",
                sourceStoreId: "",
                sourceStoreLat: null,
                sourceStoreLng: null,
                selectedCount: 0
            });
            this.getView().setModel(oViewModel, "transfer");

            this._aSelectedGoods = [];
            this._oDestinationStore = null;
            this._oRouteLine = null;

            this.getOwnerComponent().getRouter()
                .getRoute("transfer")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sStoreId = oEvent.getParameter("arguments").storeId;
            this._sSourceStoreId = sStoreId;

            // Reset state
            this._aSelectedGoods = [];
            this._oDestinationStore = null;
            var oTransferModel = this.getView().getModel("transfer");
            oTransferModel.setProperty("/showMap", false);
            oTransferModel.setProperty("/selectedCount", 0);
            oTransferModel.setProperty("/sourceStoreId", sStoreId);

            // Bind view to source store for inventory relative binding
            var sPath = "/Stores(ID=" + sStoreId + ",IsActiveEntity=true)";
            this.getView().unbindElement();
            this.getView().bindElement({
                path: sPath
            });

            // Load source store data for map display
            var that = this;
            var oModel = this.getView().getModel();
            var oContextBinding = oModel.bindContext(sPath);
            oContextBinding.requestObject().then(function (oData) {
                if (oData) {
                    var oTransferModel = that.getView().getModel("transfer");
                    oTransferModel.setProperty("/sourceStoreName", oData.name || "");
                    oTransferModel.setProperty("/sourceStoreLat", parseFloat(oData.latitude));
                    oTransferModel.setProperty("/sourceStoreLng", parseFloat(oData.longitude));
                }
            });

            // Bind destination stores table (exclude source)
            this._bindDestinationTable();

            // Rebind MDC inventory table (needs view element binding context)
            this._bindInventoryTable();

            // Clear map items
            this._clearMapItems();
        },

        _bindInventoryTable: function () {
            var oTable = this.byId("sourceInventoryTable");
            if (!oTable) { return; }
            oTable.initialized().then(function () {
                oTable.clearSelection();
                oTable.rebind();
            });
        },

        _bindDestinationTable: function () {
            var oTable = this.byId("destinationStoresTable");
            if (!oTable) { return; }
            oTable.initialized().then(function () {
                oTable.clearSelection();
                oTable.rebind();
            });
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("stores");
        },

        onInventorySelectionChange: function () {
            var oTable = this.byId("sourceInventoryTable");
            var aContexts = oTable.getSelectedContexts();
            this._aSelectedGoods = aContexts.map(function (oContext) {
                return oContext.getObject();
            });
            this.getView().getModel("transfer").setProperty("/selectedCount", this._aSelectedGoods.length);
            this._checkAndDrawRoute();
        },

        onDestinationSelectionChange: function () {
            var oTable = this.byId("destinationStoresTable");
            var aContexts = oTable.getSelectedContexts();
            if (aContexts.length > 0) {
                this._oDestinationStore = aContexts[0].getObject();
            } else {
                this._oDestinationStore = null;
            }
            this._checkAndDrawRoute();
        },

        _checkAndDrawRoute: function () {
            if (this._aSelectedGoods.length === 0 || !this._oDestinationStore) {
                this.getView().getModel("transfer").setProperty("/showMap", false);
                this._clearMapItems();
                return;
            }

            this.getView().getModel("transfer").setProperty("/showMap", true);

            var oTransferModel = this.getView().getModel("transfer");
            var oSource = {
                lat: oTransferModel.getProperty("/sourceStoreLat"),
                lng: oTransferModel.getProperty("/sourceStoreLng"),
                name: oTransferModel.getProperty("/sourceStoreName")
            };
            var oDest = {
                lat: parseFloat(this._oDestinationStore.latitude),
                lng: parseFloat(this._oDestinationStore.longitude),
                name: this._oDestinationStore.name
            };

            this._drawTransferRoute(oSource, oDest, this._aSelectedGoods);
        },

        _drawTransferRoute: function (oSource, oDest, aGoods) {
            var that = this;

            // Wait for geomap to be ready
            var oGeomap = this.byId("transferGeomap");
            if (!oGeomap) {
                return;
            }

            // Small delay to ensure map panel is rendered after visibility change
            setTimeout(function () {
                var oInnerGeomap = oGeomap.getAggregation("_geomap");
                if (!oInnerGeomap) {
                    return;
                }

                // Clear previous items
                that._clearMapItems();

                // Add source spot (red) with click popover
                var oSourceSpot = new GeomapSpot({
                    lat: oSource.lat,
                    lng: oSource.lng,
                    color: "#CC0000",
                    width: "2.5rem",
                    height: "2.5rem"
                });
                oSourceSpot.attachClick(function (oEvent) {
                    that._showSpotPopover(oEvent.getSource(), oSource.name, "Source Store", "Sending inventory (" + aGoods.length + ")");
                });
                oInnerGeomap.addItem(oSourceSpot);

                // Add destination spot (blue) with click popover
                var oDestSpot = new GeomapSpot({
                    lat: oDest.lat,
                    lng: oDest.lng,
                    color: "#1B66D2",
                    width: "2.5rem",
                    height: "2.5rem"
                });
                oDestSpot.attachClick(function (oEvent) {
                    that._showSpotPopover(oEvent.getSource(), oDest.name, "Destination Store", "Receiving inventory (" + aGoods.length + ")");
                });
                oInnerGeomap.addItem(oDestSpot);

                // Fetch OSRM route
                var sUrl = "https://router.project-osrm.org/route/v1/driving/"
                    + oSource.lng + "," + oSource.lat + ";" + oDest.lng + "," + oDest.lat
                    + "?overview=full&geometries=geojson";

                fetch(sUrl).then(function (oResponse) {
                    return oResponse.json();
                }).then(function (oData) {
                    var aPoints = [];

                    if (oData.code === "Ok" && oData.routes && oData.routes.length > 0) {
                        var aCoords = oData.routes[0].geometry.coordinates;
                        aCoords.forEach(function (aCoord) {
                            aPoints.push(new GeomapPoint({ lat: aCoord[1], lng: aCoord[0] }));
                        });
                    } else {
                        aPoints.push(new GeomapPoint({ lat: oSource.lat, lng: oSource.lng }));
                        aPoints.push(new GeomapPoint({ lat: oDest.lat, lng: oDest.lng }));
                    }

                    that._addRouteLine(oInnerGeomap, aPoints, oSource, oDest, aGoods);
                }).catch(function () {
                    var aPoints = [
                        new GeomapPoint({ lat: oSource.lat, lng: oSource.lng }),
                        new GeomapPoint({ lat: oDest.lat, lng: oDest.lng })
                    ];
                    that._addRouteLine(oInnerGeomap, aPoints, oSource, oDest, aGoods);
                });

                // Center and zoom
                var fCenterLat = (oSource.lat + oDest.lat) / 2;
                var fCenterLng = (oSource.lng + oDest.lng) / 2;
                oInnerGeomap.setCenterLat(fCenterLat);
                oInnerGeomap.setCenterLng(fCenterLng);

                var fDist = Math.sqrt(
                    Math.pow(oDest.lat - oSource.lat, 2) + Math.pow(oDest.lng - oSource.lng, 2)
                );
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
            }, 300);
        },

        _addRouteLine: function (oInnerGeomap, aPoints, oSource, oDest, aGoods) {
            var that = this;
            var oLine = new GeomapLine({
                width: 5,
                color: "#1B66D2",
                points: aPoints,
                layerClick: function () {
                    that._showTransferPopover(oSource, oDest, aGoods);
                }
            });

            oInnerGeomap.addItem(oLine);
            that._oRouteLine = oLine;

            MessageToast.show("Route: " + oSource.name + " \u2192 " + oDest.name);
        },

        _showTransferPopover: function (oSource, oDest, aGoods) {
            var oGeomap = this.byId("transferGeomap");
            var sGoodsList = aGoods.map(function (g) {
                return g.name + " (" + g.size + ", " + g.color + ")";
            }).join("\n");

            var oPopover = new Popover({
                title: "Stock Transfer",
                contentWidth: "320px",
                placement: "Auto",
                content: [
                    new VBox({
                        items: [
                            new Title({ text: oSource.name + " \u2192 " + oDest.name, level: "H6" }),
                            new Text({
                                text: "Transferring " + aGoods.length + " item(s):\n" + sGoodsList,
                                class: "sapUiSmallMarginTop"
                            })
                        ]
                    }).addStyleClass("sapUiSmallMargin")
                ]
            });

            oGeomap.addDependent(oPopover);
            oPopover.openBy(oGeomap);
        },

        _showSpotPopover: function (oSpot, sName, sRole, sDetail) {
            var oGeomap = this.byId("transferGeomap");
            var oPopover = new Popover({
                title: sName,
                contentWidth: "280px",
                placement: "Auto",
                content: [
                    new VBox({
                        items: [
                            new Title({ text: sRole, level: "H6" }),
                            new Text({ text: sDetail })
                        ]
                    }).addStyleClass("sapUiSmallMargin")
                ]
            });

            oGeomap.addDependent(oPopover);
            oPopover.openBy(oSpot);
        },

        _clearMapItems: function () {
            var oGeomap = this.byId("transferGeomap");
            if (!oGeomap) {
                return;
            }
            var oInnerGeomap = oGeomap.getAggregation("_geomap");
            if (oInnerGeomap) {
                oInnerGeomap.removeAllItems();
            }
            this._oRouteLine = null;
        }
    });
});
