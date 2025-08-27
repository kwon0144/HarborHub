'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ResourceSection from './ResourceSection';
import Title from '../(components)/Title';

export default function OnlineResourcesPage() {
  const [resources, setResources] = useState({
    meditations: [],
    exercises: [],
    techniques: []
  });
  const [averageScores, setAverageScores] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchResources();
    fetchAverageScores();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources');
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageScores = async () => {
    try {
      const response = await fetch('/api/ratings');
      if (response.ok) {
        const data = await response.json();
        setAverageScores(data);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const navigateToResourceDetail = (resource) => {
    router.push(`/online-resources/${resource.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26435D] mx-auto mb-4"></div>
          <p className="text-[#26435D] text-lg">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mb-10 ">
      <Title  
        title="Online Resources"
        description="Explore our Online Resources for guided meditation, breathing exercises, and stress management techniques to enhance your well-being."
      />
      
      <ResourceSection
        title="Guided Meditations"
        resources={resources.meditations}
        averageScores={averageScores}
        onResourceClick={navigateToResourceDetail}
        imageSrc="/online-resources/meditation.png"
        imageAlt="Meditation Image"
        description="Our Guided Meditations service offers a range of sessions tailored to help you find peace and clarity, from quick 5-minute resets to deeper 15-minute journeys. Each session is designed to reduce anxiety and promote self-love, with easy access and engaging content to support your mindfulness practice."
      />
      
      <ResourceSection
        title="Calming Exercises"
        resources={resources.exercises}
        averageScores={averageScores}
        onResourceClick={navigateToResourceDetail}
        imageSrc="/online-resources/exercise.png"
        imageAlt="Exercises Image"
        description="Our Calming Exercises service offers a variety of practices, including grounding exercises, mindfulness techniques, and relaxing yoga sessions, designed to help reduce anxiety and promote relaxation. These exercises provide a gentle, accessible way to unwind and center yourself, suitable for all ages and perfect for finding peace in everyday moments."
        imagePosition="right"
      />

      <ResourceSection
        title="Stress Management Techniques"
        resources={resources.techniques}
        averageScores={averageScores}
        onResourceClick={navigateToResourceDetail}
        imageSrc="/online-resources/technique.png"
        imageAlt="Techniques Image"
        description="Our Stress Management Techniques service offers practical guides on reducing stress, enhancing emotional maturity, and cultivating self-love. These sections provide strategies to manage life's pressures, develop empathy, and improve personal growth. Perfect for anyone looking to enhance their mental well-being and live a more balanced, fulfilling life."
      />
      
    </div>
  );
}
