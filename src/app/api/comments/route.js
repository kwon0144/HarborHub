import { NextResponse } from 'next/server';
import { db } from '@/lib/database.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resourceId');

    let query = 'SELECT comment FROM simple_comments';
    let params = [];

    if (resourceId) {
      query += ' WHERE resource_id = ?';
      params = [resourceId];
    }

    query += ' ORDER BY id DESC';

    const comments = await db.findMany(query, params);

    return NextResponse.json({
      comments,
      totalComments: comments.length
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { comment, resourceId } = body;
    
    // Validate required fields
    if (!comment || !resourceId) {
      return NextResponse.json(
        { error: 'Missing required fields (comment, resourceId)' },
        { status: 400 }
      );
    }

    // Validate comment length
    if (comment.trim().length < 1) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      );
    }

    if (comment.length > 1000) {
      return NextResponse.json(
        { error: 'Comment too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    // Check if resource exists 
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

    // Create new comment
    const insertId = await db.insert(
      'INSERT INTO simple_comments (comment, resource_id) VALUES (?, ?)',
      [comment.trim(), resourceId]
    );
    
    const result = await db.findOne(
      'SELECT * FROM simple_comments WHERE id = ?',
      [insertId]
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
