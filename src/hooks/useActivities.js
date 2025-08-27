'use client';

import { useState, useEffect } from 'react';

// API functions for activities
const fetchActivities = async () => {
  try {
    const response = await fetch('/api/activities');
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to fetch activities');
    }
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

const createActivity = async (activityData) => {
  try {
    const response = await fetch('/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData),
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to create activity');
    }
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
};

export const useActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addloading, setAddloading] = useState(false);

  // Load activities from database on hook initialization
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        const activitiesData = await fetchActivities();
        setActivities(activitiesData);
      } catch (error) {
        console.error('Failed to load activities:', error);
        // You could set an error state here or show a notification
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  const addActivity = async (activityData) => {
    setAddloading(true);
    try {
      // Generate new activity code
      const newActivityCode = `ACT${(activities.length + 1).toString().padStart(3, '0')}`;
      
      const newActivityDataWithCode = {
        code: newActivityCode,
        ...activityData
      };
      
      const createdActivity = await createActivity(newActivityDataWithCode);
      
      // Add to local state only if it doesn't already exist
      setActivities(prev => {
        // Check if activity already exists (by id or code)
        const exists = prev.some(activity => 
          activity.id === createdActivity.id || 
          activity.code === createdActivity.code
        );
        
        if (exists) {
          console.warn('Activity already exists in state, skipping duplicate');
          return prev;
        }
        
        return [...prev, createdActivity];
      });
      
      alert('New activity added successfully');
      return true;
    } catch (error) {
      console.error("Error adding activity:", error);
      alert(`Failed to add activity: ${error.message}`);
      return false;
    } finally {
      setAddloading(false);
    }
  };

  const updateActivityEnrollment = async (activityCode) => {
    // Refresh activities data to get updated enrollment counts
    try {
      const activitiesData = await fetchActivities();
      setActivities(activitiesData);
    } catch (error) {
      console.error('Failed to refresh activities:', error);
    }
  };

  return {
    activities,
    loading,
    addloading,
    addActivity,
    updateActivityEnrollment
  };
};
