sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("sap.ui.stores.controller.StoreDetail", {
        onInit: function () {
            var oViewModel = new JSONModel({
                editable: false,
                createMode: false
            });
            this.getView().setModel(oViewModel, "ui");

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("storeDetail").attachPatternMatched(this._onRouteMatched, this);
            oRouter.getRoute("storeCreate").attachPatternMatched(this._onCreateRouteMatched, this);
        },

        _setEditable: function (bEditable) {
            this.getView().getModel("ui").setProperty("/editable", bEditable);
            this.byId("objectPageLayout").setShowFooter(bEditable);
        },

        _enterDraftMode: function (oContext) {
            var sDraftPath = oContext.getPath().replace(
                "IsActiveEntity=true",
                "IsActiveEntity=false"
            );
            this.getView().bindElement({ path: sDraftPath });
            this._setEditable(true);
            this._rebindGeomap();
            var that = this;
            setTimeout(function () {
                that._enableLocationPicker();
            }, 200);
        },

        _onRouteMatched: function (oEvent) {
            var sStoreId = oEvent.getParameter("arguments").storeId;
            var sPath = "/Stores(ID=" + sStoreId + ",IsActiveEntity=true)";

            this._setEditable(false);
            this.getView().getModel("ui").setProperty("/createMode", false);

            this.getView().unbindElement();
            this.getView().bindElement({ path: sPath });
            this._disableLocationPicker();
            this._rebindGeomap();
            this._bindInventoryTable();
        },

        _onCreateRouteMatched: function () {
            // Clear any previous binding from detail view
            this.getView().unbindElement();
            this.getView().setBindingContext(null);

            var oModel = this.getView().getModel();
            var oListBinding = oModel.bindList("/Stores", null, null, null, {
                $$updateGroupId: "$auto"
            });

            var oContext = oListBinding.create({}, true);
            this.getView().setBindingContext(oContext);

            this._setEditable(true);
            this.getView().getModel("ui").setProperty("/createMode", true);

            // Delay picker enablement to allow the geomap delegate to initialize
            var that = this;
            setTimeout(function () {
                that._enableLocationPicker();
            }, 1500);
        },

        onEdit: function () {
            var oContext = this.getView().getBindingContext();
            var that = this;

            var oOperation = oContext.getModel().bindContext(
                oContext.getPath() + "/StoresService.draftEdit(...)",
                oContext
            );

            oOperation.invoke().then(function () {
                that._enterDraftMode(oContext);
            }).catch(function () {
                // Draft already exists (409) — delete it and retry
                var sDraftPath = oContext.getPath().replace(
                    "IsActiveEntity=true",
                    "IsActiveEntity=false"
                );
                var oDraftContext = oContext.getModel().bindContext(sDraftPath).getBoundContext();
                if (oDraftContext) {
                    oDraftContext.delete().then(function () {
                        // Retry draftEdit after deleting orphaned draft
                        var oRetryOp = oContext.getModel().bindContext(
                            oContext.getPath() + "/StoresService.draftEdit(...)",
                            oContext
                        );
                        oRetryOp.invoke().then(function () {
                            that._enterDraftMode(oContext);
                        }).catch(function () {
                            // Fallback: just navigate to draft path
                            that._enterDraftMode(oContext);
                        });
                    }).catch(function () {
                        // Fallback: just navigate to draft path
                        that._enterDraftMode(oContext);
                    });
                } else {
                    that._enterDraftMode(oContext);
                }
            });
        },

        onSave: function () {
            var oContext = this.getView().getBindingContext();
            var that = this;

            // Client-side validation
            var oData = oContext.getObject();
            if (!oData.name || !oData.city || !oData.country) {
                MessageBox.error("Please fill in all required fields (Name, City, Country).");
                return;
            }

            var oOperation = oContext.getModel().bindContext(
                oContext.getPath() + "/StoresService.draftActivate(...)",
                oContext
            );

            oOperation.invoke().then(function () {
                MessageToast.show("Store saved successfully.");
                that._setEditable(false);
                that.getView().getModel("ui").setProperty("/createMode", false);
                that._disableLocationPicker();

                // Rebind to active entity
                var sActivePath = oContext.getPath().replace(
                    "IsActiveEntity=false",
                    "IsActiveEntity=true"
                );
                that.getView().bindElement({ path: sActivePath });
                that._rebindGeomap();
            }).catch(function (oError) {
                MessageBox.error("Error saving: " + oError.message);
            });
        },

        onCancel: function () {
            var oContext = this.getView().getBindingContext();
            var bCreateMode = this.getView().getModel("ui").getProperty("/createMode");
            var that = this;

            MessageBox.confirm("Discard all changes?", {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        oContext.delete().then(function () {
                            that._disableLocationPicker();
                            if (bCreateMode) {
                                that.getOwnerComponent().getRouter().navTo("stores");
                            } else {
                                var sActivePath = oContext.getPath().replace(
                                    "IsActiveEntity=false",
                                    "IsActiveEntity=true"
                                );
                                that.getView().bindElement({ path: sActivePath });
                                that._setEditable(false);
                                that._rebindGeomap();
                            }
                        });
                    }
                }
            });
        },

        onDelete: function () {
            var oContext = this.getView().getBindingContext();
            var that = this;

            MessageBox.confirm("Delete this store permanently?", {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        oContext.delete().then(function () {
                            MessageToast.show("Store deleted.");
                            that.getOwnerComponent().getRouter().navTo("stores");
                        });
                    }
                }
            });
        },

        onCoordinateChange: function () {
            clearTimeout(this._iGeomapTimer);
            this._iGeomapTimer = setTimeout(this._rebindGeomap.bind(this), 500);
        },

        _enableLocationPicker: function () {
            var oGeomap = this.byId("detailGeomap");
            if (!oGeomap) {
                return;
            }
            var that = this;
            var sDelegate = oGeomap.getDelegate().name;
            sap.ui.require([sDelegate], function (GeomapDelegate) {
                GeomapDelegate.enableLocationPicker(oGeomap, function (oCoords) {
                    var oContext = that.getView().getBindingContext();
                    if (oContext) {
                        oContext.setProperty("latitude", oCoords.lat.toFixed(7));
                        oContext.setProperty("longitude", oCoords.lng.toFixed(7));
                        GeomapDelegate.updateLocationSpot(oGeomap, oCoords.lat, oCoords.lng);
                    }
                });
            });
        },

        _disableLocationPicker: function () {
            var oGeomap = this.byId("detailGeomap");
            if (!oGeomap) {
                return;
            }
            var sDelegate = oGeomap.getDelegate().name;
            sap.ui.require([sDelegate], function (GeomapDelegate) {
                GeomapDelegate.disableLocationPicker(oGeomap);
            });
        },

        _rebindGeomap: function () {
            var oGeomap = this.byId("detailGeomap");
            if (oGeomap) {
                var sDelegate = oGeomap.getDelegate().name;
                sap.ui.require([sDelegate], function (GeomapDelegate) {
                    GeomapDelegate.rebind(oGeomap);
                });
            }
        },

        _bindInventoryTable: function () {
            var oTable = this.byId("inventoryTable");
            if (!oTable) {
                return;
            }
            oTable.initialized().then(function () {
                oTable.rebind();
            });
        }
    });
});
