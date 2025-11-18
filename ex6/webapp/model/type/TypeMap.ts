import DefaultTypeMap from "sap/ui/mdc/DefaultTypeMap"
import BaseType from "sap/ui/mdc/enums/BaseType"
import LengthMeter from "mdc/tutorial/model/type/LengthMeter"
import Geometry from "mdc/tutorial/model/type/Geometry"

const TypeMap = Object.assign({}, DefaultTypeMap)
const a = Geometry; // workaround for the build to iclude Geometry Type
TypeMap.import(DefaultTypeMap)
TypeMap.set("mdc.tutorial.model.type.LengthMeter", BaseType.Numeric)
TypeMap.set("mdc.tutorial.model.type.Geometry", BaseType.Numeric)
TypeMap.freeze()

export default TypeMap