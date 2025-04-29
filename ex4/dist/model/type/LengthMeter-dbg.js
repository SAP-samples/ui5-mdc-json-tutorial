sap.ui.define(["sap/ui/model/type/Integer", "sap/ui/core/format/NumberFormat"], function (Integer, NumberFormat) {
  "use strict";

  class LengthMeter extends Integer {
    formatValue(height) {
      const unitFormat = NumberFormat.getUnitInstance();
      return unitFormat.format(height, "length-meter");
    }
  }
  return LengthMeter;
});
//# sourceMappingURL=LengthMeter-dbg.js.map
