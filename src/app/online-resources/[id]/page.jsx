'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import InteractiveStarRating from '../InteractiveStarRating';
import { Snackbar, Alert } from '@mui/material';

export default function ResourceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [resource, setResource] = useState(null);
  const [relatedResources, setRelatedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentRating, setCurrentRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (params.id) {
      fetchResourceData();
      fetchRelatedResources();
    }
  }, [params.id]);

  const fetchResourceData = async () => {
    try {
      const response = await fetch(`/api/resources?id=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setResource(data);
      } else if (response.status === 404) {
        setResource(null); // Resource not found
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching resource:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to load resource. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedResources = async () => {
    try {
      const response = await fetch('/api/resources');
      if (response.ok) {
        const data = await response.json();
        // Get resources of the same type, excluding current resource
        const currentResourceType = getResourceTypeFromId(params.id);
        let related = [];
        
        if (currentResourceType === 'meditation') {
          related = data.meditations?.filter(r => r.id !== params.id) || [];
        } else if (currentResourceType === 'exercise') {
          related = data.exercises?.filter(r => r.id !== params.id) || [];
        } else if (currentResourceType === 'technique') {
          related = data.techniques?.filter(r => r.id !== params.id) || [];
        }
        
        // Limit to 3 related resources
        setRelatedResources(related.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching related resources:', error);
    }
  };

  const getResourceTypeFromId = (id) => {
    if (id.startsWith('meditation')) return 'meditation';
    if (id.startsWith('exercise')) return 'exercise';
    if (id.startsWith('technique')) return 'technique';
    return '';
  };

  const handleRatingChange = async (rating) => {
    if (submittingRating) return;
    
    setSubmittingRating(true);
    setCurrentRating(rating);
    
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          resourceId: params.id
        }),
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Thank you for your feedback!', severity: 'success' });
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        setSnackbar({ 
          open: true, 
          message: 'Thank you for your feedback!',
          severity: 'success' 
        });
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setSnackbar({ open: true, message: 'Thank you for your feedback!', severity: 'success' });
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (submittingComment || !comment.trim()) return;
    
    setSubmittingComment(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: comment,
          resourceId: params.id
        }),
      });

      if (response.ok) {
        setComment('');
        setSnackbar({ open: true, message: 'Thank you for your valuable comment!', severity: 'success' });
      } else {
        setComment('');
        setSnackbar({ open: true, message: 'Thank you for your valuable comment!', severity: 'success' });
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setComment('');
      setSnackbar({ open: true, message: 'Thank you for your valuable comment!', severity: 'success' });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ open: false, message: '', severity: 'success' });
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26435D] mx-auto mb-4"></div>
          <p className="text-[#26435D] text-lg mb-2">Loading resource...</p>
          <p className="text-gray-500 text-sm">This may take a moment if the database is initializing</p>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-[#26435D] text-lg mb-4">Resource not found</p>
          <p className="text-gray-600 text-sm mb-6">The resource you're looking for doesn't exist or there might be a database connection issue.</p>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/online-resources')}
              className="block w-full px-6 py-2 bg-[#26435D] text-white rounded-md hover:bg-[#1e3449] transition-colors"
            >
              Back to Resources
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="block w-full px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Header with Back Button and Title */}
      <div className="heroSpacer bg-[#476384] pt-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/online-resources')}
              className="flex items-center justify-center w-16 h-16 bg-[#476384] text-white hover:bg-[#3a5470] transition-colors cursor-pointer"
            >
              <ChevronLeft size={32} />
            </button>
            <h1 className="text-white text-3xl md:text-4xl font-bold ml-8 flex-1">
              {resource.title}
            </h1>
          </div>
        </div>
      </div>
      
      {/* Video Section */}
      <div className="bg-[#476384] pt-10 pb-20">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="w-full max-w-4xl aspect-video">
            <iframe
              src={resource.src}
              title="YouTube Video Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
      
      {/* Content and Rating Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Content Container */}
          <div className="lg:w-3/5 lg:pl-24">
            <p className="text-gray-700 text-lg leading-relaxed">
              {resource.description}
            </p>
          </div>
          
          {/* Rating Container */}
          <div className="lg:w-2/5 flex justify-center lg:justify-end items-center">
            <div className="border-3 border-[#26435D] p-8 rounded-lg max-w-sm w-full max-h-40 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-bold text-[#26435D] mb-6">
                  How's your experience?
                </h3>
                
                <div className="flex justify-center">
                  <InteractiveStarRating 
                    rating={currentRating}
                    onRatingChange={handleRatingChange}
                    readOnly={submittingRating}
                    size={30}
                  />
                </div>
                
                {submittingRating && (
                  <p className="text-sm text-gray-500 mt-2">Submitting...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comments Section */}
      <div className="container mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold text-[#26435D] mb-4">Comments</h2>
        
        <div className="space-y-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write something here..."
            rows={6}
            className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#5591DC] focus:border-transparent"
          />
          <button
            onClick={handleCommentSubmit}
            disabled={submittingComment || !comment.trim()}
            className="px-6 py-3 bg-[#26435D] text-white font-bold rounded-md hover:bg-[#1e3449] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submittingComment ? 'Submitting...' : 'Submit Comments'}
          </button>
        </div>
      </div>

      {/* Related Resources Section */}
      {relatedResources.length > 0 && (
        <div className="container mx-auto px-4 mb-20">
          <h2 className="text-2xl font-bold text-[#26435D] mb-6">Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedResources.map((relatedResource) => (
              <div 
                key={relatedResource.id}
                className="border-2 border-[#26435D] rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/online-resources/${relatedResource.id}`)}
              >
                <h3 className="text-xl font-bold text-[#26435D] mb-3">
                  {relatedResource.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {relatedResource.brief}
                </p>
                <button className="px-4 py-2 bg-[#26435D] text-white font-medium rounded-md hover:bg-[#1e3449] transition-colors">
                  View Resource
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
