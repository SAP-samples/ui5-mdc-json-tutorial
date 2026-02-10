// TypeScript version of ChartJSPropertyHelper.js
import PropertyHelperBase from "sap/ui/mdc/chart/PropertyHelper";
import ChartItemRoleType from "sap/ui/mdc/enums/ChartItemRoleType";
import type ManagedObject from "sap/ui/base/ManagedObject";

interface ChartProperty {
    groupable?: boolean;
    aggregatable?: boolean;
    kind?: string;
    typeConfig?: any;
    dataType?: string;
    formatOptions?: object;
    constraints?: object;
    visible?: boolean;
    // Add other property fields as needed
}

/**
 * ChartJSPropertyHelper
 * TypeScript version of the chart property helper.
 *
 * @author SAP SE
 * @private
 * @since 1.83
 */
export default class ChartJSPropertyHelper extends PropertyHelperBase {
    constructor(aProperties: ChartProperty[], oParent?: ManagedObject) {
        super(aProperties, oParent, {
            filterable: true,
            sortable: true,
            //propertyInfos: true,
            //Additional attributes
            groupable: {
                type: "boolean"
            },
            aggregatable: {
                type: "boolean"
            }
        });
    }

    prepareProperty(oProperty: ChartProperty): void {
        if (oProperty.groupable) {
            oProperty.kind = "Groupable";
        } else if (oProperty.aggregatable) {
            oProperty.kind = "Aggregatable";
        }
        if (!oProperty.typeConfig && oProperty.dataType) {
            const oFormatOptions = oProperty.formatOptions ? oProperty.formatOptions : null;
            const oConstraints = oProperty.constraints ? oProperty.constraints : {};
            oProperty.typeConfig = this.getParent().getTypeMap().getTypeConfig(
                oProperty.dataType,
                oFormatOptions,
                oConstraints
            );
        }
        oProperty.visible = true; // visible is required to make the Dim/Measures visible on the ChartItemPanel
    }
}
