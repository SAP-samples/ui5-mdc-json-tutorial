import DefaultTypeMap from "sap/ui/mdc/DefaultTypeMap"
import BaseType from "sap/ui/mdc/enums/BaseType"
import LengthMeter from "mdc/tutorial/model/type/LengthMeter"

const TypeMap = Object.assign({}, DefaultTypeMap)
TypeMap.import(DefaultTypeMap)
TypeMap.set("mdc.tutorial.model.type.LengthMeter", BaseType.Numeric)
TypeMap.freeze()

export default TypeMap