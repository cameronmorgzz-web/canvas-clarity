# Canvas++ Backend Setup

## Required Secrets

Configure these secrets in your Lovable Cloud backend:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `CANVAS_API_URL` | Your Canvas instance URL (without `/api/v1`) | `https://canvas.university.edu` |
| `CANVAS_API_TOKEN` | Personal access token from Canvas | `1234~abcdef...` |
| `OPENAI_API_KEY` | (Optional) For AI assistant features | `sk-...` |

## How to Get a Canvas Access Token

1. Log into your Canvas instance
2. Go to **Account → Settings**
3. Scroll to **Approved Integrations**
4. Click **+ New Access Token**
5. Enter a purpose (e.g., "Canvas++") and expiration date
6. Click **Generate Token**
7. **Copy the token immediately** - it won't be shown again!

## Troubleshooting

### "Canvas API not configured"
- Ensure `CANVAS_API_URL` and `CANVAS_API_TOKEN` are set in Lovable Cloud secrets
- Verify the URL doesn't include `/api/v1` (just the base domain)

### "Authentication failed"
- Your token may have expired - generate a new one
- Verify the token has appropriate permissions

### "Rate limited"
- Canvas limits API requests - wait for the indicated time
- The app will automatically retry after the backoff period

### Data not loading
- Check the Settings page for connection status
- Try the "Force Refresh" button
- Verify your Canvas account has access to the courses

## API Endpoints

The edge function supports these endpoints:

| Endpoint | Parameters | Description |
|----------|------------|-------------|
| `courses` | - | List all active courses |
| `assignments` | `days` | All assignments within date range |
| `upcoming` | `days` | Assignments grouped by status |
| `announcements` | `days` | Recent announcements |
| `course_assignments` | `courseId` | Assignments for specific course |
| `course_announcements` | `courseId` | Announcements for specific course |
