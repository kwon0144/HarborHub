import { NextResponse } from 'next/server';
import { db } from '@/lib/database.js';

export async function GET() {
  try {
    const activities = await db.findMany(`
      SELECT 
        a.id,
        a.code,
        a.name,
        a.date,
        a.time,
        a.location,
        a.type,
        a.availability,
        a.description,
        COALESCE(e.enrollment_count, 0) as numOfEnrollments,
        addr.address_line,
        addr.suburb,
        addr.state,
        addr.postcode,
        addr.country
      FROM activities a
      LEFT JOIN addresses addr ON a.location = addr.location
      LEFT JOIN (
        SELECT activity_code, COUNT(*) as enrollment_count
        FROM enrollments
        GROUP BY activity_code
      ) e ON a.code = e.activity_code
      ORDER BY a.date ASC, a.time ASC
    `);

    const activitiesWithDates = activities.map(activity => ({
      ...activity,
      date: new Date(activity.date)
    }));

    return NextResponse.json({
      success: true,
      data: activitiesWithDates,
      count: activities.length
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch activities', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      code, 
      name, 
      date, 
      time, 
      location, 
      type, 
      availability, 
      description 
    } = body;

    // Validate required fields
    if (!code || !name || !date || !time || !location || !type || availability === undefined) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          required: ['code', 'name', 'date', 'time', 'location', 'type', 'availability']
        },
        { status: 400 }
      );
    }

    // Check if activity code already exists
    const existingActivity = await db.findOne('SELECT * FROM activities WHERE code = ?', [code]);
    if (existingActivity) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Activity code already exists' 
        },
        { status: 409 }
      );
    }

    // Insert new activity
    const activityId = await db.insert(
      'INSERT INTO activities (code, name, date, time, location, type, availability, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [code, name, date, time, location, type, availability, description || '']
    );

    // Fetch the created activity with enrollment count
    const newActivity = await db.findOne(`
      SELECT 
        a.*,
        COALESCE(e.enrollment_count, 0) as numOfEnrollments
      FROM activities a
      LEFT JOIN (
        SELECT activity_code, COUNT(*) as enrollment_count
        FROM enrollments
        GROUP BY activity_code
      ) e ON a.code = e.activity_code
      WHERE a.id = ?
    `, [activityId]);

    return NextResponse.json({
      success: true,
      data: {
        ...newActivity,
        date: new Date(newActivity.date)
      },
      message: 'Activity created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create activity', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { 
      id,
      code, 
      name, 
      date, 
      time, 
      location, 
      type, 
      availability, 
      description,
      numOfEnrollments 
    } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Activity ID is required for updates'
        },
        { status: 400 }
      );
    }

    // Check if activity exists
    const existingActivity = await db.findOne('SELECT * FROM activities WHERE id = ?', [id]);
    if (!existingActivity) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Activity not found' 
        },
        { status: 404 }
      );
    }

    // Update activity
    await db.update(
      `UPDATE activities SET 
        code = COALESCE(?, code),
        name = COALESCE(?, name),
        date = COALESCE(?, date),
        time = COALESCE(?, time),
        location = COALESCE(?, location),
        type = COALESCE(?, type),
        availability = COALESCE(?, availability),
        description = COALESCE(?, description),
        num_of_enrollments = COALESCE(?, num_of_enrollments)
      WHERE id = ?`,
      [code, name, date, time, location, type, availability, description, numOfEnrollments, id]
    );

    // Fetch the updated activity
    const updatedActivity = await db.findOne('SELECT * FROM activities WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      data: {
        ...updatedActivity,
        date: new Date(updatedActivity.date),
        numOfEnrollments: updatedActivity.num_of_enrollments
      },
      message: 'Activity updated successfully'
    });

  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update activity', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Activity ID is required for deletion'
        },
        { status: 400 }
      );
    }

    // Check if activity exists
    const existingActivity = await db.findOne('SELECT * FROM activities WHERE id = ?', [id]);
    if (!existingActivity) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Activity not found' 
        },
        { status: 404 }
      );
    }

    // Delete activity
    await db.delete('DELETE FROM activities WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Activity deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete activity', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
