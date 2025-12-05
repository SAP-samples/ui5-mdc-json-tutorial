/**
 * @namespace mdc.tutorial.model.metadata
 *
 * Property Example:
 * {
 * 	  "coordinates": "27°59'17''N 86°55'31''E",
 * 	  "parent_mountain": "-",
 * 	  "first_ascent": 1953,
 * 	  "countries": "Nepal, China",
 * 	  "geometry": {
 * 	  	"type": "Point",
 * 	  	"coordinates": [39.7972, 47.115],
 * 	  	"properties": {
 *          "rank": 1,
*      		"name": "Mount Everest",
*      		"height": 8848,
*      		"prominence": 8848,
*      		"range": "Mahalangur Himalaya",
 * 	  	}
 * 	  },
 * }
 */
export default [
	{
		key: "coordinates",
		label: "Coordinates",
		visible: true,
		path: "coordinates",
		dataType: "sap.ui.model.type.String"
	},{
		key: "parent_mountain",
		label: "Parent Mountain",
		visible: true,
		path: "parent_mountain",
		dataType: "sap.ui.model.type.String"
	},{
		key: "first_ascent",
		label: "First Ascent",
		visible: true,
		path: "first_ascent",
		dataType: "sap.ui.model.type.Integer"
	},{
		key: "geometry",
		label: "Geometry",
		visible: true,
		path: "geometry",
		dataType: "mdc.tutorial.model.type.Geometry"
	},{
		key: "$search",
		label: "Search",
		visible: true,
		maxConditions: 1,
		dataType: "sap.ui.model.type.String"
	}
]