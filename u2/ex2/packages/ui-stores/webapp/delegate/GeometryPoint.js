sap.ui.define([
    "sap/ui/model/SimpleType"
], function (SimpleType) {
    "use strict";

    return SimpleType.extend("sap.ui.bookshop.delegate.GeometryPoint", {
        formatValue: function (oObject) {
            if (oObject && oObject.type === "Point") {
                return oObject.coordinates;
            }
            return oObject && oObject.coordinates;
        }
    });
});
