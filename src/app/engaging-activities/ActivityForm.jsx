'use client';

import { useState } from 'react';

const ActivityForm = ({ onAddActivity, loading = false }) => {
  const [newActivityDate, setNewActivityDate] = useState(new Date());
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityStartTime, setNewActivityStartTime] = useState('');
  const [newActivityEndTime, setNewActivityEndTime] = useState('');
  const [newActivityLocation, setNewActivityLocation] = useState('');
  const [newActivityType, setNewActivityType] = useState('');
  const [newActivityAvailability, setNewActivityAvailability] = useState(0);
  const [newActivityDescription, setNewActivityDescription] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({
    activityName: null,
    activityStartTime: null,
    activityEndTime: null,
    activityAvailability: null,
    activityLocation: null,
    activityType: null,
    activityDescription: null
  });

  // Import constants
  const locations = ['CBD', 'Fitzroy', 'St Kilda'];
  const types = ['workshop', 'talk', 'socialising', 'just for fun'];
  const times = [];

  // Generate time options
  for (let time = 8 * 60; time <= 22 * 60; time += 30) {
    let hours = Math.floor(time / 60);
    let minutes = time % 60;
    times.push(`${hours}:${minutes === 0 ? '00' : '30'}`);
  }

  const minSelectableDate = new Date();
  minSelectableDate.setDate(minSelectableDate.getDate() + 1);

  // Validation functions
  const validateActivityName = (blur) => {
    if (!newActivityName || newActivityName.length < 5) {
      if (blur) {
        setErrors(prev => ({
          ...prev,
          activityName: "* activity name need to be at least 5 characters"
        }));
      }
    } else {
      setErrors(prev => ({ ...prev, activityName: null }));
    }
  };

  const validateActivityStartTime = (blur) => {
    if (!newActivityStartTime) {
      if (blur) {
        setErrors(prev => ({
          ...prev,
          activityStartTime: "* please select start time"
        }));
      }
    } else {
      setErrors(prev => ({ ...prev, activityStartTime: null }));
    }
  };

  const validateActivityEndTime = (blur) => {
    validateActivityStartTime(true);
    if (!errors.activityStartTime) {
      if (!newActivityEndTime) {
        if (blur) {
          setErrors(prev => ({
            ...prev,
            activityEndTime: "* please select end time"
          }));
        }
      } else {
        const startIndex = times.indexOf(newActivityStartTime);
        const endIndex = times.indexOf(newActivityEndTime);
        if (endIndex <= startIndex) {
          setErrors(prev => ({
            ...prev,
            activityEndTime: "* end time must be later than start time."
          }));
        } else {
          setErrors(prev => ({ ...prev, activityEndTime: null }));
        }
      }
    }
  };

  const validateActivityAvailability = (blur) => {
    if (!newActivityAvailability || newActivityAvailability === 0) {
      if (blur) {
        setErrors(prev => ({
          ...prev,
          activityAvailability: "* availability cannot be 0"
        }));
      }
    } else {
      setErrors(prev => ({ ...prev, activityAvailability: null }));
    }
  };

  const validateActivityLocation = (blur) => {
    if (!newActivityLocation) {
      if (blur) {
        setErrors(prev => ({
          ...prev,
          activityLocation: "* please select a location"
        }));
      }
    } else {
      setErrors(prev => ({ ...prev, activityLocation: null }));
    }
  };

  const validateActivityType = (blur) => {
    if (!newActivityType) {
      if (blur) {
        setErrors(prev => ({
          ...prev,
          activityType: "* please select an activity type"
        }));
      }
    } else {
      setErrors(prev => ({ ...prev, activityType: null }));
    }
  };

  const validateActivityDescription = (blur) => {
    if (!newActivityDescription || newActivityDescription.length < 10) {
      if (blur) {
        setErrors(prev => ({
          ...prev,
          activityDescription: "* description need to be at least 10 characters"
        }));
      }
    } else {
      setErrors(prev => ({ ...prev, activityDescription: null }));
    }
  };

  const handleSubmit = async () => {
    // Validate all fields
    validateActivityName(true);
    validateActivityStartTime(true);
    validateActivityEndTime(true);
    validateActivityAvailability(true);
    validateActivityLocation(true);
    validateActivityType(true);
    validateActivityDescription(true);

    // Check if there are any errors
    const hasErrors = Object.values(errors).some(error => error !== null);
    if (hasErrors) {
      return;
    }

    // Format date for database (YYYY-MM-DD)
    const formattedDate = newActivityDate.toISOString().split('T')[0];

    const activityData = {
      name: newActivityName,
      date: formattedDate,
      time: `${newActivityStartTime} - ${newActivityEndTime}`,
      location: newActivityLocation,
      type: newActivityType,
      availability: newActivityAvailability,
      description: newActivityDescription
    };

    const success = await onAddActivity(activityData);
    
    if (success) {
      // Reset form
      setNewActivityName('');
      setNewActivityStartTime('');
      setNewActivityEndTime('');
      setNewActivityLocation('');
      setNewActivityType('');
      setNewActivityAvailability(0);
      setNewActivityDescription('');
      setNewActivityDate(new Date());
      setErrors({
        activityName: null,
        activityStartTime: null,
        activityEndTime: null,
        activityAvailability: null,
        activityLocation: null,
        activityType: null,
        activityDescription: null
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <div className="w-4/5 bg-blue-50 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-blue-900">Add New Activity</h2>
        </div>
      </div>
      
      <div className="flex justify-center">
        {/* Activity Form */}
        <div className="w-full md:w-3/5 space-y-8">
          {/* Activity Name */}
          <div>
            <label className="block text-xl font-medium mb-2">Activity Name:</label>
            <input
              type="text"
              value={newActivityName}
              onChange={(e) => setNewActivityName(e.target.value)}
              onBlur={() => validateActivityName(true)}
              onInput={() => validateActivityName(false)}
              placeholder="Activity Name"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            {errors.activityName && (
              <div className="text-red-500 text-sm mt-1">{errors.activityName}</div>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xl font-medium mb-2">Date:</label>
            <input
              type="date"
              value={newActivityDate.toISOString().split('T')[0]}
              onChange={(e) => setNewActivityDate(new Date(e.target.value))}
              min={minSelectableDate.toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          
          {/* Time and Availability */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xl font-medium mb-2">Start Time:</label>
              <select
                value={newActivityStartTime}
                onChange={(e) => setNewActivityStartTime(e.target.value)}
                onBlur={() => validateActivityStartTime(true)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">From</option>
                {times.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              {errors.activityStartTime && (
                <div className="text-red-500 text-sm mt-1">{errors.activityStartTime}</div>
              )}
            </div>
            
            <div>
              <label className="block text-xl font-medium mb-2">End Time:</label>
              <select
                value={newActivityEndTime}
                onChange={(e) => setNewActivityEndTime(e.target.value)}
                onBlur={() => validateActivityEndTime(true)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">To</option>
                {times.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              {errors.activityEndTime && (
                <div className="text-red-500 text-sm mt-1">{errors.activityEndTime}</div>
              )}
            </div>
            
            <div>
              <label className="block text-xl font-medium mb-2">Availability:</label>
              <input
                type="number"
                value={newActivityAvailability}
                onChange={(e) => setNewActivityAvailability(parseInt(e.target.value) || 0)}
                onBlur={() => validateActivityAvailability(true)}
                min="0"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              {errors.activityAvailability && (
                <div className="text-red-500 text-sm mt-1">{errors.activityAvailability}</div>
              )}
            </div>
          </div>
          
          {/* Location and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xl font-medium mb-2">Location:</label>
              <select
                value={newActivityLocation}
                onChange={(e) => setNewActivityLocation(e.target.value)}
                onBlur={() => validateActivityLocation(true)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">Select a Location</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              {errors.activityLocation && (
                <div className="text-red-500 text-sm mt-1">{errors.activityLocation}</div>
              )}
            </div>
            
            <div>
              <label className="block text-xl font-medium mb-2">Type:</label>
              <select
                value={newActivityType}
                onChange={(e) => setNewActivityType(e.target.value)}
                onBlur={() => validateActivityType(true)}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">Select a Type</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.activityType && (
                <div className="text-red-500 text-sm mt-1">{errors.activityType}</div>
              )}
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-xl font-medium mb-2">Description:</label>
            <textarea
              value={newActivityDescription}
              onChange={(e) => setNewActivityDescription(e.target.value)}
              onBlur={() => validateActivityDescription(true)}
              onInput={() => validateActivityDescription(false)}
              placeholder="A short description of activity content"
              rows="5"
              className="w-full p-3 border border-gray-300 rounded-md resize-none"
            />
            {errors.activityDescription && (
              <div className="text-red-500 text-sm mt-1">{errors.activityDescription}</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Button */}
      <div className="flex justify-center mt-8">
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-2xl">Loading....</span>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Add Activity
          </button>
        )}
      </div>
      
      <div className="h-16"></div>
    </div>
  );
};

export default ActivityForm;
