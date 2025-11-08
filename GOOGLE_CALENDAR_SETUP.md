# Google Calendar Integration Setup

This guide will help you set up Google Calendar API integration for the "Import Availability" feature.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top and select "New Project"
3. Name your project (e.g., "When3Meet Calendar Integration")
4. Click "Create"

### 2. Enable Google Calendar API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in required fields (App name, User support email, Developer contact)
   - Add scopes: `https://www.googleapis.com/auth/calendar.readonly`
   - Add test users if needed
4. For Application type, select "Web application"
5. Add authorized JavaScript origins:
   - `http://localhost` (for local development)
   - `http://localhost:5173` (if using Vite)
   - Add your production domain when deploying
6. Click "Create"
7. Copy the **Client ID** that appears

### 4. Create an API Key

1. Still in "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the **API Key**
4. (Optional but recommended) Click "Restrict Key":
   - Set Application restrictions to "HTTP referrers"
   - Add your domain(s)
   - Set API restrictions to "Google Calendar API"

### 5. Update calendar.html

Open `frontend/calendar.html` and update these lines (around line 297-298):

```javascript
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';
```

Replace with your actual credentials:

```javascript
const GOOGLE_CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'YOUR_ACTUAL_API_KEY';
```

## How It Works

1. **User clicks "Import availability" button** with the Google icon
2. **OAuth consent screen appears** asking for permission to view calendar
3. **User grants access** to read their Google Calendar
4. **App fetches events** within the selected date range
5. **Calendar grid updates** to show busy times (grayed out cells)
6. **User can manually adjust** if needed before saving

## Features

- Fetches events from primary Google Calendar
- Only imports events within the selected date/time range
- Marks busy time slots with gray background
- Shows event title on hover
- Skips all-day events
- User can still manually adjust availability after import

## Troubleshooting

### "400. That's an error. The server cannot process the request because it is malformed."

This is the most common error and usually means your OAuth configuration is incorrect. Here's how to fix it:

**Step-by-step fix:**

1. **Go to Google Cloud Console** → Your Project → "APIs & Services" → "Credentials"

2. **Click on your OAuth 2.0 Client ID** (it will be listed under "OAuth 2.0 Client IDs")

3. **Check "Authorized JavaScript origins"** section:
   - Must include EXACTLY where your app is running
   - For local testing with Vite: `http://localhost:5173`
   - For local testing with other servers: `http://localhost:3000` (or your port)
   - For file protocol: You CANNOT use `file://` - you MUST use a local server
   - **DO NOT include** any paths, just the origin (e.g., NOT `http://localhost:5173/frontend`)

4. **Common mistakes:**
   - ❌ Using `https://localhost` (should be `http://` for local)
   - ❌ Including trailing slashes: `http://localhost:5173/`
   - ❌ Wrong port number
   - ❌ Opening file directly in browser (use a local server instead)

5. **Save changes** and wait 5 minutes for Google to propagate the changes

6. **Clear your browser cache** and try again

**To check what origin you're using:**
- Open your browser's Developer Console (F12)
- Type: `window.location.origin`
- This exact value must be in your "Authorized JavaScript origins"

### OAuth Consent Screen Issues

If you're still getting errors:

1. Go to "APIs & Services" → "OAuth consent screen"
2. Make sure you've added `https://www.googleapis.com/auth/calendar.readonly` to scopes
3. If in testing mode, ensure your Google account is added as a test user
4. Publishing status should show "Testing" or "Published"

### "Failed to authenticate with Google"
- Check that your Client ID is correct (should end with `.apps.googleusercontent.com`)
- Verify the Client ID in calendar.html matches exactly what's in Google Cloud Console
- Clear browser cache and cookies
- Try in an incognito/private window

### "Failed to import calendar availability"
- Ensure Google Calendar API is enabled in your project
- Check that API Key is correct and not restricted incorrectly
- Open browser console to see detailed error messages
- Verify you granted calendar read permission in the OAuth popup

### No events imported
- Verify you have events in your calendar for the selected dates
- Check that events have specific times (not all-day events)
- Ensure events fall within the time range configured for the meeting
- Check browser console for any API errors

### "popup_closed" error

This error appears when the Google sign-in popup is closed before completing authentication. This is normal and happens when:

1. **You close the popup intentionally** - Just click "Import availability" again when ready
2. **Popup blocker is interfering** - Check your browser's address bar for a blocked popup icon
3. **Multiple popups opened** - Only click the button once and wait for the popup

**If you keep getting this error:**
- Allow popups for your site in browser settings
- Try in an incognito/private window
- Check if browser extensions are blocking the popup
- Look for a popup blocker icon in your browser's address bar

### Testing without setting up Google Cloud

If you want to test the rest of the app without Google Calendar:
1. The "Import availability" button won't work without valid credentials
2. You can still manually select availability by clicking and dragging on the grid
3. All other features work independently of Google Calendar integration

## Security Notes

- API keys and Client IDs are public and meant for client-side use
- The OAuth flow ensures users must explicitly grant permission
- Calendar access is read-only
- Consider using environment variables for production deployments

## Testing Locally

1. Start your local server (e.g., `npm run dev` or `python -m http.server`)
2. Open the calendar page
3. Click "Import availability"
4. Sign in with a Google account that has calendar events
5. Grant calendar read permission
6. Verify events appear as busy slots on the grid
