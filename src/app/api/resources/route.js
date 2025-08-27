import { NextResponse } from 'next/server';
import { db } from '@/lib/database.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // If ID is provided, fetch specific resource
    if (id) {
      let resource = null;
      let resourceType = '';

      // Check meditations first
      resource = await db.findOne('SELECT id, title, brief, description, src FROM meditations WHERE id = ?', [id]);
      if (resource) {
        resourceType = 'MEDITATION';
      }

      // Check exercises if not found
      if (!resource) {
        resource = await db.findOne('SELECT id, title, brief, description, src FROM exercises WHERE id = ?', [id]);
        if (resource) {
          resourceType = 'EXERCISE';
        }
      }

      // Check techniques if not found
      if (!resource) {
        resource = await db.findOne('SELECT id, title, brief, description, src FROM techniques WHERE id = ?', [id]);
        if (resource) {
          resourceType = 'TECHNIQUE';
        }
      }

      if (!resource) {
        return NextResponse.json(
          { error: 'Resource not found' },
          { status: 404 }
        );
      }

      // Add resourceType to the resource object
      resource.resourceType = resourceType;

      // Return clean resource data
      return NextResponse.json(resource);
    }

    // If no ID provided, fetch all resources (original behavior)
    const meditations = await db.findMany(
      'SELECT id, title, brief, description, src FROM meditations'
    );

    const exercises = await db.findMany(
      'SELECT id, title, brief, description, src FROM exercises'
    );

    const techniques = await db.findMany(
      'SELECT id, title, brief, description, src FROM techniques'
    );

    const groupedResources = {
      meditations,
      exercises,
      techniques
    };

    return NextResponse.json(groupedResources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}