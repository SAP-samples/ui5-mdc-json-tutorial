import Float from "sap/ui/model/type/Float"

type GeometryType = {
    type: string,
    coordinates: Number[]
}

export default class Geometry extends Float {
    formatValue(oObject: GeometryType) {
        const coordinates = oObject.coordinates;

        return coordinates;
    }
}