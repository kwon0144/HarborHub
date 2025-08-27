import { NextResponse } from 'next/server';
import { db } from '@/lib/database.js';

export async function GET() {
  try {
    // Get resource ratings statistics
    const resourceRatings = await getResourceRatingsStats();
    
    // Get enrollment statistics by month
    const enrollmentTrends = await getEnrollmentTrends();
    
    // Get comments by resource type
    const commentsByType = await getCommentsByType();

    return NextResponse.json({
      success: true,
      data: {
        resourceRatings,
        enrollmentTrends,
        commentsByType
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch statistics' 
      },
      { status: 500 }
    );
  }
}

async function getResourceRatingsStats() {
  try {
    // Get all resources with their ratings
    const meditations = await db.findMany('SELECT id, title FROM meditations');
    const exercises = await db.findMany('SELECT id, title FROM exercises');
    const techniques = await db.findMany('SELECT id, title FROM techniques');
    
    const allResources = [
      ...meditations.map(r => ({ ...r, type: 'meditation' })),
      ...exercises.map(r => ({ ...r, type: 'exercise' })),
      ...techniques.map(r => ({ ...r, type: 'technique' }))
    ];

    // Get ratings for each resource
    const resourceRatings = [];
    for (const resource of allResources) {
      const ratings = await db.findMany(
        'SELECT rating FROM simple_ratings WHERE resource_id = ?',
        [resource.id]
      );
      
      const avgRating = ratings.length > 0 
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
        : '0.00';
      
      resourceRatings.push({
        resourceId: resource.id,
        title: resource.title,
        type: resource.type,
        avgRating: parseFloat(avgRating),
        totalRatings: ratings.length
      });
    }

    return resourceRatings;
  } catch (error) {
    console.error('Error getting resource ratings stats:', error);
    return [];
  }
}

async function getEnrollmentTrends() {
  try {
    // Get enrollments grouped by month
    const enrollments = await db.findMany(`
      SELECT 
        DATE_FORMAT(a.date, '%Y-%m') as month,
        COUNT(e.id) as enrollment_count
      FROM activities a
      LEFT JOIN enrollments e ON a.code = e.activity_code
      WHERE a.date IS NOT NULL
      GROUP BY DATE_FORMAT(a.date, '%Y-%m')
      ORDER BY month ASC
    `);

    return enrollments.map(e => ({
      month: e.month,
      enrollmentCount: e.enrollment_count || 0
    }));
  } catch (error) {
    console.error('Error getting enrollment trends:', error);
    return [];
  }
}



async function getCommentsByType() {
  try {
    // Get all comments with resource information
    const comments = await db.findMany(`
      SELECT sc.comment, sc.resource_id
      FROM simple_comments sc
      ORDER BY sc.id DESC
    `);

    const meditationComments = [];
    const exerciseComments = [];
    const techniqueComments = [];

    for (const comment of comments) {
      // Check which type of resource this comment belongs to
      let resourceType = null;
      
      // Check meditations
      const meditation = await db.findOne('SELECT id FROM meditations WHERE id = ?', [comment.resource_id]);
      if (meditation) {
        meditationComments.push(comment.comment);
        continue;
      }

      // Check exercises
      const exercise = await db.findOne('SELECT id FROM exercises WHERE id = ?', [comment.resource_id]);
      if (exercise) {
        exerciseComments.push(comment.comment);
        continue;
      }

      // Check techniques
      const technique = await db.findOne('SELECT id FROM techniques WHERE id = ?', [comment.resource_id]);
      if (technique) {
        techniqueComments.push(comment.comment);
        continue;
      }
    }

    return {
      meditations: meditationComments,
      exercises: exerciseComments,
      techniques: techniqueComments
    };
  } catch (error) {
    console.error('Error getting comments by type:', error);
    return {
      meditations: [],
      exercises: [],
      techniques: []
    };
  }
}
