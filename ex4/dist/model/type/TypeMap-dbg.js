"use strict";

sap.ui.define(["sap/ui/mdc/DefaultTypeMap", "sap/ui/mdc/enums/BaseType"], function (DefaultTypeMap, BaseType) {
  "use strict";

  const TypeMap = Object.assign({}, DefaultTypeMap);
  TypeMap.import(DefaultTypeMap);
  TypeMap.set("mdc.tutorial.model.type.LengthMeter", BaseType.Numeric);
  TypeMap.freeze();
  return TypeMap;
});
//# sourceMappingURL=TypeMap-dbg.js.map
