sap.ui.define([
    "sap/ui/mdc/TableDelegate",
    "./BaseDelegate",
    "sap/ui/mdc/table/Column",
    "sap/m/Text",
    "sap/m/ObjectNumber",
    "sap/ui/core/Element",
    "sap/ui/model/Sorter",
    "sap/ui/stores/delegate/InventoryFilterDelegate"
], function (TableDelegate, BaseDelegate, Column, Text, ObjectNumber, Element, Sorter, InventoryFilterDelegate) {
    "use strict";

    var InventoryTableDelegate = Object.assign({}, TableDelegate, BaseDelegate);

    InventoryTableDelegate.fetchProperties = function () {
        return Promise.resolve([
            { key: "name", label: "Name", dataType: "sap.ui.model.type.String", maxConditions: -1 },
            { key: "category", label: "Category", dataType: "sap.ui.model.type.String", maxConditions: -1 },
            { key: "type", label: "Type", dataType: "sap.ui.model.type.String", maxConditions: -1 },
            { key: "size", label: "Size", dataType: "sap.ui.model.type.String", maxConditions: -1 },
            { key: "color", label: "Color", dataType: "sap.ui.model.type.String", maxConditions: -1 },
            { key: "quantity", label: "Quantity", dataType: "sap.ui.model.type.Integer", maxConditions: -1 }
        ]);
    };

    InventoryTableDelegate.getFilterDelegate = function () {
        return InventoryFilterDelegate;
    };

    InventoryTableDelegate.addItem = function (oTable, sPropertyKey) {
        var aProperties = [
            { key: "name", label: "Name" },
            { key: "category", label: "Category" },
            { key: "type", label: "Type" },
            { key: "size", label: "Size" },
            { key: "color", label: "Color" },
            { key: "quantity", label: "Quantity" }
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

        var oTemplate;
        if (sPropertyKey === "quantity") {
            oTemplate = new ObjectNumber({ number: "{" + sPropertyKey + "}" });
        } else {
            oTemplate = new Text({ text: "{" + sPropertyKey + "}" });
        }

        return Promise.resolve(new Column(sId, {
            propertyKey: sPropertyKey,
            header: oPropertyInfo.label,
            template: oTemplate
        }));
    };

    InventoryTableDelegate.updateBindingInfo = function (oTable, oBindingInfo) {
        TableDelegate.updateBindingInfo.call(InventoryTableDelegate, oTable, oBindingInfo);

        oBindingInfo.path = "inventory";
        oBindingInfo.parameters = oBindingInfo.parameters || {};
        oBindingInfo.parameters.$$ownRequest = true;
        oBindingInfo.parameters.$count = true;
        oBindingInfo.parameters.$select = "ID,IsActiveEntity,name,category,type,size,color,quantity";

        // Append default sorters only if personalization hasn't set any
        if (!oBindingInfo.sorter || oBindingInfo.sorter.length === 0) {
            oBindingInfo.sorter = [
                new Sorter("category"),
                new Sorter("type"),
                new Sorter("name")
            ];
        }
    };

    return InventoryTableDelegate;
});
