import { Request, Response, NextFunction } from 'express';
import { venueService } from '../services/venue.service';
import { VenueStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { StructuredLogger } from '../utils/logger';

export class VenueController {
  async createVenue(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const venue = await venueService.createVenue(userId, req.body);
      
      StructuredLogger.audit('CREATE_VENUE', userId, venue.id, 'SUCCESS', req.id as string);
      
      res.status(201).json(venue);
    } catch (error) {
      next(error);
    }
  }

  async getVenues(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as VenueStatus;
      const sport = req.query.sport as string;
      const location = req.query.location as string;
      const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      const radius = req.query.radius ? parseFloat(req.query.radius as string) : undefined;
      const sortBy = req.query.sortBy as string;
      
      const venues = await venueService.getVenues({ status, sport, location, minRating, lat, lng, radius, sortBy });
      res.json(venues);
    } catch (error) {
      next(error);
    }
  }

  async getVenueById(req: Request, res: Response, next: NextFunction) {
    try {
      const venue = await venueService.getVenueById((req.params.id as string));
      if (!venue) {
        throw AppError.notFound('Venue not found');
      }
      res.json(venue);
    } catch (error) {
      next(error);
    }
  }

  async updateVenue(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const venue = await venueService.updateVenue((req.params.id as string), userId, req.body);
      res.json(venue);
    } catch (error) {
      next(error);
    }
  }

  async addReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { rating, comment } = req.body;
      const review = await venueService.addReview((req.params.id as string), userId, rating, comment);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      await venueService.deleteReview((req.params.reviewId as string), userId, userRole);
      res.json({ message: 'Review deleted' });
    } catch (error) {
      next(error);
    }
  }

  async verifyVenue(req: Request, res: Response, next: NextFunction) {
    try {
      const adminRole = req.user!.role;
      const adminId = req.user!.id;
      const { status } = req.body;
      const venueId = req.params.id as string;
      const venue = await venueService.verifyVenue(venueId, status, adminRole);
      
      StructuredLogger.audit('VERIFY_VENUE', adminId, venueId, 'SUCCESS', req.id as string, { status });
      
      res.json(venue);
    } catch (error) {
      next(error);
    }
  }
}

export const venueController = new VenueController();
