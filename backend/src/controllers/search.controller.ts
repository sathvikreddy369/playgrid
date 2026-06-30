import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/search.service';
import { AppError } from '../utils/AppError';

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q = '', type = 'ALL', lat, lng, radius = '10' } = req.query;

      // Nearby Search (Requires lat and lng)
      if (lat && lng && (type === 'MATCHES' || type === 'GROUNDS')) {
        const results = await searchService.nearbySearch(
          parseFloat(lat as string), 
          parseFloat(lng as string), 
          parseFloat(radius as string),
          type as 'MATCHES' | 'GROUNDS'
        );
        return res.json({ nearby: true, results });
      }

      // Standard Global Search
      const results = await searchService.globalSearch(q as string, type as string);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  async aiSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.body;

      // 1. Parse natural language into JSON filters using Gemini
      const filters = await searchService.parseQueryWithAI(q);

      // 2. Apply filters to DB
      const results = await searchService.applyAIFilters(filters);

      res.json(results);
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
