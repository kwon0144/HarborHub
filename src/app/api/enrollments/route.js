import { NextResponse } from 'next/server';
import { db } from '../../../lib/database.js';

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('Invalid JSON in request body:', jsonError);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON format in request body'
      }, { status: 400 });
    }
    
    const { activityCode, firstName, lastName, email, phoneNumber } = body;

    // Validate required fields
    if (!activityCode || !firstName || !lastName || !email || !phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Check if activity exists and get current enrollment count
    const activity = await db.findOne(`
      SELECT 
        a.code, 
        a.name, 
        a.availability,
        COALESCE(e.enrollment_count, 0) as num_of_enrollments
      FROM activities a
      LEFT JOIN (
        SELECT activity_code, COUNT(*) as enrollment_count
        FROM enrollments
        GROUP BY activity_code
      ) e ON a.code = e.activity_code
      WHERE a.code = ?
    `, [activityCode]);

    if (!activity) {
      return NextResponse.json({
        success: false,
        error: 'Activity not found'
      }, { status: 404 });
    }

    // Check if activity is full
    if (activity.num_of_enrollments >= activity.availability) {
      return NextResponse.json({
        success: false,
        error: 'ACTIVITY_FULL',
        message: 'This activity is currently full'
      }, { status: 200 }); // Return 200 for business logic validation
    }

    // Check if user is already enrolled (by email)
    const existingEnrollment = await db.findOne(
      'SELECT id FROM enrollments WHERE activity_code = ? AND email = ?',
      [activityCode, email.toLowerCase()]
    );

    if (existingEnrollment) {
      return NextResponse.json({
        success: false,
        error: 'ALREADY_ENROLLED',
        message: 'You are already enrolled in this activity'
      }, { status: 200 });
    }

    // Create enrollment
    try {
      await db.insert(
        'INSERT INTO enrollments (activity_code, first_name, last_name, email, phone_number) VALUES (?, ?, ?, ?, ?)',
        [activityCode, firstName, lastName, email.toLowerCase(), phoneNumber]
      );

      // Get updated activity data with calculated enrollment count
      const updatedActivity = await db.findOne(`
        SELECT 
          a.code, 
          a.name, 
          a.availability,
          COALESCE(e.enrollment_count, 0) as num_of_enrollments
        FROM activities a
        LEFT JOIN (
          SELECT activity_code, COUNT(*) as enrollment_count
          FROM enrollments
          GROUP BY activity_code
        ) e ON a.code = e.activity_code
        WHERE a.code = ?
      `, [activityCode]);

      return NextResponse.json({
        success: true,
        message: 'Successfully enrolled in activity',
        data: {
          activityCode,
          firstName,
          lastName,
          email: email.toLowerCase(),
          phoneNumber,
          activity: updatedActivity
        }
      });

    } catch (dbError) {
      // Check if it's a duplicate key error
      if (dbError.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({
          success: false,
          error: 'ALREADY_ENROLLED',
          message: 'You are already enrolled in this activity'
        }, { status: 200 }); 
      }
      throw dbError;
    }

  } catch (error) {
    console.error('Enrollment API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const activityCode = searchParams.get('activityCode');
    const email = searchParams.get('email');

    if (activityCode) {
      // Get all enrollments for a specific activity
      const enrollments = await db.findMany(
        `SELECT id, first_name, last_name, email, phone_number 
         FROM enrollments 
         WHERE activity_code = ? 
         ORDER BY id DESC`,
        [activityCode]
      );

      return NextResponse.json({
        success: true,
        data: enrollments
      });

    } else if (email) {
      // Get all enrollments for a specific email
      const enrollments = await db.findMany(
        `SELECT e.id, e.activity_code, e.first_name, e.last_name, e.email, e.phone_number,
                a.name as activity_name, a.date, a.time, a.location, a.type
         FROM enrollments e
         JOIN activities a ON e.activity_code = a.code
         WHERE e.email = ?
         ORDER BY e.id DESC`,
        [email.toLowerCase()]
      );

      return NextResponse.json({
        success: true,
        data: enrollments
      });

    } else {
      // Get all enrollments (admin view)
      const enrollments = await db.findMany(
        `SELECT e.id, e.activity_code, e.first_name, e.last_name, e.email, e.phone_number,
                a.name as activity_name, a.date, a.time, a.location, a.type
         FROM enrollments e
         JOIN activities a ON e.activity_code = a.code
         ORDER BY e.id DESC`
      );

      return NextResponse.json({
        success: true,
        data: enrollments
      });
    }

  } catch (error) {
    console.error('Get enrollments API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
