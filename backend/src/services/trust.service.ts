import prisma from '../utils/db';
import { MatchPlayerStatus, MatchStatus, ReviewType } from '@prisma/client';
import { activityService } from './activity.service';

export class TrustService {
  
  // Calculate trust category based on score
  private getTrustCategory(score: number): string {
    if (score >= 800) return 'EXCELLENT';
    if (score >= 600) return 'RELIABLE';
    if (score >= 400) return 'AVERAGE';
    return 'NEEDS_IMPROVEMENT';
  }

  // Ensure user has a trust record
  async getOrCreateTrust(userId: string) {
    let trust = await prisma.userTrust.findUnique({ where: { userId } });
    if (!trust) {
      trust = await prisma.userTrust.create({
        data: {
          userId,
          internalTrustScore: 500,
          trustCategory: 'NEW'
        }
      });
    }
    return trust;
  }

  // Recalculate score based on current metrics
  private calculateScore(trust: any) {
    let score = 500; // Base score

    // Attendance impacts
    const totalJoined = trust.totalMatchesJoined;
    if (totalJoined > 0) {
      const attendanceRate = trust.totalMatchesAttended / totalJoined;
      score += (attendanceRate - 0.5) * 200; // +100 for 100%, -100 for 0%
    }

    // No-show / late cancellation penalty
    score -= (trust.totalNoShows * 50);
    score -= (trust.totalLateCancellations * 20);

    // Host metrics
    if (trust.totalMatchesHosted > 0) {
      const cancelRate = trust.totalMatchesCancelledByHost / trust.totalMatchesHosted;
      score -= (cancelRate * 100);
    }

    // Reviews
    if (trust.totalPlayerReviews > 0) {
      score += (trust.averagePlayerRating - 3) * 30;
    }
    if (trust.totalHostReviews > 0) {
      score += (trust.averageHostRating - 3) * 40;
    }

    return Math.max(0, Math.min(1000, score)); // Clamp between 0 and 1000
  }

  // Called when a user's attendance is marked
  async updateAttendance(userId: string, matchId: string, status: MatchPlayerStatus) {
    const trust = await this.getOrCreateTrust(userId);
    
    let attended = trust.totalMatchesAttended;
    let noShows = trust.totalNoShows;
    
    if (status === MatchPlayerStatus.ATTENDED) {
      attended++;
    } else if (status === MatchPlayerStatus.ABSENT) {
      noShows++;
    }

    const newScore = this.calculateScore({
      ...trust,
      totalMatchesAttended: attended,
      totalNoShows: noShows
    });

    await prisma.userTrust.update({
      where: { userId },
      data: {
        totalMatchesAttended: attended,
        totalNoShows: noShows,
        internalTrustScore: newScore,
        trustCategory: this.getTrustCategory(newScore)
      }
    });

    if (status === MatchPlayerStatus.ATTENDED) {
      // Create activity only for attendance
      await activityService.logActivity(userId, 'BADGE_EARNED', matchId, 'Match', { status }); // Using BADGE_EARNED as a dummy since MATCH_ATTENDED not in ActivityType
    }
  }

  // Called when a user cancels joining a match
  async processCancellation(userId: string, matchId: string, isLate: boolean) {
    const trust = await this.getOrCreateTrust(userId);
    
    let lateCancels = trust.totalLateCancellations;
    if (isLate) {
      lateCancels++;
    }

    const newScore = this.calculateScore({
      ...trust,
      totalLateCancellations: lateCancels
    });

    await prisma.userTrust.update({
      where: { userId },
      data: {
        totalLateCancellations: lateCancels,
        internalTrustScore: newScore,
        trustCategory: this.getTrustCategory(newScore)
      }
    });
  }

  // Called when a user receives a review
  async processReview(targetId: string, rating: number, type: ReviewType) {
    const trust = await this.getOrCreateTrust(targetId);
    
    let avgPlayer = trust.averagePlayerRating;
    let totalPlayer = trust.totalPlayerReviews;
    let avgHost = trust.averageHostRating;
    let totalHost = trust.totalHostReviews;

    if (type === ReviewType.PLAYER) {
      avgPlayer = ((avgPlayer * totalPlayer) + rating) / (totalPlayer + 1);
      totalPlayer++;
    } else {
      avgHost = ((avgHost * totalHost) + rating) / (totalHost + 1);
      totalHost++;
    }

    const newScore = this.calculateScore({
      ...trust,
      averagePlayerRating: avgPlayer,
      totalPlayerReviews: totalPlayer,
      averageHostRating: avgHost,
      totalHostReviews: totalHost
    });

    await prisma.userTrust.update({
      where: { userId: targetId },
      data: {
        averagePlayerRating: avgPlayer,
        totalPlayerReviews: totalPlayer,
        averageHostRating: avgHost,
        totalHostReviews: totalHost,
        internalTrustScore: newScore,
        trustCategory: this.getTrustCategory(newScore)
      }
    });
  }

  // Called when a host cancels a match
  async processHostCancellation(hostId: string) {
    const trust = await this.getOrCreateTrust(hostId);
    
    const hostCancels = trust.totalMatchesCancelledByHost + 1;
    
    const newScore = this.calculateScore({
      ...trust,
      totalMatchesCancelledByHost: hostCancels
    });

    await prisma.userTrust.update({
      where: { userId: hostId },
      data: {
        totalMatchesCancelledByHost: hostCancels,
        internalTrustScore: newScore,
        trustCategory: this.getTrustCategory(newScore)
      }
    });
  }

  // Track when a user joins a match initially
  async recordMatchJoin(userId: string) {
    const trust = await this.getOrCreateTrust(userId);
    const joined = trust.totalMatchesJoined + 1;
    
    const newScore = this.calculateScore({
      ...trust,
      totalMatchesJoined: joined
    });

    await prisma.userTrust.update({
      where: { userId },
      data: {
        totalMatchesJoined: joined,
        internalTrustScore: newScore,
        trustCategory: this.getTrustCategory(newScore)
      }
    });
  }

  // Track when a user creates a match
  async recordMatchHost(userId: string) {
    const trust = await this.getOrCreateTrust(userId);
    const hosted = trust.totalMatchesHosted + 1;
    
    const newScore = this.calculateScore({
      ...trust,
      totalMatchesHosted: hosted
    });

    await prisma.userTrust.update({
      where: { userId },
      data: {
        totalMatchesHosted: hosted,
        internalTrustScore: newScore,
        trustCategory: this.getTrustCategory(newScore)
      }
    });
  }
}

export const trustService = new TrustService();
