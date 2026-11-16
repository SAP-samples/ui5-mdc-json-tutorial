sap.ui.define([
    "sap/ui/mdc/odata/v4/TypeMap",
    "sap/ui/mdc/enums/BaseType",
    "./GeometryPoint"
], function (V4TypeMap, BaseType, GeometryPoint) {
    "use strict";

    var TypeMap = Object.assign({}, V4TypeMap);
    TypeMap.import(V4TypeMap);
    TypeMap.set("sap.ui.bookshop.delegate.GeometryPoint", BaseType.Numeric);
    TypeMap.setAlias("Edm.GeographyPoint", "sap.ui.bookshop.delegate.GeometryPoint");
    TypeMap.freeze();

    return TypeMap;
});
