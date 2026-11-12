// await import("<SAPUI5-DOMAIN>/resources/sap/ui/geomap/thirdparty/maplibre-gl-worker.mjs");
await import(new URLSearchParams(self.location.search).get("worker"));
