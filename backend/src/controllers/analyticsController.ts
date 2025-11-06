import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { logError, logInfo } from '../config/logger';

export const getUserAnalytics = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all analytics data in parallel
    const [
      totalJobs,
      totalApplications,
      totalFavorites,
      applicationsByStatus,
      jobsBySource,
      applicationsByMonth,
      recentApplications,
    ] = await Promise.all([
      // Total jobs in database
      prisma.jobListing.count(),
      
      // User's total applications
      prisma.application.count({
        where: { userId },
      }),
      
      // User's total favorites
      prisma.favorite.count({
        where: { userId },
      }),
      
      // Applications grouped by status
      prisma.application.groupBy({
        by: ['status'],
        where: { userId },
        _count: {
          status: true,
        },
      }),
      
      // Jobs grouped by source
      prisma.jobListing.groupBy({
        by: ['source'],
        _count: {
          source: true,
        },
      }),
      
      // Applications by month (last 6 months)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as count
        FROM applications
        WHERE user_id = ${userId}
          AND created_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `,
      
      // Recent applications (last 5)
      prisma.application.findMany({
        where: { userId },
        include: {
          jobListing: {
            select: {
              title: true,
              company: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Transform applicationsByStatus to object
    const statusStats: Record<string, number> = {};
    applicationsByStatus.forEach((item) => {
      statusStats[item.status] = item._count.status;
    });

    // Transform jobsBySource to object
    const sourceStats: Record<string, number> = {};
    jobsBySource.forEach((item) => {
      sourceStats[item.source] = item._count.source;
    });

    // Transform applicationsByMonth
    const monthlyStats = (applicationsByMonth as Array<{ month: Date; count: bigint }>).map((item) => ({
      month: item.month.toISOString().split('T')[0].substring(0, 7), // YYYY-MM
      count: Number(item.count),
    }));

    const analytics = {
      overview: {
        totalJobs,
        totalApplications,
        totalFavorites,
      },
      statusBreakdown: statusStats,
      sourceBreakdown: sourceStats,
      monthlyApplications: monthlyStats,
      recentApplications: recentApplications.map((app) => ({
        id: app.id,
        status: app.status,
        createdAt: app.createdAt,
        jobTitle: app.jobListing.title,
        company: app.jobListing.company,
      })),
    };

    logInfo('Analytics retrieved', { userId: req.userId });
    res.json({ analytics });
  } catch (error) {
    logError('Get analytics error', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to get analytics' });
  }
};

