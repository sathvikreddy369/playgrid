"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchController = exports.SearchController = void 0;
const search_service_1 = require("../services/search.service");
class SearchController {
    async search(req, res) {
        try {
            const { q = '', type = 'ALL', lat, lng, radius = '10' } = req.query;
            // Nearby Search (Requires lat and lng)
            if (lat && lng && (type === 'MATCHES' || type === 'GROUNDS')) {
                const results = await search_service_1.searchService.nearbySearch(parseFloat(lat), parseFloat(lng), parseFloat(radius), type);
                return res.json({ nearby: true, results });
            }
            // Standard Global Search
            const results = await search_service_1.searchService.globalSearch(q, type);
            res.json(results);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async aiSearch(req, res) {
        try {
            const { q } = req.body;
            if (!q)
                return res.status(400).json({ error: 'Query string is required' });
            // 1. Parse natural language into JSON filters using Gemini
            const filters = await search_service_1.searchService.parseQueryWithAI(q);
            // 2. Apply filters to DB
            const results = await search_service_1.searchService.applyAIFilters(filters);
            res.json(results);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.SearchController = SearchController;
exports.searchController = new SearchController();
//# sourceMappingURL=search.controller.js.map