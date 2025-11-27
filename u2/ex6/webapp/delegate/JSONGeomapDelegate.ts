import GeomapDelegate from "sap/ui/mdc/GeomapDelegate"
import Text from "sap/m/Text"
import JSONPropertyInfo from "mdc/tutorial/model/metadata/JSONPropertyInfo"
import {Geomap as MDCGeomap, PropertyInfo as GeomapPropertyInfo} from "sap/ui/mdc/Geomap"
import JSONBaseDelegate from "./JSONBaseDelegate"
import Geomap from 'sap/ui/geomap/Geomap'
import GeomapProvider from 'sap/ui/geomap/GeomapProvider'
import GeomapSpot from 'sap/ui/geomap/GeomapSpot'
import GeomapNavigationControl from	'sap/ui/geomap/GeomapNavigationControl'
import GeomapSelectionControl from 'sap/ui/geomap/GeomapSelectionControl'
import GeomapScaleControl from 'sap/ui/geomap/GeomapScaleControl'
import GeomapCopyrightControl from 'sap/ui/geomap/GeomapCopyrightControl'
import GeomapFullscreenControl from 'sap/ui/geomap/GeomapFullscreenControl'
import GeomapControlPosition from "sap/ui/mdc/enums/GeomapControlPosition"
import GeomapPolygon from "sap/ui/geomap/GeomapPolygon"
import GeomapPoint from "sap/ui/geomap/GeomapPoint"
import GeomapLine from "sap/ui/geomap/GeomapLine"
import JSONModel from "sap/ui/model/json/JSONModel"
import Popover from "sap/m/Popover"
import List from "sap/m/List"
import StandardListItem from "sap/m/StandardListItem"
import Log from "sap/base/Log"
import Link from "sap/m/Link"

interface GeomapPayload {
	bindingPath: string
}

const JSONGeomapDelegate = Object.assign({}, GeomapDelegate, JSONBaseDelegate)

const mStateMap = new window.WeakMap();

JSONGeomapDelegate._getState = function(oGeomap: MDCGeomap) {
	if (mStateMap.has(oGeomap)) {
		return mStateMap.get(oGeomap);
	}

	return {};
};

JSONGeomapDelegate._setState = function(oGeomap: MDCGeomap, oState: any) {
	mStateMap.set(oGeomap, oState);
};

JSONGeomapDelegate._getMetadataInfo = (oGeomap: MDCGeomap) => {
	return oGeomap.getDelegate().payload;
};

JSONGeomapDelegate.fetchProperties = function (oGeomap: MDCGeomap) {
	const aProperties = JSONPropertyInfo.filter((oPI) => oPI.key !== "$search");

	oGeomap.awaitPropertyHelper().then(function(oPropertyHelper: any) {
		oPropertyHelper.setProperties(aProperties);
	});

	oGeomap.setPropertyInfo(aProperties);

	return aProperties;
};

JSONGeomapDelegate._getModel = function (oGeomap: MDCGeomap) {
	const oMetadataInfo = oGeomap.getDelegate().payload;
	return oGeomap.getModel(oMetadataInfo.collectionPath);
};

JSONGeomapDelegate.initializeGeomap = function (oGeomap: MDCGeomap) {
	return JSONGeomapDelegate._createContentFromPropertyInfos(oGeomap);
};

JSONGeomapDelegate._createContentFromPropertyInfos = function (oGeomap: MDCGeomap, bForceRebind: boolean) {
	return new Promise(function (resolve, reject) {

		const aMapControls = [];

		const oControlPositions = JSONGeomapDelegate.getControlPositions().controlPositions;
		aMapControls.push(new GeomapProvider({
			id: "mapProvider",
			styleUrl: JSONGeomapDelegate.getProvider()
		}));

		if (oGeomap.getEnableNavigationControl()) {
			aMapControls.push(new GeomapNavigationControl({
				position: oControlPositions?.navigation ?? GeomapControlPosition.TopLeft
			}));
		}

		if (oGeomap.getEnableSelectionControl()) {
			aMapControls.push(new GeomapSelectionControl({
				position: oControlPositions?.selection ?? GeomapControlPosition.TopRight
			}));
		}

		if (oGeomap.getEnableFullscreenControl()) {
			aMapControls.push(new GeomapFullscreenControl({
				position: oControlPositions?.fullscreen ?? GeomapControlPosition.TopRight
			}));
		}

		if (oGeomap.getEnableScaleControl()) {
			aMapControls.push(new GeomapScaleControl({
				position: oControlPositions?.scale ?? GeomapControlPosition.BottomLeft
			}));
		}

		if (oGeomap.getEnableCopyrightControl()) {

			const oText = new Text({text: "Map data from "});
			oText.addStyleClass("copyright");
			const oLink =  new Link({
				text: "OpenStreetMap",
				href: "https://www.openstreetmap.org/copyright",
				target: "_blank"
			});
			oLink.addStyleClass("sapUiTinyMarginBegin")
			aMapControls.push(new GeomapCopyrightControl({
				position: GeomapControlPosition.BottomRight,
				content: [
					oText,
					oLink
				]
			}));
		}

		const geomapInstance = new Geomap({
			centerLat: oGeomap.getCenterLat(),
			centerLng: oGeomap.getCenterLng(),
			zoom: oGeomap.getZoom(),
			height: oGeomap.getWidth(),
			width: oGeomap.getHeight(),
			mapControls: aMapControls,
			items: []
		});

		geomapInstance.setModel(oGeomap.getModel());

		const oModel = oGeomap.getModel();
		if (bForceRebind) {
			oModel.fireRequestCompleted();
		}
		if (oModel) {
			const oData = oModel.getData();
			const aCollection = oData[oGeomap.getDelegate().payload.collectionName];

			const aFlattened: any[] = [];

			const aInitiallyVisibleProperties = JSONGeomapDelegate.getVisibleProperties(oGeomap);

			aCollection.forEach(function (oFeature: any) {
				const aPropertyInfos = JSONGeomapDelegate.fetchProperties(oGeomap);
				aPropertyInfos.forEach((oPropertyInfo: any) => {

					if (oPropertyInfo.key &&
						oPropertyInfo.dataType.toLowerCase().includes("geom") &&
						!(
							aInitiallyVisibleProperties.length > 0 &&
							!aInitiallyVisibleProperties.includes(oPropertyInfo.key)
						)
					) {
						if (oFeature[oPropertyInfo.path]) {
							aFlattened.push({
								GeometryType: oPropertyInfo.dataType,
								path: oPropertyInfo.path,
								key: oPropertyInfo.key,
								geometry: oFeature[oPropertyInfo.path],
								properties: oFeature.properties || {}
							});
						}
					}
				});
			});

			// Create flattened JSONModel
			const oFlatModel = new JSONModel(aFlattened);
			// Set the flattened model to the geomap instance
			geomapInstance.setModel(oFlatModel);
			geomapInstance.bindAggregation("items", {
				path: "/",
				factory: JSONGeomapDelegate.createItemTemplateFactory.bind(this, oGeomap),
				templateShareable: false
			});
		}

		geomapInstance.attachMapClick((event: any) => {
			const mParams = event.getParameters();
			Log.info(`Map clicked at ${mParams.lng}, ${mParams.lat}`);
		});

		oGeomap.setAggregation("_geomap", geomapInstance);
		oGeomap._applyConfigurations();

		const oState = JSONGeomapDelegate._getState(oGeomap);
		oState.innerGeomap = geomapInstance;
		JSONGeomapDelegate._setState(oGeomap, oState);

		resolve(oGeomap);
	});
};

JSONGeomapDelegate.createItemTemplateFactory = (oGeomap: MDCGeomap, sId: string, oContext: any) => {
	const oContextObject = oContext.getObject();
	let oTemplate;
	switch (oContextObject.geometry.type) {
		case "Point": {
			oTemplate = _createSpotObject("", oContextObject, oGeomap);
			break;
		}
		case "Polygon": {
			oTemplate = _createPolygonObject("", oContextObject, oGeomap);
			break;
		}
		case "LineString": {
			oTemplate = _createLineObject("", oContextObject, oGeomap);
			break;
		}
	}
	return oTemplate;
};

/**
 * "Forwards" the initial content (items) for the geomap
 * @param oGeomap
 */
JSONGeomapDelegate.createInitialGeomapContent = function (oGeomap: MDCGeomap) {
	const oGeomapInstance = oGeomap.getAggregation("_geomap");

	// if in future we need to pass some initial content, we can do it here

	const oState = JSONGeomapDelegate._getState(oGeomap);
	oState.innerGeomap = oGeomapInstance;
	JSONGeomapDelegate._setState(oGeomap, oState);
};

const _createSpotObject = (sId: string, oContext: any, oGeomap: MDCGeomap) => {
	let color =  "#000000";
	let width = "1rem";
	const icon = "map";

	if (oContext.geometry.properties.height > 8000) {
		color = "#e70a29";
	} else if (oGeomap.getDelegate().payload?.spotConfig?.color) {
		color = oGeomap.getDelegate().payload?.spotConfig?.color;
	}
	if (oContext.geometry.properties.height > 5000) {
		width = "2rem";
	} else if (oContext.geometry.properties.height > 2000) {
		width = "1.5rem";
	}

	const oSpot = new GeomapSpot({
		lng: oContext.geometry.coordinates[0],
		lat: oContext.geometry.coordinates[1],
		height: oGeomap.getDelegate().payload?.spotConfig?.height,
		color: color,
		icon: icon,
		width: width
	});

	oSpot.attachClick((e: any) => {
		const oTarget = e.getSource();
		const oPopover = new Popover({
			title: oContext.geometry.properties.name,
			content: [
				new List({
					items: [
						new StandardListItem({
							title: "Height: " + oContext.geometry.properties.height
						}),
						new StandardListItem({
							title: "Rank: " + oContext.geometry.properties.rank
						}),
						new StandardListItem({
							title: "Prominence: " + oContext.geometry.properties.prominence
						}),
						new StandardListItem({
							title: "Range: " + oContext.geometry.properties.range
						}),
						new StandardListItem({
							title: "Countries: " + oContext.geometry.properties.countries
						})
					]
				})
			]
		});
		oTarget.addDependent(oPopover);
		oPopover.openBy(oTarget);
	});

	return oSpot;
};

const _createPolygonObject = (sId: string, oContext: any, oGeomap: MDCGeomap) => {
	const oPolygon = new GeomapPolygon({
		points: oContext.geometry.coordinates[0].map((aPoint: any[]) => {
			return new GeomapPoint({
				lng: aPoint[0],
				lat: aPoint[1]
			});
		})
	});
	return oPolygon;
};
const _createLineObject = (sId: string, oContext: any, oGeomap: MDCGeomap) => {
	const oLine = new GeomapLine({
		width: 10,
		points: oContext.geometry.coordinates.map((aPoint: any[]) => {
			return new GeomapPoint({
				lng: aPoint[0],
				lat: aPoint[1]
			});
		})
	});
	return oLine;
};

/**
 * Updates the binding info
 * @param oGeomap
 * @param oBindingInfo
 */
JSONGeomapDelegate.updateBindingInfo = function (oGeomap: MDCGeomap, oBindingInfo: any) {
	JSONGeomapDelegate.updateBindingInfo.call(JSONGeomapDelegate, oGeomap, oBindingInfo);
	oBindingInfo.path = "/" + oGeomap.getPayload().collectionName;
};

/**
 * Propagates the changes from the control to the inner Geomap instance (webc)
 * @param oGeomap
 * @param oChange
 */
JSONGeomapDelegate.propagateItemChangeToGeomap = function (oGeomap: MDCGeomap, oChange: any) {
	if (oChange.mutation === "insert") {
		if (oChange.child) {
			Log.info("Inserting item to geomap: " + oChange);
		}

		JSONGeomapDelegate.rebind(oGeomap, JSONGeomapDelegate.getBindingInfo(oGeomap));
	}
};

/**
 * Returns the inner Geomap instance (webc)
 * @param oGeomap
 * @returns {sap.ui.geomap.Geomap}
 * @private
 */
JSONGeomapDelegate._getInnerGeomap = function (oGeomap: MDCGeomap) {
	return oGeomap.getAggregation("_geomap");
};

/**
 * Returns the binding info for given geomap.
 * If no binding info exists yet, a new one will be created.
 * @param {sap.ui.mdc.Geomap} oGeomap Reference to the MDC geomap
 * @returns {object} BindingInfo object
 *
 * @experimental
 * @private
 * @ui5-restricted sap.fe, sap.ui.mdc
 */
JSONGeomapDelegate.getBindingInfo = function (oGeomap: MDCGeomap) {

	const sEntitySetPath = "/" + JSONGeomapDelegate._getMetadataInfo(oGeomap).collectionName;
	const oBindingInfo = {
		path: sEntitySetPath
	};
	return oBindingInfo;
};

/**
 * Returns the current zoom level of the inner Geomap instance (webc)
 * @param oGeomap
 * @returns {number}
 */
JSONGeomapDelegate.getZoomLevel = function(oGeomap: MDCGeomap) {
	oGeomap.getControlDelegate()._getInnerGeomap(oGeomap).getZoom();
};

/**
 * Sets the zoom level of the inner Geomap instance (webc)
 * @param oGeomap
 * @param iZoomLevel
 */
JSONGeomapDelegate.zoomIn = function(oGeomap: MDCGeomap) {
	oGeomap.getAggregation("_geomap").setZoom(oGeomap.getAggregation("_geomap").getZoom() + 1);
};

/**
 * Sets the zoom level of the inner Geomap instance (webc)
 * @param oGeomap
 * @param iZoomLevel
 */
JSONGeomapDelegate.zoomOut = function(oGeomap: MDCGeomap) {
	oGeomap.getAggregation("_geomap").setZoom(oGeomap.getAggregation("_geomap").getZoom() - 1);
};

JSONGeomapDelegate.getGeomapBound = function(oGeomap: MDCGeomap) {
	const oState = this._getState(oGeomap);
	return !!oState?.innerGeomap;
};

JSONGeomapDelegate.getControlPositions = function() {
	return {
		controlPositions: {
			navigation: GeomapControlPosition.TopLeft,
			selection: GeomapControlPosition.TopRight,
			fullscreen: GeomapControlPosition.TopRight,
			scale: GeomapControlPosition.BottomLeft
		}
	};
};

JSONGeomapDelegate.getProvider = function() {
	const osm = sap.ui.require.toUrl("mdc/tutorial/model/osm.json");
	return `${window.location.origin}/${osm}`;
};

JSONGeomapDelegate._setBindingInfoForState = function(oGeomap: MDCGeomap, oBindingInfo: any) {
	if (mStateMap.has(oGeomap)) {
		mStateMap.get(oGeomap).bindingInfo = oBindingInfo;
	} else {
		mStateMap.set(oGeomap, { bindingInfo: oBindingInfo });
	}
};

JSONGeomapDelegate.rebind = function(oGeomap: MDCGeomap, oBindingInfo: any) {
	if (oGeomap && oBindingInfo && this._getInnerGeomap(oGeomap)) {

		if (oBindingInfo.binding) {
			oBindingInfo.binding.bHasAnalyticalInfo = true;
		}

		JSONGeomapDelegate._createContentFromPropertyInfos(oGeomap, true);

		this._setBindingInfoForState(oGeomap, oBindingInfo);
	}
};

export default JSONGeomapDelegate