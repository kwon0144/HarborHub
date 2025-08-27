'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ConfirmModal from '../(components)/ConfirmModal';
import Title from '../(components)/Title';

export default function BookingPage() {
  const { authentication, isHydrated } = useAuth();
  
  // Location options
  const locations = [
    { key: "CBD", name: 'CBD Wellness Hub' },
    { key: "Fitzroy", name: 'Fitzroy Mental Health Haven' },
    { key: "St Kilda", name: 'St Kilda Well-Being Retreat' }
  ];
  
  // State management
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  
  const [selectedLocation, setSelectedLocation] = useState(locations.find(loc => loc.key === 'CBD'));
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Error handling
  const [errors, setErrors] = useState({
    location: null,
    datetime: null
  });

  // Date formatting utilities
  const formatTime = (dateTime) => {
    return new Intl.DateTimeFormat('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(dateTime));
  };

  const addOneHour = (dateTime) => {
    const date = new Date(dateTime);
    date.setHours(date.getHours() + 1);
    return date;
  };

  // Get minimum selectable date (tomorrow)
  const getMinSelectableDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Fetch available slots
  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedLocation || !selectedDate) return;
    
    setLoadingSlots(true);
    setSelectedDateTime(null);
    
    try {
      // Call the calendar API to get real availability
      const dateString = selectedDate.toISOString().split('T')[0];
      const [year, month, day] = dateString.split('-');
      const response = await fetch(`/api/calendar/availability?location=${selectedLocation.key}&year=${year}&month=${month}&day=${day}`);
      const result = await response.json();
      
      if (result.success) {
        setAvailableSlots(result.availableSlots || []);
      } else {
        console.error('Error fetching availability:', result.message || result.error);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedLocation, selectedDate]);

  // Handle date change
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  // Handle location change
  const handleLocationChange = (e) => {
    const locationKey = e.target.value;
    const location = locations.find(loc => loc.key === locationKey);
    setSelectedLocation(location);
    validateLocation(false);
  };

  // Validation functions
  const validateLocation = (blur) => {
    if (!blur) {
      setErrors(prev => ({ ...prev, location: null }));
    } else {
      if (!selectedLocation) {
        setErrors(prev => ({ ...prev, location: "* please select a location" }));
      }
    }
  };

  const validateTime = (blur) => {
    if (!blur) {
      setErrors(prev => ({ ...prev, datetime: null }));
    } else {
      if (!selectedDateTime) {
        setErrors(prev => ({ ...prev, datetime: "* please select a time slot" }));
      }
    }
  };

  // Handle booking confirmation
  const confirmBooking = () => {
    validateLocation(true);
    validateTime(true);
    
    if (!errors.datetime && !errors.location && selectedLocation && selectedDateTime) {
      setShowConfirmModal(true);
    }
  };

  const handleTherapyBooking = async (userData, activity) => {
    // Create calendar event
    const calendarData = {
      location: selectedLocation.key,
      eventStartTime: typeof selectedDateTime === 'string' ? selectedDateTime : selectedDateTime.toISOString(),
      summary: `${userData.firstName} ${userData.lastName}'s Therapy Appointment`,
      description: remarks || 'Therapy session booking',
      userEmail: userData.email,
      userName: `${userData.firstName} ${userData.lastName}`
    };

    const calendarResponse = await fetch('/api/calendar/add-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calendarData),
    });

    const calendarResult = await calendarResponse.json();

    if (calendarResult.success) {
      // Reset form after successful booking
      setTimeout(() => {
        setSelectedLocation(null);
        setSelectedDateTime(null);
        setRemarks('');
        setAvailableSlots([]);
        
        // Refresh available slots to reflect the new booking
        if (selectedLocation && selectedDate) {
          fetchAvailableSlots();
        }
      }, 2000);
    } else {
      // Calendar creation failed
      console.error('Calendar event creation failed:', calendarResult);
      
      // Provide detailed error information
      let errorMessage = `Calendar booking failed: ${calendarResult.error}`;
      if (calendarResult.troubleshooting) {
        errorMessage += '\n\nTroubleshooting:';
        Object.entries(calendarResult.troubleshooting).forEach(([key, value]) => {
          errorMessage += `\n- ${key}: ${value}`;
        });
      }
      
      throw new Error(errorMessage);
    }
  };

  // Fetch slots when date or location changes
  useEffect(() => {
    if (selectedLocation && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedLocation, selectedDate, fetchAvailableSlots]);

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Title 
        title="Booking Therapy"
        description="Schedule a meeting with our highly qualified, licensed therapists for personalized mental health advice and guidance."
      />

      {/* Booking Form for Users */}
      {authentication === 'user' ? (
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="bg-[#E0EDF9] p-5 rounded-lg mb-8">
            <p className="text-[#26435D] text-xl font-bold text-center">
              Book a free 60 minutes 1-on-1 meeting with our therapist
            </p>
          </div>

          <div className="grid md:grid-cols-2 flex-wrap pt-8 md:gap-10">
            {/* Left Side - Date and Location Selection */}
            <div className="w-full">
              {/* Date Picker Section */}
              <div className="mb-6">
                <label className="block text-[#26435D] text-lg font-bold mb-2">
                  Select Date:
                </label>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  min={getMinSelectableDate()}
                  onChange={handleDateChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26435D]"
                />
              </div>

              {/* Location Selection */}
              <div className="mb-6">
                <label className="block text-[#26435D] text-lg font-bold mb-2">
                  Select a Location:
                </label>
                <select
                  value={selectedLocation?.key || ''}
                  onChange={handleLocationChange}
                  onBlur={() => validateLocation(true)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26435D]"
                >
                  <option value="">Select a location</option>
                  {locations.map((location) => (
                    <option key={location.key} value={location.key}>
                      {location.name}
                    </option>
                  ))}
                </select>
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>
            </div>

            {/* Right Side - Time Slots */}
            <div className="w-full pb-6">
              <label className="block text-[#26435D] text-lg font-bold mb-4">
                Available Time Slots:
              </label>
              
              {loadingSlots ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#26435D]"></div>
                  <span className="ml-2">Loading...</span>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDateTime(slot.start)}
                      className={`p-3 text-sm border rounded-lg transition-colors ${
                        selectedDateTime === slot.start
                          ? 'bg-[#26435D] text-white border-[#26435D]'
                          : 'bg-white text-[#26435D] border-[#26435D] hover:bg-[#E0EDF9]'
                      }`}
                    >
                      {new Date(slot.start).toLocaleTimeString('en-AU', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No available time slots</p>
              )}
            </div>
          </div> 

          {/* Remarks Section */}
          <div className="mb-8">
            <label className="block text-[#26435D] text-lg font-bold mb-2">
              Remarks (optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={5}
              placeholder="A short description of your situation/need:"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26435D] resize-vertical"
            />
          </div>

          {/* Submit Section */}
          {bookingLoading ? (
            <div className="flex justify-center items-center pt-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#26435D]"></div>
              <span className="text-2xl ml-4">Loading....</span>
            </div>
          ) : (
            <div className="flex justify-center pt-10">
              <button
                onClick={confirmBooking}
                className="bg-[#26435D] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#1e3449] transition-colors"
              >
                Submit Booking
              </button>
            </div>
          )}
        </div>
      ) : (
        // Admin view
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="w-full p-6 border-2 border-gray-300 rounded-lg bg-white">
            <div className="flex justify-between items-center flex-wrap gap-5 mb-8">
              {locations.map((location) => (
                <div key={location.key} className="flex items-center">
                  <input
                    type="radio"
                    id={location.key}
                    name="location"
                    value={location.key}
                    checked={selectedLocation?.key === location.key}
                    onChange={handleLocationChange}
                    onBlur={() => validateLocation(true)}
                    className="w-4 h-4 text-[#26435D] bg-gray-100 border-gray-300 focus:ring-[#26435D] focus:ring-2"
                  />
                  <label htmlFor={location.key} className="ml-2 text-sm font-medium text-gray-900 cursor-pointer">
                    {location.name}
                  </label>
                </div>
              ))}
            </div>

            {/* Calendar Section */}
            {selectedLocation && (
              <div className="mb-8">
                <div className="bg-blue-50 p-4 md:p-8 rounded-lg">
                  <div 
                    className="calendar-container relative w-full pb-[200%] sm:pb-[100%] md:pb-[80%] lg:pb-[60%] overflow-hidden"
                  >
                    {selectedLocation.key === 'CBD' && (
                      <>
                        {/* Mobile view - Weekly */}
                        <iframe
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 0,
                            borderRadius: '8px'
                          }}
                          className="rounded-lg block sm:hidden"
                          title="CBD Google Calendar Schedule - Mobile"
                          src="https://calendar.google.com/calendar/embed?src=2d0f6ff082fb855add7662efe2b7d6ceb79e1b89e21adbff2fa142b03ef300aa%40group.calendar.google.com&ctz=Australia%2FMelbourne&mode=WEEK&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0"
                          frameBorder="0"
                          scrolling="no"
                          loading="lazy"
                        />
                        {/* Desktop/Tablet view - Monthly */}
                        <iframe
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 0,
                            borderRadius: '8px'
                          }}
                          className="rounded-lg hidden sm:block"
                          title="CBD Google Calendar Schedule - Desktop"
                          src="https://calendar.google.com/calendar/embed?src=2d0f6ff082fb855add7662efe2b7d6ceb79e1b89e21adbff2fa142b03ef300aa%40group.calendar.google.com&ctz=Australia%2FMelbourne&mode=MONTH&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0"
                          frameBorder="0"
                          scrolling="no"
                          loading="lazy"
                        />
                      </>
                    )}
                    {selectedLocation.key === 'Fitzroy' && (
                      <>
                        {/* Mobile view - Weekly */}
                        <iframe
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 0,
                            borderRadius: '8px'
                          }}
                          className="rounded-lg block sm:hidden"
                          title="Fitzroy Google Calendar Schedule - Mobile"
                          src="https://calendar.google.com/calendar/embed?src=d21859b5c3916a5b29633a67e34795a1e1547c07dcb8de4754255154862de1cb%40group.calendar.google.com&ctz=Australia%2FMelbourne&mode=WEEK&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0"
                          frameBorder="0"
                          scrolling="no"
                          loading="lazy"
                        />
                        {/* Desktop/Tablet view - Monthly */}
                        <iframe
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 0,
                            borderRadius: '8px'
                          }}
                          className="rounded-lg hidden sm:block"
                          title="Fitzroy Google Calendar Schedule - Desktop"
                          src="https://calendar.google.com/calendar/embed?src=d21859b5c3916a5b29633a67e34795a1e1547c07dcb8de4754255154862de1cb%40group.calendar.google.com&ctz=Australia%2FMelbourne&mode=MONTH&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0"
                          frameBorder="0"
                          scrolling="no"
                          loading="lazy"
                        />
                      </>
                    )}
                    {selectedLocation.key === 'St Kilda' && (
                      <>
                        {/* Mobile view - Weekly */}
                        <iframe
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 0,
                            borderRadius: '8px'
                          }}
                          className="rounded-lg block sm:hidden"
                          title="St Kilda Google Calendar Schedule - Mobile"
                          src="https://calendar.google.com/calendar/embed?src=61ca21ee8888e7e93f7ec9dc374aef54f208b5e67ba9ee58e2d97d1aaa1fc2a8%40group.calendar.google.com&ctz=Australia%2FMelbourne&mode=WEEK&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0"
                          frameBorder="0"
                          scrolling="no"
                          loading="lazy"
                        />
                        {/* Desktop/Tablet view - Monthly */}
                        <iframe
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 0,
                            borderRadius: '8px'
                          }}
                          className="rounded-lg hidden sm:block"
                          title="St Kilda Google Calendar Schedule - Desktop"
                          src="https://calendar.google.com/calendar/embed?src=61ca21ee8888e7e93f7ec9dc374aef54f208b5e67ba9ee58e2d97d1aaa1fc2a8%40group.calendar.google.com&ctz=Australia%2FMelbourne&mode=MONTH&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0"
                          frameBorder="0"
                          scrolling="no"
                          loading="lazy"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedLocation && selectedDateTime && (
        <ConfirmModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          activity={{
            code: 'THERAPY',
            name: 'Therapy Session',
            date: selectedDate.toISOString(),
            time: `${formatTime(selectedDateTime)} - ${formatTime(addOneHour(selectedDateTime))}`,
            location: selectedLocation.name,
            address_line: '',
            suburb: '',
            state: '',
            postcode: ''
          }}
          customHandler={handleTherapyBooking}
          onEnrollmentSuccess={() => setBookingLoading(false)}
          modalTitle="Confirm Therapy Booking"
          submitButtonText="Confirm Booking"
          loadingText="Confirming..."
        />
      )}
    </div>
  );
}
