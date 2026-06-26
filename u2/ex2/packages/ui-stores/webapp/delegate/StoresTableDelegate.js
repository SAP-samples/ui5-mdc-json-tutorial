sap.ui.define([
    "sap/ui/mdc/TableDelegate",
    "./BaseDelegate",
    "sap/ui/mdc/table/Column",
    "sap/m/Text",
    "sap/ui/core/Element",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (TableDelegate, BaseDelegate, Column, Text, Element, Filter, FilterOperator) {
    "use strict";

    var StoresTableDelegate = Object.assign({}, TableDelegate, BaseDelegate);

    StoresTableDelegate.fetchProperties = function () {
        return Promise.resolve([
            { key: "name", label: "Name", dataType: "sap.ui.model.type.String" },
            { key: "city", label: "City", dataType: "sap.ui.model.type.String" },
            { key: "country", label: "Country", dataType: "sap.ui.model.type.String" },
            { key: "address", label: "Address", dataType: "sap.ui.model.type.String" },
            { key: "phone", label: "Phone", dataType: "sap.ui.model.type.String" },
            { key: "openingHours", label: "Opening Hours", dataType: "sap.ui.model.type.String" }
        ]);
    };

    StoresTableDelegate.addItem = function (oTable, sPropertyKey) {
        var aProperties = [
            { key: "name", label: "Name" },
            { key: "city", label: "City" },
            { key: "country", label: "Country" },
            { key: "address", label: "Address" },
            { key: "phone", label: "Phone" },
            { key: "openingHours", label: "Opening Hours" }
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
            template: new Text({
                text: "{" + sPropertyKey + "}"
            })
        }));
    };

    StoresTableDelegate.updateBindingInfo = function (oTable, oBindingInfo) {
        TableDelegate.updateBindingInfo.call(StoresTableDelegate, oTable, oBindingInfo);
        oBindingInfo.path = "/Stores";
        oBindingInfo.parameters = oBindingInfo.parameters || {};
        oBindingInfo.parameters.$$ownRequest = true;
        oBindingInfo.parameters.$select = "ID,IsActiveEntity,name,city,country,address,phone,openingHours,latitude,longitude";
        oBindingInfo.filters = [
            new Filter({ path: "IsActiveEntity", operator: FilterOperator.EQ, value1: true })
        ];
    };

    return StoresTableDelegate;
});
