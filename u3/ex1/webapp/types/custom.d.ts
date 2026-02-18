// Type declarations for custom Chart.js modules loaded via sap.ui.loader

declare module "custom/Chart" {
    const Chart: {
        register: (...plugins: any[]) => void;
        // Add other Chart.js methods as needed
        [key: string]: any;
    };
    export default Chart;
}

declare module "custom/ChartZoom" {
    const ChartZoom: {
        id: string;
        // Add other plugin properties as needed
        [key: string]: any;
    };
    export default ChartZoom;
}

declare module "custom/Hammer" {
    const Hammer: any;
    export default Hammer;
}
