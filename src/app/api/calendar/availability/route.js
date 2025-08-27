import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import moment from 'moment-timezone';

// OAuth2 setup
const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

oAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

// Calendar ID mapping
const getCalendarId = (location) => {
    const calendarIds = {
        'CBD': process.env.GOOGLE_CALENDAR_ID_CBD,
        'Fitzroy': process.env.GOOGLE_CALENDAR_ID_FITZROY,
        'St Kilda': process.env.GOOGLE_CALENDAR_ID_ST_KILDA
    };
    
    return calendarIds[location] || calendarIds['St Kilda'];
};

// Generate time slots for a given date
const generateTimeSlots = (dateString) => {
    const timeZone = 'Australia/Melbourne';
    const slots = [];
    let startOfDay = moment.tz(dateString, timeZone).set({ hour: 9, minute: 0, second: 0, millisecond: 0 });
    
    for (let i = 0; i < 8; i++) { // 8 slots from 9 AM to 5 PM
        const endOfSlot = startOfDay.clone().add(1, 'hour'); 
        slots.push({
            start: startOfDay.format('YYYY-MM-DDTHH:mm:ssZ'), 
            end: endOfSlot.format('YYYY-MM-DDTHH:mm:ssZ')   
        });
        startOfDay = endOfSlot;
    }
    return slots;
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const location = searchParams.get('location');
        const year = searchParams.get('year');
        const month = searchParams.get('month');
        const day = searchParams.get('day');

        // Validate required parameters
        if (!location || !year || !month || !day) {
            return NextResponse.json(
                { success: false, message: "Missing required parameters: location, year, month, day" },
                { status: 400 }
            );
        }

        const calendarId = getCalendarId(location);
        
        // Create date strings
        const eventDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00+10:00`;
        const searchStartTime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T09:00:00+10:00`;
        const searchEndTime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T17:00:00+10:00`;

        console.log('Checking availability for:', {
            location,
            calendarId,
            date: eventDate,
            searchStart: searchStartTime,
            searchEnd: searchEndTime
        });

        // Get existing events for the day
        const eventsResponse = await calendar.events.list({
            calendarId: calendarId,
            timeMin: new Date(searchStartTime),
            timeMax: new Date(searchEndTime),
            singleEvents: true,
            orderBy: 'startTime',
        });

        console.log('Found', eventsResponse.data.items?.length || 0, 'existing events');

        // Generate time slots
        const timeSlots = generateTimeSlots(eventDate);
        console.log('Generated', timeSlots.length, 'time slots');

        // Map existing events to busy slots
        const busySlots = (eventsResponse.data.items || []).map(event => ({
            start: event.start.dateTime,
            end: event.end.dateTime
        }));

        console.log('Busy slots:', busySlots);

        // Check which slots are available
        const availableSlots = timeSlots.map(slot => {
            const isSlotBusy = busySlots.some(busySlot => {
                console.log("Checking slot:", slot.start, slot.end);
                console.log("Against busy slot:", busySlot.start, busySlot.end);
                return slot.start === busySlot.start && slot.end === busySlot.end;
            });
            
            return {
                start: slot.start,
                end: slot.end,
                available: !isSlotBusy,
            };
        });

        // Filter to only available slots
        const availableTimeslots = availableSlots.filter(slot => slot.available);
        
        console.log('Available slots:', availableTimeslots.length);

        return NextResponse.json({
            success: true,
            availableSlots: availableTimeslots,
            allSlots: availableSlots, // Include all slots with availability status
            busySlots: busySlots
        });

    } catch (error) {
        console.error('Error fetching calendar availability:', error);
        
        // Handle Google API errors
        if (error.code === 401) {
            return NextResponse.json(
                { success: false, message: "Google Calendar authentication failed" },
                { status: 401 }
            );
        }
        
        if (error.code === 403) {
            return NextResponse.json(
                { success: false, message: "Insufficient permissions for Google Calendar" },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { 
                success: false, 
                message: "Failed to get availability",
                error: error.message 
            },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const { location, year, month, day } = data;

        // Validate required fields
        if (!location || !year || !month || !day) {
            return NextResponse.json(
                { success: false, message: "Missing required fields: location, year, month, day" },
                { status: 400 }
            );
        }

        const calendarId = getCalendarId(location);
        
        // Create date strings
        const eventDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00+10:00`;
        const searchStartTime = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T09:00:00+10:00`;
        const searchEndTime = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T17:00:00+10:00`;

        console.log('Checking availability for (POST):', {
            location,
            calendarId,
            date: eventDate,
            searchStart: searchStartTime,
            searchEnd: searchEndTime
        });

        // Get existing events for the day
        const eventsResponse = await calendar.events.list({
            calendarId: calendarId,
            timeMin: new Date(searchStartTime),
            timeMax: new Date(searchEndTime),
            singleEvents: true,
            orderBy: 'startTime',
        });

        console.log('Found', eventsResponse.data.items?.length || 0, 'existing events');

        // Generate time slots
        const timeSlots = generateTimeSlots(eventDate);
        console.log('Generated', timeSlots.length, 'time slots');

        // Map existing events to busy slots
        const busySlots = (eventsResponse.data.items || []).map(event => ({
            start: event.start.dateTime,
            end: event.end.dateTime
        }));

        console.log('Busy slots:', busySlots);

        // Check which slots are available
        const availableSlots = timeSlots.map(slot => {
            const isSlotBusy = busySlots.some(busySlot => {
                console.log("Checking slot:", slot.start, slot.end);
                console.log("Against busy slot:", busySlot.start, busySlot.end);
                return slot.start === busySlot.start && slot.end === busySlot.end;
            });
            
            return {
                start: slot.start,
                end: slot.end,
                available: !isSlotBusy,
            };
        });

        // Filter to only available slots
        const availableTimeslots = availableSlots.filter(slot => slot.available);
        
        console.log('Available slots:', availableTimeslots.length);

        return NextResponse.json({
            success: true,
            availableSlots: availableTimeslots,
            allSlots: availableSlots, // Include all slots with availability status
            busySlots: busySlots
        });

    } catch (error) {
        console.error('Error fetching calendar availability:', error);
        
        // Handle Google API errors
        if (error.code === 401) {
            return NextResponse.json(
                { success: false, message: "Google Calendar authentication failed" },
                { status: 401 }
            );
        }
        
        if (error.code === 403) {
            return NextResponse.json(
                { success: false, message: "Insufficient permissions for Google Calendar" },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { 
                success: false, 
                message: "Failed to get availability",
                error: error.message 
            },
            { status: 500 }
        );
    }
}
