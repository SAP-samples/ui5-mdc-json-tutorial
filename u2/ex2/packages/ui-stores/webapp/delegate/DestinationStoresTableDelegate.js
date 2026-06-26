sap.ui.define([
    "sap/ui/mdc/TableDelegate",
    "./BaseDelegate",
    "sap/ui/mdc/table/Column",
    "sap/m/Text",
    "sap/ui/core/Element",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/stores/delegate/DestinationStoresFilterDelegate"
], function (TableDelegate, BaseDelegate, Column, Text, Element, Filter, FilterOperator, DestinationStoresFilterDelegate) {
    "use strict";

    var DestinationStoresTableDelegate = Object.assign({}, TableDelegate, BaseDelegate);

    DestinationStoresTableDelegate.fetchProperties = function () {
        return Promise.resolve([
            { key: "name", label: "Name", dataType: "sap.ui.model.type.String", maxConditions: -1 },
            { key: "city", label: "City", dataType: "sap.ui.model.type.String", maxConditions: -1 },
            { key: "country", label: "Country", dataType: "sap.ui.model.type.String", maxConditions: -1 }
        ]);
    };

    DestinationStoresTableDelegate.getFilterDelegate = function () {
        return DestinationStoresFilterDelegate;
    };

    DestinationStoresTableDelegate.addItem = function (oTable, sPropertyKey) {
        var aProperties = [
            { key: "name", label: "Name" },
            { key: "city", label: "City" },
            { key: "country", label: "Country" }
        ];
        var oPropertyInfo = aProperties.find(function (p) { return p.key === sPropertyKey; });
        if (!oPropertyInfo) {
            return Promise.resolve(null);
        }

        var sId = oTable.getId() + "---col-" + sPropertyKey;
        var oExisting = Element.getElementById(sId);
        if (oExisting) {
            return Promise.resolve(oExisting);
        }

        return Promise.resolve(new Column(sId, {
            propertyKey: sPropertyKey,
            header: oPropertyInfo.label,
            template: new Text({ text: "{" + sPropertyKey + "}" })
        }));
    };

    DestinationStoresTableDelegate.updateBindingInfo = function (oTable, oBindingInfo) {
        TableDelegate.updateBindingInfo.call(DestinationStoresTableDelegate, oTable, oBindingInfo);

        oBindingInfo.path = "/Stores";
        oBindingInfo.parameters = oBindingInfo.parameters || {};
        oBindingInfo.parameters.$$ownRequest = true;
        oBindingInfo.parameters.$select = "ID,IsActiveEntity,name,city,country,latitude,longitude";

        // Merge our mandatory filters with personalization filters from the base
        var aMandatoryFilters = [
            new Filter("IsActiveEntity", FilterOperator.EQ, true)
        ];

        var oTransferModel = oTable.getModel("transfer");
        if (oTransferModel) {
            var sExcludeId = oTransferModel.getProperty("/sourceStoreId");
            if (sExcludeId) {
                aMandatoryFilters.push(new Filter("ID", FilterOperator.NE, sExcludeId));
            }
        }

        // Combine personalization filters (from base) with our mandatory filters
        var aAllFilters = aMandatoryFilters.slice();
        if (oBindingInfo.filters && oBindingInfo.filters.length > 0) {
            aAllFilters = aAllFilters.concat(oBindingInfo.filters);
        }
        oBindingInfo.filters = [new Filter(aAllFilters, true)];
    };

    return DestinationStoresTableDelegate;
});
