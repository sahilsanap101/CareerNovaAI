// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { CareerRecommendationResult as CareerRecommendation } from './recommendationEngine.service';
import { StudentRecommendationProfile } from '../types';

const prisma = new PrismaClient();

export class RecommendationHistoryService {
  /**
   * Generates a hash for the top 5 recommendation career IDs and their scores.
   * This determines if the actual output changed.
   */
  private static hashResults(recommendations: any[]): string {
    const top5 = recommendations.slice(0, 5);
    const summary = top5.map(r => `${r.careerId}:${r.combinedScore || r.finalScore}`).join('|');
    return crypto.createHash('md5').update(summary).digest('hex');
  }

  /**
   * Generates a hash for the student profile state.
   */
  private static hashProfile(profile: StudentRecommendationProfile): string {
    return crypto.createHash('md5').update(JSON.stringify(profile)).digest('hex');
  }

  /**
   * Saves a new snapshot if the recommendations or profile have meaningfully changed.
   */
  public static async saveSnapshotIfNeeded(
    userId: string,
    profile: StudentRecommendationProfile,
    recommendations: any[]
  ): Promise<void> {
    try {
      // 1. Get the most recent snapshot for this user
      const latestSnapshot = await prisma.careerRecommendationHistory.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      const currentRecHash = this.hashResults(recommendations);
      const currentProfileHash = this.hashProfile(profile);

      if (latestSnapshot) {
        const previousRecs = latestSnapshot.recommendations as unknown as CareerRecommendation[];
        const previousProfile = latestSnapshot.profileSnapshot as unknown as StudentRecommendationProfile;
        
        const prevRecHash = this.hashResults(previousRecs);
        const prevProfileHash = this.hashProfile(previousProfile);

        // If the top 5 matches and the profile are exactly the same, skip saving to prevent DB spam.
        if (currentRecHash === prevRecHash && currentProfileHash === prevProfileHash) {
          return;
        }
      }

      // 2. Save new snapshot
      await prisma.careerRecommendationHistory.create({
        data: {
          userId,
          algorithmVersion: '1.0.0', // Currently static, can be dynamic in future
          knowledgeVersion: '1.0.0', // Currently static
          profileSnapshot: profile as any,
          recommendations: recommendations as any,
        }
      });
      
    } catch (err) {
      console.error('Failed to save career recommendation history snapshot:', err);
      // We do not throw because this is an async side-effect, we don't want to break the main request
    }
  }

  /**
   * Retrieves the lightweight history timeline for a user
   */
  public static async getHistoryTimeline(userId: string) {
    const history = await prisma.careerRecommendationHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        algorithmVersion: true,
        knowledgeVersion: true,
        recommendations: true,
      }
    });

    // Format for frontend (we don't send the entire payload over the wire for the timeline)
    return history.map(h => {
      const recs = h.recommendations as unknown as CareerRecommendation[];
      const topCareer = recs[0];
      
      return {
        id: h.id,
        createdAt: h.createdAt,
        version: `v${h.algorithmVersion}`,
        topCareerName: topCareer?.careerName || 'Unknown',
        topCareerScore: topCareer ? Math.round(topCareer.combinedScore || topCareer.finalScore || 0) : 0,
      };
    });
  }

  /**
   * Retrieves a specific full snapshot payload
   */
  public static async getSnapshot(snapshotId: string, userId: string) {
    const snapshot = await prisma.careerRecommendationHistory.findFirst({
      where: { 
        id: snapshotId,
        userId // Security check to ensure they own it
      }
    });

    if (!snapshot) return null;

    return {
      id: snapshot.id,
      createdAt: snapshot.createdAt,
      profile: snapshot.profileSnapshot,
      recommendations: snapshot.recommendations,
    };
  }
}
