import JSONPropertyInfo from "../metadata/JSONPropertyInfo"
import JSONModel from "sap/ui/model/json/JSONModel"

const pim = new JSONModel({
    PropertyInfo: JSONPropertyInfo
})

const BindingHelper = {
    create: function(name: string): string {
        return `{mountains>${name}}`
    }
}

export default BindingHelper