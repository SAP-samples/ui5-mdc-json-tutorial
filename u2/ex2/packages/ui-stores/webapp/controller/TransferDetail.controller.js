sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/Popover",
    "sap/m/VBox",
    "sap/m/Text",
    "sap/m/Title",
    "sap/ui/geomap/GeomapLine",
    "sap/ui/geomap/GeomapPoint",
    "sap/ui/geomap/GeomapSpot",
    "sap/ui/stores/delegate/TransferGeomapDelegate"
], function (Controller, MessageToast, Popover, VBox, Text, Title,
    GeomapLine, GeomapPoint, GeomapSpot, TransferGeomapDelegate) {
    "use strict";

    return Controller.extend("sap.ui.stores.controller.TransferDetail", {
        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("transferDetail")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sTransferId = oEvent.getParameter("arguments").transferId;
            var sPath = "/Transfers(ID=" + sTransferId + ")";

            this._clearMapItems();

            this.getView().unbindElement();
            this.getView().bindElement({
                path: sPath,
                parameters: {
                    $expand: "sourceStore,destStore"
                }
            });

            // Load transfer data for map
            var that = this;
            var oModel = this.getView().getModel();
            var oContextBinding = oModel.bindContext(sPath, null, {
                $expand: "sourceStore,destStore"
            });
            oContextBinding.requestObject().then(function (oData) {
                if (oData && oData.sourceStore && oData.destStore) {
                    var oSource = {
                        lat: parseFloat(oData.sourceStore.latitude),
                        lng: parseFloat(oData.sourceStore.longitude),
                        name: oData.sourceStore.name
                    };
                    var oDest = {
                        lat: parseFloat(oData.destStore.latitude),
                        lng: parseFloat(oData.destStore.longitude),
                        name: oData.destStore.name
                    };
                    that._drawRoute(oSource, oDest);
                }
            });
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("stores");
        },

        _drawRoute: function (oSource, oDest) {
            var that = this;
            var oGeomap = this.byId("transferDetailGeomap");
            if (!oGeomap) {
                return;
            }

            setTimeout(function () {
                var oInnerGeomap = oGeomap.getAggregation("_geomap");
                if (!oInnerGeomap) {
                    return;
                }

                that._clearMapItems();

                // Source spot (red)
                var oSourceSpot = new GeomapSpot({
                    lat: oSource.lat,
                    lng: oSource.lng,
                    color: "#CC0000",
                    width: "2.5rem",
                    height: "2.5rem"
                });
                oSourceSpot.attachClick(function (oEvent) {
                    that._showSpotPopover(oEvent.getSource(), oSource.name, "Source Store");
                });
                oInnerGeomap.addItem(oSourceSpot);

                // Destination spot (blue)
                var oDestSpot = new GeomapSpot({
                    lat: oDest.lat,
                    lng: oDest.lng,
                    color: "#1B66D2",
                    width: "2.5rem",
                    height: "2.5rem"
                });
                oDestSpot.attachClick(function (oEvent) {
                    that._showSpotPopover(oEvent.getSource(), oDest.name, "Destination Store");
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
                    that._addRouteLine(oInnerGeomap, aPoints, oSource, oDest);
                }).catch(function () {
                    var aPoints = [
                        new GeomapPoint({ lat: oSource.lat, lng: oSource.lng }),
                        new GeomapPoint({ lat: oDest.lat, lng: oDest.lng })
                    ];
                    that._addRouteLine(oInnerGeomap, aPoints, oSource, oDest);
                });

                // Fit map to show both spots
                var oMdcGeomap = that.byId("transferDetailGeomap");
                TransferGeomapDelegate.fitBounds(oMdcGeomap, oSource, oDest);
            }, 300);
        },

        _addRouteLine: function (oInnerGeomap, aPoints, oSource, oDest) {
            var oLine = new GeomapLine({
                width: 5,
                color: "#1B66D2",
                points: aPoints
            });
            oInnerGeomap.addItem(oLine);

            MessageToast.show("Route: " + oSource.name + " \u2192 " + oDest.name);
        },

        _showSpotPopover: function (oSpot, sName, sRole) {
            var oGeomap = this.byId("transferDetailGeomap");
            var oPopover = new Popover({
                title: sName,
                contentWidth: "250px",
                placement: "Auto",
                content: [
                    new VBox({
                        items: [
                            new Title({ text: sRole, level: "H6" })
                        ]
                    }).addStyleClass("sapUiSmallMargin")
                ]
            });
            oGeomap.addDependent(oPopover);
            oPopover.openBy(oSpot);
        },

        _clearMapItems: function () {
            var oGeomap = this.byId("transferDetailGeomap");
            if (!oGeomap) {
                return;
            }
            var oInnerGeomap = oGeomap.getAggregation("_geomap");
            if (oInnerGeomap) {
                oInnerGeomap.removeAllItems();
            }
        }
    });
});
