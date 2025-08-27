import { NextResponse } from 'next/server';
import { db } from '@/lib/database.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resourceId');

    let query = 'SELECT r.id, r.rating, r.resource_id FROM simple_ratings r';
    let params = [];

    if (resourceId) {
      query += ' WHERE r.resource_id = ?';
      params = [resourceId];
    }

    query += ' ORDER BY r.id DESC';

    const ratings = await db.findMany(query, params);

    if (resourceId) {
      let averageRating = 0;
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
        averageRating = (sum / ratings.length).toFixed(1);
      }

      return NextResponse.json({
        ratings,
        averageRating: parseFloat(averageRating),
        totalRatings: ratings.length
      });
    } else {
      const resourceRatings = {};
      for (const rating of ratings) {
        const resourceKey = rating.resource_id;
        if (!resourceRatings[resourceKey]) {
          resourceRatings[resourceKey] = {
            resourceId: rating.resource_id,
            totalRating: 0,
            count: 0,
            ratings: []
          };
        }
        resourceRatings[resourceKey].totalRating += rating.rating;
        resourceRatings[resourceKey].count += 1;
        resourceRatings[resourceKey].ratings.push({
          id: rating.id,
          rating: rating.rating
        });
      }

      Object.keys(resourceRatings).forEach(resourceKey => {
        resourceRatings[resourceKey].averageRating = 
          resourceRatings[resourceKey].count > 0 
            ? (resourceRatings[resourceKey].totalRating / resourceRatings[resourceKey].count).toFixed(1)
            : '0.0';
      });

      return NextResponse.json(resourceRatings);
    }
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { rating, resourceId } = body;
    
    // Validate required fields
    if (!rating || !resourceId) {
      return NextResponse.json(
        { error: 'Missing required fields (rating, resourceId)' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if resource exists (check all tables since we don't know the type)
    let resourceExists = false;
    
    // Check meditations table
    const meditation = await db.findOne('SELECT id FROM meditations WHERE id = ?', [resourceId]);
    if (meditation) {
      resourceExists = true;
    }
    
    // Check exercises table if not found in meditations
    if (!resourceExists) {
      const exercise = await db.findOne('SELECT id FROM exercises WHERE id = ?', [resourceId]);
      if (exercise) {
        resourceExists = true;
      }
    }
    
    // Check techniques table if not found in exercises
    if (!resourceExists) {
      const technique = await db.findOne('SELECT id FROM techniques WHERE id = ?', [resourceId]);
      if (technique) {
        resourceExists = true;
      }
    }
    
    if (!resourceExists) {
      console.log('Resource not found:', resourceId);
      return NextResponse.json(
        { error: 'Resource not found. Please make sure the database is seeded with resource data.' },
        { status: 404 }
      );
    }

    // Create new rating (no user tracking, allow multiple submissions)
    const insertId = await db.insert(
      'INSERT INTO simple_ratings (rating, resource_id) VALUES (?, ?)',
      [rating, resourceId]
    );
    
    const result = await db.findOne(
      'SELECT * FROM simple_ratings WHERE id = ?',
      [insertId]
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating rating:', error);
    return NextResponse.json(
      { error: 'Failed to create/update rating' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ratingId = searchParams.get('id');

    if (!ratingId) {
      return NextResponse.json(
        { error: 'Missing rating ID' },
        { status: 400 }
      );
    }

    // Check if rating exists
    const rating = await db.findOne(
      'SELECT * FROM simple_ratings WHERE id = ?',
      [ratingId]
    );

    if (!rating) {
      return NextResponse.json(
        { error: 'Rating not found' },
        { status: 404 }
      );
    }

    // Delete the rating
    await db.delete('DELETE FROM simple_ratings WHERE id = ?', [ratingId]);

    return NextResponse.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Error deleting rating:', error);
    return NextResponse.json(
      { error: 'Failed to delete rating' },
      { status: 500 }
    );
  }
}
