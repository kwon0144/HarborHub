import { NextResponse } from 'next/server';
import { db, initializeTables } from '@/lib/database.js';
import mockData from './mockData.js';


export async function POST() {
  try {
    await initializeTables();
    const { meditations, exercises, techniques, ratings, comments, activities, enrollments } = mockData;
    const createdResources = [];

    // Seed addresses table first
    const addresses = [
      {
        location: 'CBD',
        address_line: '123 Collins Street',
        suburb: 'Melbourne',
        state: 'VIC',
        postcode: '3000'
      },
      {
        location: 'Fitzroy',
        address_line: '456 Brunswick Street',
        suburb: 'Fitzroy',
        state: 'VIC',
        postcode: '3065'
      },
      {
        location: 'St Kilda',
        address_line: '789 Acland Street',
        suburb: 'St Kilda',
        state: 'VIC',
        postcode: '3182'
      }
    ];

    let addressesCreated = 0;
    for (const address of addresses) {
      try {
        const existingAddress = await db.findOne('SELECT * FROM addresses WHERE location = ?', [address.location]);
        if (!existingAddress) {
          await db.query(
            'INSERT INTO addresses (location, address_line, suburb, state, postcode) VALUES (?, ?, ?, ?, ?)',
            [address.location, address.address_line, address.suburb, address.state, address.postcode]
          );
          addressesCreated++;
        }
      } catch (error) {
        console.log('Skipping address:', error.message);
      }
    }

    // Create a mock user for testing ratings
    const mockUser = await db.findOne('SELECT * FROM users WHERE id = ?', ['user1']);
    if (!mockUser) {
      await db.query(
        'INSERT INTO users (id, email, name) VALUES (?, ?, ?)',
        ['user1', 'test@example.com', 'Test User']
      );
      console.log('✅ Mock user created for testing');
    }

    // Create an anonymous user for anonymous ratings/comments
    const anonymousUser = await db.findOne('SELECT * FROM users WHERE id = ?', ['anonymous']);
    if (!anonymousUser) {
      await db.query(
        'INSERT INTO users (id, email, name) VALUES (?, ?, ?)',
        ['anonymous', 'anonymous@example.com', 'Anonymous User']
      );
      console.log('✅ Anonymous user created for anonymous submissions');
    }

    // Seed meditations table
    for (const meditation of meditations) {
      let resource = await db.findOne('SELECT * FROM meditations WHERE id = ?', [meditation.id]);
      if (!resource) {
        await db.query(
          'INSERT INTO meditations (id, title, brief, description, src) VALUES (?, ?, ?, ?, ?)',
          [meditation.id, meditation.title, meditation.brief, meditation.description, meditation.src]
        );
        
        resource = await db.findOne('SELECT * FROM meditations WHERE id = ?', [meditation.id]);
      }
      createdResources.push({ ...resource, type: 'meditation' });
    }

    // Seed exercises table
    for (const exercise of exercises) {
      let resource = await db.findOne('SELECT * FROM exercises WHERE id = ?', [exercise.id]);
      if (!resource) {
        await db.query(
          'INSERT INTO exercises (id, title, brief, description, src) VALUES (?, ?, ?, ?, ?)',
          [exercise.id, exercise.title, exercise.brief, exercise.description, exercise.src]
        );
        
        resource = await db.findOne('SELECT * FROM exercises WHERE id = ?', [exercise.id]);
      }
      createdResources.push({ ...resource, type: 'exercise' });
    }

    // Seed techniques table
    for (const technique of techniques) {
      let resource = await db.findOne('SELECT * FROM techniques WHERE id = ?', [technique.id]);
      if (!resource) {
        await db.query(
          'INSERT INTO techniques (id, title, brief, description, src) VALUES (?, ?, ?, ?, ?)',
          [technique.id, technique.title, technique.brief, technique.description, technique.src]
        );
        
        resource = await db.findOne('SELECT * FROM techniques WHERE id = ?', [technique.id]);
      }
      createdResources.push({ ...resource, type: 'technique' });
    }

    // Seed simple ratings
    let ratingsCreated = 0;
    for (const rating of ratings) {
      try {
        await db.insert(
          'INSERT INTO simple_ratings (rating, resource_id) VALUES (?, ?)',
          [rating.rating, rating.resource_id]
        );
        ratingsCreated++;
      } catch (error) {
        // Skip if rating already exists or resource doesn't exist
        console.log('Skipping rating:', error.message);
      }
    }

    // Seed simple comments
    let commentsCreated = 0;
    for (const comment of comments) {
      try {
        await db.insert(
          'INSERT INTO simple_comments (comment, resource_id) VALUES (?, ?)',
          [comment.comment, comment.resource_id]
        );
        commentsCreated++;
      } catch (error) {
        // Skip if comment already exists or resource doesn't exist
        console.log('Skipping comment:', error.message);
      }
    }

    // Seed activities table
    let activitiesCreated = 0;
    console.log('Activities array:', activities);
    console.log('Activities length:', activities?.length || 0);
    
    if (activities && activities.length > 0) {
      for (const activity of activities) {
        try {
          let existingActivity = await db.findOne('SELECT * FROM activities WHERE code = ?', [activity.code]);
          if (!existingActivity) {
            console.log('Creating activity:', activity.code);
            await db.query(
              'INSERT INTO activities (code, name, date, time, location, type, availability, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [activity.code, activity.name, activity.date, activity.time, activity.location, activity.type, activity.availability, activity.description]
            );
            activitiesCreated++;
          } else {
            console.log('Activity already exists:', activity.code);
          }
        } catch (error) {
          console.error('Error creating activity:', activity.code, error);
        }
      }
    } else {
      console.log('No activities found in mockData');
    }

    // Seed enrollments table
    let enrollmentsCreated = 0;
    console.log('Enrollments array:', enrollments);
    console.log('Enrollments length:', enrollments?.length || 0);
    
    if (enrollments && enrollments.length > 0) {
      for (const enrollment of enrollments) {
        try {
          console.log('Creating enrollment for:', enrollment.activity_code, enrollment.email);
          await db.query(
            'INSERT INTO enrollments (activity_code, first_name, last_name, email, phone_number) VALUES (?, ?, ?, ?, ?)',
            [enrollment.activity_code, enrollment.first_name, enrollment.last_name, enrollment.email, enrollment.phone_number]
          );
          enrollmentsCreated++;
        } catch (error) {
          console.error('Error creating enrollment:', enrollment.email, error);
        }
      }
    } else {
      console.log('No enrollments found in mockData');
    }

    return NextResponse.json({
      message: 'Database seeded successfully!',
      resources: createdResources,
      ratings: ratingsCreated,
      comments: commentsCreated,
      activities: activitiesCreated,
      addresses: addressesCreated,
      enrollments: enrollmentsCreated,
      summary: {
        totalResources: createdResources.length,
        meditations: meditations.length,
        exercises: exercises.length,
        techniques: techniques.length,
        ratingsSeeded: ratingsCreated,
        commentsSeeded: commentsCreated,
        activitiesSeeded: activitiesCreated,
        addressesSeeded: addressesCreated,
        enrollmentsSeeded: enrollmentsCreated
      }
    });

  } catch (error) {
    console.error('Error during seeding:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error.message },
      { status: 500 }
    );
  }
}
