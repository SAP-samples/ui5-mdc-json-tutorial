sap.ui.define([
    "sap/ui/mdc/FilterBarDelegate",
    "sap/ui/mdc/FilterField",
    "sap/ui/core/Element"
], function (FilterBarDelegate, FilterField, Element) {
    "use strict";

    var InventoryFilterDelegate = Object.assign({}, FilterBarDelegate);

    var aPropertyInfos = [
        { key: "name", label: "Name", dataType: "sap.ui.model.type.String" },
        { key: "category", label: "Category", dataType: "sap.ui.model.type.String" },
        { key: "type", label: "Type", dataType: "sap.ui.model.type.String" },
        { key: "size", label: "Size", dataType: "sap.ui.model.type.String" },
        { key: "color", label: "Color", dataType: "sap.ui.model.type.String" },
        { key: "quantity", label: "Quantity", dataType: "sap.ui.model.type.Integer" }
    ];

    InventoryFilterDelegate.fetchProperties = function () {
        return Promise.resolve(aPropertyInfos);
    };

    InventoryFilterDelegate.addItem = function (oFilterBar, sPropertyKey) {
        var oProperty = aPropertyInfos.find(function (p) { return p.key === sPropertyKey; });
        if (!oProperty) {
            return Promise.resolve(null);
        }

        var sId = oFilterBar.getId() + "--filter--" + sPropertyKey;
        var oExisting = Element.getElementById(sId);
        if (oExisting) {
            return Promise.resolve(oExisting);
        }

        var oFilterField = new FilterField(sId, {
            dataType: oProperty.dataType,
            conditions: "{$filters>/conditions/" + sPropertyKey + "}",
            propertyKey: sPropertyKey,
            label: oProperty.label,
            maxConditions: -1,
            delegate: { name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {} }
        });

        return Promise.resolve(oFilterField);
    };

    return InventoryFilterDelegate;
});
