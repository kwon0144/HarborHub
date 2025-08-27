import { NextResponse } from 'next/server';
import { google } from 'googleapis';

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

export async function POST(request) {
    try {
        const data = await request.json();
        const { location, eventStartTime, summary, description } = data;

        // Validate required fields
        if (!location || !eventStartTime || !summary) {
            return NextResponse.json(
                { success: false, message: "Missing required fields: location, eventStartTime, summary" },
                { status: 400 }
            );
        }

        const calendarId = getCalendarId(location);
        
        // Create end time (1 hour after start time)
        const eventEndTime = new Date(eventStartTime);
        eventEndTime.setHours(eventEndTime.getHours() + 1);

        const event = {
            summary: summary,
            description: description || '',
            start: {
                dateTime: eventStartTime,
                timeZone: 'Australia/Melbourne'
            },
            end: {
                dateTime: eventEndTime.toISOString(),
                timeZone: 'Australia/Melbourne'
            },
            colorId: 2,
        };

        console.log('Checking availability for:', {
            location,
            calendarId,
            startTime: eventStartTime,
            endTime: eventEndTime.toISOString()
        });

        // Check if time slot is available using freebusy query
        const freebusyResponse = await calendar.freebusy.query({
            resource: {
                timeMin: eventStartTime,
                timeMax: eventEndTime.toISOString(),
                timeZone: 'Australia/Melbourne',
                items: [{ id: calendarId }],
            }
        });

        const eventsArr = freebusyResponse.data.calendars[calendarId].busy;

        if (eventsArr.length === 0) {
            // Time slot is available, create the event
            const insertResponse = await calendar.events.insert({
                calendarId: calendarId,
                resource: event
            });
            
            return NextResponse.json({
                success: true,
                message: "Successfully added event to calendar",
                event: {
                    id: insertResponse.data.id,
                    htmlLink: insertResponse.data.htmlLink,
                    startTime: insertResponse.data.start.dateTime,
                    endTime: insertResponse.data.end.dateTime,
                    summary: insertResponse.data.summary,
                    location: location
                }
            });
        } else {
            return NextResponse.json({
                success: false,
                message: "Failed to add event to calendar - time slot not available"
            }, { status: 409 });
        }

    } catch (error) {
        console.error('Error adding event to calendar:', error);
        
        // Handle specific Google API errors
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
                message: "Failed to add event to calendar",
                error: error.message 
            },
            { status: 500 }
        );
    }
}
