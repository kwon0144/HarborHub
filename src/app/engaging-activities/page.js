'use client';

import { useState } from 'react';
import Title from '../(components)/Title';
import ActivityForm from './ActivityForm';
import ActivityTable from './ActivityTable';
import ConfirmModal from '../(components)/ConfirmModal';
import { useAuth } from '../../hooks/useAuth';
import { useActivities } from '../../hooks/useActivities';

export default function EngagingActivities() {
  const { authentication } = useAuth();
  const { activities, loading, addloading, addActivity, updateActivityEnrollment } = useActivities();
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const openEnrollmentModal = (activity) => {
    setSelectedActivity(activity);
    setEnrollmentModalOpen(true);
  };

  const closeEnrollmentModal = () => {
    setEnrollmentModalOpen(false);
    setSelectedActivity(null);
  };

  const handleEnrollmentSuccess = (activity) => {
    updateActivityEnrollment(activity.code);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <Title
        title="Engaging Activities"
        description={authentication !== 'admin' ? 
          "Discover our range of engaging activities, including workshops, talks, and social events, designed to support mental well-being and foster a sense of community." : 
          ""
        }
      />
      
      {/* Admin Section - Add New Activity */}
      {authentication === 'admin' && (
        <ActivityForm     
          onAddActivity={addActivity}
          loading={addloading}
        />
      )}
      
      {/* Activities List */}
      <ActivityTable
        activities={activities}
        loading={loading}
        authentication={authentication}
        onEnrollmentClick={openEnrollmentModal}
      />
      

      {/* Enrollment Modal */}
      <ConfirmModal
        open={enrollmentModalOpen}
        onClose={closeEnrollmentModal}
        activity={selectedActivity}
        onEnrollmentSuccess={handleEnrollmentSuccess}
      />
    </div>
  );
}
