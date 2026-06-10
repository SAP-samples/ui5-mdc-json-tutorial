const cds = require('@sap/cds');

module.exports = class StoresService extends cds.ApplicationService {
    init() {
        const { Stores } = this.entities;

        this.before('SAVE', Stores, (req) => {
            const { name, city, country } = req.data;
            if (!name) req.error(400, 'Name is required', 'in/name');
            if (!city) req.error(400, 'City is required', 'in/city');
            if (!country) req.error(400, 'Country is required', 'in/country');
        });

        return super.init();
    }
};
