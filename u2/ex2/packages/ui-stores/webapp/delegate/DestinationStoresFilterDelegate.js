sap.ui.define([
    "sap/ui/mdc/FilterBarDelegate",
    "sap/ui/mdc/FilterField",
    "sap/ui/core/Element"
], function (FilterBarDelegate, FilterField, Element) {
    "use strict";

    var DestinationStoresFilterDelegate = Object.assign({}, FilterBarDelegate);

    var aPropertyInfos = [
        { key: "name", label: "Name", dataType: "sap.ui.model.type.String" },
        { key: "city", label: "City", dataType: "sap.ui.model.type.String" },
        { key: "country", label: "Country", dataType: "sap.ui.model.type.String" }
    ];

    DestinationStoresFilterDelegate.fetchProperties = function () {
        return Promise.resolve(aPropertyInfos);
    };

    DestinationStoresFilterDelegate.addItem = function (oFilterBar, sPropertyKey) {
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

    return DestinationStoresFilterDelegate;
});
