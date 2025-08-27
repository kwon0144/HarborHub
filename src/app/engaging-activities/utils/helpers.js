// Utility functions for activity management

// Chip color mappings
export const getLocationChipColor = (location) => {
  switch (location) {
    case 'CBD': return 'warning';
    case 'Fitzroy': return 'success';
    case 'St Kilda': return 'info';
    default: return 'default';
  }
};

export const getTypeChipColor = (type) => {
  switch (type) {
    case 'workshop': return 'warning';
    case 'talk': return 'success';
    case 'socialising': return 'info';
    case 'just for fun': return 'secondary';
    default: return 'default';
  }
};

// Date formatting
export const formatDate = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  return dateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Activity availability calculations
export const getRemainingAvailability = (activity) => {
  return Math.max(0, activity.availability - activity.numOfEnrollments);
};

export const isActivityFull = (activity) => {
  return getRemainingAvailability(activity) <= 0;
};
