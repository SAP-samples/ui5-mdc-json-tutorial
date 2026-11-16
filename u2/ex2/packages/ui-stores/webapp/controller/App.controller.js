sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/ActionSheet",
    "sap/m/Button",
    "sap/m/Popover",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/ui/core/Theming"
], function (Controller, JSONModel, ActionSheet, Button, Popover, List, StandardListItem, Theming) {
    "use strict";

    var THEMES = [
        { key: "sap_horizon", label: "Light" },
        { key: "sap_horizon_dark", label: "Dark" },
        { key: "sap_horizon_hcb", label: "High Contrast Black" },
        { key: "sap_horizon_hcw", label: "High Contrast White" }
    ];

    return Controller.extend("sap.ui.stores.controller.App", {
        onInit: function () {
            var sSavedTheme = localStorage.getItem("sap-ui-stores-theme") || "sap_horizon";
            Theming.setTheme(sSavedTheme);

            var sSapLogoSrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MTIuMzggMjA0IiB3aWR0aD0iNDEyLjM4IiBoZWlnaHQ9IjIwNCI+CjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDp1cmwoI2xpbmVhci1ncmFkaWVudCk7fS5jbHMtMSwuY2xzLTJ7ZmlsbC1ydWxlOmV2ZW5vZGQ7fS5jbHMtMntmaWxsOiNmZmY7fTwvc3R5bGU+CjxsaW5lYXJHcmFkaWVudCBpZD0ibGluZWFyLWdyYWRpZW50IiB4MT0iMjA2LjE5IiB5MT0iMCIgeDI9IjIwNi4xOSIgeTI9IjIwNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMwMGIxZWIiPjwvc3RvcD4KPHN0b3Agb2Zmc2V0PSIuMjEyIiBzdG9wLWNvbG9yPSIjMDA5YWQ5Ij48L3N0b3A+CjxzdG9wIG9mZnNldD0iLjUxOSIgc3RvcC1jb2xvcj0iIzAwN2ZjNCI+PC9zdG9wPgo8c3RvcCBvZmZzZXQ9Ii43OTIiIHN0b3AtY29sb3I9IiMwMDZlYjgiPjwvc3RvcD4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMDA2OWI0Ij48L3N0b3A+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+Cjxwb2x5bGluZSBjbGFzcz0iY2xzLTEiIHBvaW50cz0iMCAyMDQgMjA4LjQxMyAyMDQgNDEyLjM4IDAgMCAwIDAgMjA0Ii8+CjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTI0NC43MjcsMzguMzU5bC00MC41OTMtLjAyNXY5Ni41MThsLTM1LjQ2LTk2LjUxOGgtMzUuMTZsLTMwLjI3Nyw4MC43MTZjLTMuMjI0LTIwLjM1Mi0yNC4yNzctMjcuMzgtNDAuODQtMzIuNjQ5LTEwLjkzNy0zLjUxMi0yMi41NDEtOC42NzgtMjIuNDM0LTE0LjM4Ny4wOTEtNC42ODcsNi4yMjUtOS4wNCwxOC4zNzctOC4zODUsOC4xNy40MzMsMTUuMzczLDEuMDkyLDI5LjcxLDguMDA2bDE0LjEwMi0yNC41NTdjLTEzLjA4OC02LjY1OC0zMS4xNjktMTAuODY3LTQ1Ljk4NS0xMC44ODNoLS4wODZjLTE3LjI3NywwLTMxLjY3Nyw1LjU5OC00MC42MDIsMTQuODI0LTYuMjIxLDYuNDQzLTkuNTcyLDE0LjYyNi05LjcxMiwyMy42NzktLjIyNywxMi40NTQsNC4zNDEsMjEuMjkyLDEzLjkzOCwyOC4zMzgsOC4xMDQsNS45NDQsMTguNDY4LDkuNzk0LDI3LjYwMywxMi42MjYsMTEuMjcsMy40OTIsMjAuNDY3LDYuNTI2LDIwLjM2LDEzLjAwMi0uMDgzLDIuMzU1LS45NzcsNC41NTItMi42NzEsNi4zMzctMi44MDcsMi44OTctNy4xMjQsMy45ODYtMTMuMDg0LDQuMDk4LTExLjQ5Ny4yNDMtMjAuMDI2LTEuNTU5LTMzLjYxLTkuNTg1bC0xMi41MzYsMjQuOTAzYzEzLjU0Niw3LjcwNSwyOS41ODYsMTIuMjIzLDQ1Ljk1MiwxMi4yMjNsMi4xMDYtLjAyNGMxNC4yNDctLjI1NiwyNS43NDUtNC4zMTYsMzQuOTI5LTExLjcxMi41MjctLjQxNiwxLjAwMS0uODQ1LDEuNDg4LTEuMjc3bC00LjA3MywxMC44NzRoMzYuODc1bDYuMTg5LTE4LjgyMmM2LjQ3NywyLjIxNCwxMy44NDcsMy40MzcsMjEuNjc2LDMuNDM3LDcuNjE4LDAsMTQuNzk1LTEuMTcsMjEuMTU2LTMuMjUybDUuOTY1LDE4LjYzN2g2MC4xMzd2LTM4Ljk2OWgxMy4xMTNjMzEuNzA2LDAsNTAuNDU2LTE2LjE0Nyw1MC40NTYtNDMuMjAyLDAtMzAuMTM5LTE4LjIxOS00My45NjktNTcuMDExLTQzLjk2OVptLTkzLjgxNiw4Mi41ODdjLTQuNzM3LDAtOS4xNzctLjgyOC0xMy4wMDYtMi4yNzVsMTIuODY2LTQwLjU5M2guMjQ0bDEyLjY0Myw0MC43MDhjLTMuODAxLDEuMzQ5LTguMTM4LDIuMTYtMTIuNzQ2LDIuMTZabTk2LjE5OS0yMy4zMjRoLTguOTQxdi0zMi43MTFoOC45NDFjMTEuOTI3LDAsMjEuNDM3LDMuOTYxLDIxLjQzNywxNi4xMzksMCwxMi42MDItOS41MSwxNi41NzItMjEuNDM3LDE2LjU3MiIvPgo8L3N2Zz4=";

            var oModel = new JSONModel({
                showNavButton: false,
                currentTheme: sSavedTheme,
                sapLogoSrc: sSapLogoSrc
            });
            this.getView().setModel(oModel, "appView");

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.attachRouteMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sRouteName = oEvent.getParameter("name");
            var oModel = this.getView().getModel("appView");
            oModel.setProperty("/showNavButton", sRouteName !== "stores");
        },

        onNavBack: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("stores");
        },

        onUserPress: function (oEvent) {
            var oSource = oEvent.getSource();
            var that = this;

            if (!this._oActionSheet) {
                this._oActionSheet = new ActionSheet({
                    title: "Settings",
                    buttons: [
                        new Button({
                            text: "Appearance",
                            icon: "sap-icon://palette",
                            press: function () {
                                that._openThemePopover(oSource);
                            }
                        }),
                        new Button({
                            text: "Sign Out",
                            icon: "sap-icon://log"
                        })
                    ]
                });
                this.getView().addDependent(this._oActionSheet);
            }
            this._oActionSheet.openBy(oSource);
        },

        _openThemePopover: function (oSource) {
            var that = this;

            if (!this._oThemePopover) {
                var oThemeModel = new JSONModel(THEMES);

                var oList = new List({
                    mode: "SingleSelectMaster",
                    items: {
                        path: "themes>/",
                        template: new StandardListItem({
                            title: "{themes>label}",
                            type: "Active"
                        })
                    },
                    selectionChange: function (oEvt) {
                        var oItem = oEvt.getParameter("listItem");
                        var sKey = oItem.getBindingContext("themes").getObject().key;
                        that._applyTheme(sKey);
                        that._oThemePopover.close();
                    }
                });
                oList.setModel(oThemeModel, "themes");

                this._oThemePopover = new Popover({
                    title: "Select Theme",
                    placement: "Auto",
                    contentWidth: "250px",
                    content: [oList]
                });
                this._oThemeList = oList;
                this.getView().addDependent(this._oThemePopover);
            }

            // Highlight current theme
            var sCurrentTheme = this.getView().getModel("appView").getProperty("/currentTheme");
            var aItems = this._oThemeList.getItems();
            aItems.forEach(function (oItem) {
                var sKey = oItem.getBindingContext("themes").getObject().key;
                oItem.setSelected(sKey === sCurrentTheme);
            });

            this._oThemePopover.openBy(oSource);
        },

        _applyTheme: function (sThemeKey) {
            Theming.setTheme(sThemeKey);
            localStorage.setItem("sap-ui-stores-theme", sThemeKey);
            this.getView().getModel("appView").setProperty("/currentTheme", sThemeKey);
        }
    });
});
