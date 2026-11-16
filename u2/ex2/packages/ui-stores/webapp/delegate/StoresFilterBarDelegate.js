sap.ui.define([
    "sap/ui/mdc/FilterBarDelegate",
    "sap/ui/mdc/FilterField",
    "sap/ui/model/type/String"
], function (FilterBarDelegate, FilterField, StringType) {
    "use strict";

    var StoresFilterBarDelegate = Object.assign({}, FilterBarDelegate);

    StoresFilterBarDelegate.fetchProperties = function (oFilterBar) {
        return Promise.resolve([
            { key: "name", label: "Name", dataType: "sap.ui.model.type.String" },
            { key: "city", label: "City", dataType: "sap.ui.model.type.String" },
            { key: "country", label: "Country", dataType: "sap.ui.model.type.String" }
        ]);
    };

    StoresFilterBarDelegate.addItem = function (oFilterBar, sPropertyName) {
        var oProperty = {
            name: { key: "name", label: "Name" },
            city: { key: "city", label: "City" },
            country: { key: "country", label: "Country" }
        }[sPropertyName];

        if (!oProperty) {
            return Promise.resolve(null);
        }

        var oFilterField = new FilterField({
            delegate: { name: "sap/ui/mdc/field/FieldBaseDelegate", payload: {} },
            dataType: "sap.ui.model.type.String",
            conditions: "{$filters>/conditions/" + oProperty.key + "}",
            label: oProperty.label,
            maxConditions: -1
        });

        return Promise.resolve(oFilterField);
    };

    StoresFilterBarDelegate.clearFilters = function (oFilterBar) {
        var oConditionModel = oFilterBar.getModel("$filters");
        if (oConditionModel) {
            oConditionModel.setProperty("/conditions/name", []);
            oConditionModel.setProperty("/conditions/city", []);
            oConditionModel.setProperty("/conditions/country", []);
        }
        return oFilterBar.triggerSearch();
    };

    return StoresFilterBarDelegate;
});
