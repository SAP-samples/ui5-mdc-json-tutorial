sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/base/Log"
], function (JSONModel, Log) {
    "use strict";

    var DemoMockServer = {};
    var _aStores = [];
    var _aInventory = [];
    var _aTransfers = [];
    var _aTransferItems = [];
    var _sMetadataXml = "";
    var _sServiceUrl = "/odata/v4/stores/";

    DemoMockServer.init = function () {
        var sBasePath = sap.ui.require.toUrl("sap/ui/stores/localService");

        // Load metadata.xml (synchronous — local file, needed before OData model init)
        var oMetaReq = new XMLHttpRequest();
        oMetaReq.open("GET", sBasePath + "/metadata.xml", false);
        oMetaReq.send();
        _sMetadataXml = oMetaReq.responseText;

        // Load Stores.json (synchronous)
        var oDataReq = new XMLHttpRequest();
        oDataReq.open("GET", sBasePath + "/mockdata/Stores.json", false);
        oDataReq.send();
        var oData = JSON.parse(oDataReq.responseText);
        _aStores = oData.value || [];

        // Load Inventory.json (synchronous)
        var oInvReq = new XMLHttpRequest();
        oInvReq.open("GET", sBasePath + "/mockdata/Inventory.json", false);
        oInvReq.send();
        var oInvData = JSON.parse(oInvReq.responseText);
        _aInventory = oInvData.value || [];

        // Load Transfers.json (synchronous)
        var oTrReq = new XMLHttpRequest();
        oTrReq.open("GET", sBasePath + "/mockdata/Transfers.json", false);
        oTrReq.send();
        var oTrData = JSON.parse(oTrReq.responseText);
        _aTransfers = oTrData.value || [];

        // Load TransferItems.json (synchronous)
        var oTiReq = new XMLHttpRequest();
        oTiReq.open("GET", sBasePath + "/mockdata/TransferItems.json", false);
        oTiReq.send();
        var oTiData = JSON.parse(oTiReq.responseText);
        _aTransferItems = oTiData.value || [];

        DemoMockServer._interceptXHR();
        Log.info("DemoMockServer: initialized with " + _aStores.length + " stores, " + _aInventory.length + " inventory items, " + _aTransfers.length + " transfers");
    };

    DemoMockServer._interceptXHR = function () {
        var OriginalXHR = window.XMLHttpRequest;

        function MockXHR() {
            this._original = new OriginalXHR();
            this._intercepted = false;
            this._method = "";
            this._url = "";
            this.readyState = 0;
            this.status = 0;
            this.statusText = "";
            this.responseText = "";
            this.responseType = "";
            this.response = "";
            this.onreadystatechange = null;
            this.onload = null;
            this.onerror = null;

            // Copy standard properties
            this._responseHeaders = {};
        }

        MockXHR.prototype.open = function (sMethod, sUrl) {
            this._method = sMethod;
            this._url = sUrl;

            // Check if this request targets our OData service
            if (sUrl && sUrl.indexOf(_sServiceUrl) !== -1) {
                this._intercepted = true;
            } else {
                this._original.open.apply(this._original, arguments);
            }
        };

        MockXHR.prototype.send = function (sBody) {
            if (!this._intercepted) {
                // Proxy all events from original XHR
                var that = this;
                this._original.onreadystatechange = function () {
                    that.readyState = that._original.readyState;
                    that.status = that._original.status;
                    that.statusText = that._original.statusText;
                    that.responseText = that._original.responseText;
                    that.response = that._original.response;
                    that.responseType = that._original.responseType;
                    if (that.onreadystatechange) {
                        that.onreadystatechange();
                    }
                    if (that.readyState === 4 && that.onload) {
                        that.onload();
                    }
                };
                this._original.send.apply(this._original, arguments);
                return;
            }

            // Handle intercepted request
            var oResult = DemoMockServer._handleRequest(this._method, this._url, sBody);
            var that = this;

            // Simulate async response
            setTimeout(function () {
                that.readyState = 4;
                that.status = oResult.status;
                that.statusText = oResult.statusText;
                that.responseText = oResult.body;
                that.response = oResult.body;
                that._responseHeaders = oResult.headers;

                if (that.onreadystatechange) {
                    that.onreadystatechange();
                }
                if (that.onload) {
                    that.onload();
                }
            }, 5);
        };

        MockXHR.prototype.setRequestHeader = function () {
            if (!this._intercepted) {
                this._original.setRequestHeader.apply(this._original, arguments);
            }
        };

        MockXHR.prototype.getResponseHeader = function (sName) {
            if (this._intercepted) {
                return this._responseHeaders[sName.toLowerCase()] || null;
            }
            return this._original.getResponseHeader.apply(this._original, arguments);
        };

        MockXHR.prototype.getAllResponseHeaders = function () {
            if (this._intercepted) {
                var s = "";
                Object.keys(this._responseHeaders).forEach(function (k) {
                    s += k + ": " + this._responseHeaders[k] + "\r\n";
                }.bind(this));
                return s;
            }
            return this._original.getAllResponseHeaders.apply(this._original, arguments);
        };

        MockXHR.prototype.abort = function () {
            if (!this._intercepted) {
                this._original.abort.apply(this._original, arguments);
            }
        };

        MockXHR.prototype.addEventListener = function (sType, fnHandler) {
            if (!this._intercepted) {
                this._original.addEventListener.apply(this._original, arguments);
            } else {
                if (sType === "load") { this.onload = fnHandler; }
                if (sType === "readystatechange") { this.onreadystatechange = fnHandler; }
            }
        };

        MockXHR.prototype.removeEventListener = function () {
            if (!this._intercepted) {
                this._original.removeEventListener.apply(this._original, arguments);
            }
        };

        window.XMLHttpRequest = MockXHR;
    };

    DemoMockServer._handleRequest = function (sMethod, sUrl, sBody) {
        // Extract the path after the service URL
        var iIdx = sUrl.indexOf(_sServiceUrl);
        var sPath = sUrl.substring(iIdx + _sServiceUrl.length);

        // Split path and query
        var aParts = sPath.split("?");
        var sResourcePath = aParts[0];
        var sQuery = aParts[1] || "";

        // Route the request
        if (sMethod === "GET" && sResourcePath === "$metadata") {
            return DemoMockServer._respondMetadata();
        }

        if (sMethod === "GET" && sResourcePath.startsWith("Stores")) {
            return DemoMockServer._handleStoresGet(sResourcePath, sQuery);
        }

        if (sMethod === "GET" && sResourcePath.startsWith("Inventory")) {
            return DemoMockServer._handleInventoryGet(sResourcePath, sQuery);
        }

        if (sMethod === "GET" && sResourcePath.startsWith("Transfers")) {
            return DemoMockServer._handleTransfersGet(sResourcePath, sQuery);
        }

        // Write operations — return 405
        if (sMethod === "POST" || sMethod === "PATCH" || sMethod === "DELETE") {
            return {
                status: 405,
                statusText: "Method Not Allowed",
                headers: { "content-type": "application/json;odata.metadata=minimal" },
                body: JSON.stringify({ error: { code: "405", message: "Demo mode: read-only" } })
            };
        }

        // Fallback
        return {
            status: 404,
            statusText: "Not Found",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ error: { code: "404", message: "Not found" } })
        };
    };

    DemoMockServer._respondMetadata = function () {
        return {
            status: 200,
            statusText: "OK",
            headers: {
                "content-type": "application/xml",
                "odata-version": "4.0"
            },
            body: _sMetadataXml
        };
    };

    DemoMockServer._handleStoresGet = function (sResourcePath, sQuery) {
        // Single entity: Stores(ID=...,IsActiveEntity=true)
        var oKeyMatch = sResourcePath.match(/^Stores\(ID=([^,]+),IsActiveEntity=(true|false)\)/);
        if (oKeyMatch) {
            var sId = oKeyMatch[1];

            // Navigation to inventory: Stores(ID=...,IsActiveEntity=true)/inventory
            if (sResourcePath.indexOf("/inventory") !== -1) {
                var aStoreInventory = _aInventory.filter(function (item) {
                    return item.store_ID === sId;
                });
                var oParams = DemoMockServer._parseQuery(sQuery);
                var aFiltered = DemoMockServer._applyFilters(aStoreInventory, sQuery);
                var iSkip = parseInt(oParams["$skip"]) || 0;
                var iTop = parseInt(oParams["$top"]) || aFiltered.length;
                var aPage = aFiltered.slice(iSkip, iSkip + iTop);

                return {
                    status: 200,
                    statusText: "OK",
                    headers: {
                        "content-type": "application/json;odata.metadata=minimal",
                        "odata-version": "4.0"
                    },
                    body: JSON.stringify({
                        "@odata.context": "$metadata#Inventory",
                        value: aPage,
                        "@odata.count": aFiltered.length
                    })
                };
            }

            var oStore = _aStores.find(function (s) { return s.ID === sId; });
            if (oStore) {
                return {
                    status: 200,
                    statusText: "OK",
                    headers: {
                        "content-type": "application/json;odata.metadata=minimal",
                        "odata-version": "4.0"
                    },
                    body: JSON.stringify(oStore)
                };
            }
            return {
                status: 404,
                statusText: "Not Found",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ error: { code: "404", message: "Entity not found" } })
            };
        }

        // Count: Stores/$count
        if (sResourcePath === "Stores/$count") {
            var aFiltered = DemoMockServer._applyFilters(_aStores, sQuery);
            return {
                status: 200,
                statusText: "OK",
                headers: { "content-type": "text/plain", "odata-version": "4.0" },
                body: String(aFiltered.length)
            };
        }

        // Collection: Stores or Stores?$filter=...
        if (sResourcePath === "Stores") {
            var aResult = DemoMockServer._applyFilters(_aStores, sQuery);

            // Handle $skip and $top
            var oParams = DemoMockServer._parseQuery(sQuery);
            var iSkip = parseInt(oParams["$skip"]) || 0;
            var iTop = parseInt(oParams["$top"]) || aResult.length;
            var aPage = aResult.slice(iSkip, iSkip + iTop);

            return {
                status: 200,
                statusText: "OK",
                headers: {
                    "content-type": "application/json;odata.metadata=minimal",
                    "odata-version": "4.0"
                },
                body: JSON.stringify({
                    "@odata.context": "$metadata#Stores",
                    value: aPage,
                    "@odata.count": aResult.length
                })
            };
        }

        return {
            status: 200,
            statusText: "OK",
            headers: { "content-type": "application/json;odata.metadata=minimal", "odata-version": "4.0" },
            body: JSON.stringify({ value: [] })
        };
    };

    DemoMockServer._handleInventoryGet = function (sResourcePath, sQuery) {
        // Collection: Inventory
        var aResult = DemoMockServer._applyFilters(_aInventory, sQuery);
        var oParams = DemoMockServer._parseQuery(sQuery);
        var iSkip = parseInt(oParams["$skip"]) || 0;
        var iTop = parseInt(oParams["$top"]) || aResult.length;
        var aPage = aResult.slice(iSkip, iSkip + iTop);

        return {
            status: 200,
            statusText: "OK",
            headers: {
                "content-type": "application/json;odata.metadata=minimal",
                "odata-version": "4.0"
            },
            body: JSON.stringify({
                "@odata.context": "$metadata#Inventory",
                value: aPage,
                "@odata.count": aResult.length
            })
        };
    };

    DemoMockServer._handleTransfersGet = function (sResourcePath, sQuery) {
        // Single entity: Transfers(ID=...)
        var oKeyMatch = sResourcePath.match(/^Transfers\(ID=([^)]+)\)/);
        if (oKeyMatch) {
            var sId = oKeyMatch[1];

            // Navigation to items: Transfers(ID=...)/items
            if (sResourcePath.indexOf("/items") !== -1) {
                var aItems = _aTransferItems.filter(function (item) {
                    return item.transfer_ID === sId;
                });
                var oParams = DemoMockServer._parseQuery(sQuery);
                var iSkip = parseInt(oParams["$skip"]) || 0;
                var iTop = parseInt(oParams["$top"]) || aItems.length;
                var aPage = aItems.slice(iSkip, iSkip + iTop);

                return {
                    status: 200,
                    statusText: "OK",
                    headers: {
                        "content-type": "application/json;odata.metadata=minimal",
                        "odata-version": "4.0"
                    },
                    body: JSON.stringify({
                        "@odata.context": "$metadata#TransferItems",
                        value: aPage,
                        "@odata.count": aItems.length
                    })
                };
            }

            var oTransfer = _aTransfers.find(function (t) { return t.ID === sId; });
            if (oTransfer) {
                var oResult = Object.assign({}, oTransfer);
                // Expand sourceStore and destStore if requested
                var oParams = DemoMockServer._parseQuery(sQuery);
                if (oParams["$expand"]) {
                    if (oParams["$expand"].indexOf("sourceStore") !== -1) {
                        oResult.sourceStore = _aStores.find(function (s) { return s.ID === oTransfer.sourceStore_ID; }) || null;
                    }
                    if (oParams["$expand"].indexOf("destStore") !== -1) {
                        oResult.destStore = _aStores.find(function (s) { return s.ID === oTransfer.destStore_ID; }) || null;
                    }
                }
                return {
                    status: 200,
                    statusText: "OK",
                    headers: { "content-type": "application/json;odata.metadata=minimal", "odata-version": "4.0" },
                    body: JSON.stringify(oResult)
                };
            }
            return {
                status: 404,
                statusText: "Not Found",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ error: { code: "404", message: "Transfer not found" } })
            };
        }

        // Collection: Transfers
        var aResult = DemoMockServer._applyTransferFilters(_aTransfers, sQuery);
        var oParams = DemoMockServer._parseQuery(sQuery);
        var iSkip = parseInt(oParams["$skip"]) || 0;
        var iTop = parseInt(oParams["$top"]) || aResult.length;
        var aPage = aResult.slice(iSkip, iSkip + iTop);

        // Expand sourceStore/destStore if requested
        if (oParams["$expand"]) {
            aPage = aPage.map(function (oTransfer) {
                var oExpanded = Object.assign({}, oTransfer);
                if (oParams["$expand"].indexOf("sourceStore") !== -1) {
                    oExpanded.sourceStore = _aStores.find(function (s) { return s.ID === oTransfer.sourceStore_ID; }) || null;
                }
                if (oParams["$expand"].indexOf("destStore") !== -1) {
                    oExpanded.destStore = _aStores.find(function (s) { return s.ID === oTransfer.destStore_ID; }) || null;
                }
                return oExpanded;
            });
        }

        return {
            status: 200,
            statusText: "OK",
            headers: {
                "content-type": "application/json;odata.metadata=minimal",
                "odata-version": "4.0"
            },
            body: JSON.stringify({
                "@odata.context": "$metadata#Transfers",
                value: aPage,
                "@odata.count": aResult.length
            })
        };
    };

    DemoMockServer._applyTransferFilters = function (aData, sQuery) {
        var oParams = DemoMockServer._parseQuery(sQuery);
        var sFilter = oParams["$filter"];
        if (!sFilter) {
            return aData;
        }

        var aResult = aData;

        // Parse "sourceStore_ID eq 'value'"
        var rSourceEq = /sourceStore_ID\s+eq\s+'?([^')\s]+)'?/i;
        var oSourceMatch = sFilter.match(rSourceEq);

        // Parse "destStore_ID eq 'value'"
        var rDestEq = /destStore_ID\s+eq\s+'?([^')\s]+)'?/i;
        var oDestMatch = sFilter.match(rDestEq);

        // If both source and dest filters exist with OR logic, filter accordingly
        if (oSourceMatch && oDestMatch) {
            var sSourceId = oSourceMatch[1];
            var sDestId = oDestMatch[1];
            aResult = aResult.filter(function (t) {
                return t.sourceStore_ID === sSourceId || t.destStore_ID === sDestId;
            });
        } else if (oSourceMatch) {
            var sSourceIdOnly = oSourceMatch[1];
            aResult = aResult.filter(function (t) {
                return t.sourceStore_ID === sSourceIdOnly;
            });
        } else if (oDestMatch) {
            var sDestIdOnly = oDestMatch[1];
            aResult = aResult.filter(function (t) {
                return t.destStore_ID === sDestIdOnly;
            });
        }

        // Parse "status ne 'Completed'"
        var rStatusNe = /status\s+ne\s+'([^']+)'/i;
        var oStatusMatch = sFilter.match(rStatusNe);
        if (oStatusMatch) {
            var sExcludeStatus = oStatusMatch[1];
            aResult = aResult.filter(function (t) {
                return t.status !== sExcludeStatus;
            });
        }

        return aResult;
    };

    DemoMockServer._parseQuery = function (sQuery) {
        var oParams = {};
        if (!sQuery) { return oParams; }
        sQuery.split("&").forEach(function (sPart) {
            var aPair = sPart.split("=");
            oParams[decodeURIComponent(aPair[0])] = decodeURIComponent(aPair[1] || "");
        });
        return oParams;
    };

    DemoMockServer._applyFilters = function (aData, sQuery) {
        var oParams = DemoMockServer._parseQuery(sQuery);
        var sFilter = oParams["$filter"];
        if (!sFilter) {
            return aData;
        }

        var aResult = aData;

        // Parse "IsActiveEntity eq true" (always passes in demo)
        // Parse "contains(field,'value')"
        var rContains = /contains\((\w+),'([^']+)'\)/gi;
        var oMatch;
        while ((oMatch = rContains.exec(sFilter)) !== null) {
            var sField = oMatch[1];
            var sValue = oMatch[2].toLowerCase();
            aResult = aResult.filter(function (oItem) {
                var sItemVal = oItem[sField];
                return sItemVal && sItemVal.toLowerCase().indexOf(sValue) !== -1;
            });
        }

        // Parse "field eq 'value'" for string fields
        var rEq = /(\w+)\s+eq\s+'([^']+)'/gi;
        while ((oMatch = rEq.exec(sFilter)) !== null) {
            var sEqField = oMatch[1];
            var sEqValue = oMatch[2];
            if (sEqField !== "IsActiveEntity") {
                aResult = aResult.filter(function (oItem) {
                    return oItem[sEqField] === sEqValue;
                });
            }
        }

        return aResult;
    };

    return DemoMockServer;
});
