import Integer from "sap/ui/model/type/Integer"
import NumberFormat from "sap/ui/core/format/NumberFormat"

export default class LengthMeter extends Integer {
    formatValue(iHeight: number) {
        const oUnitFormat = NumberFormat.getUnitInstance()
        return oUnitFormat.format(iHeight, "length-meter")
    }
}