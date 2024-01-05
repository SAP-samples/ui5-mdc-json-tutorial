"use strict";

sap.ui.define(["sap/ui/model/type/Integer", "sap/ui/core/format/NumberFormat"], function (Integer, NumberFormat) {
  "use strict";

  class LengthMeter extends Integer {
    formatValue(iHeight) {
      const oUnitFormat = NumberFormat.getUnitInstance();
      return oUnitFormat.format(iHeight, "length-meter");
    }
  }
  return LengthMeter;
});
//# sourceMappingURL=LengthMeter-dbg.js.map
