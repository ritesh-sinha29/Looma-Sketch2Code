# Environment Setup for AI Team Member

## Google Gemini API Key

### Step 1: Get Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key

### Step 2: Local Development Setup

Create a `.env.local` file in the project root:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_api_key_here
```

This file is already in `.gitignore` and will not be committed.

### Step 3: Production Deployment (Convex)

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project: `looma-sketch_collaborate_deploy`
3. Navigate to **Settings** → **Environment Variables**
4. Add new variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your API key
5. Save changes

### Step 4: Deploy Schema Changes

Run the following command to deploy the new AI schema:

```bash
npx convex deploy
```

This will:

- Deploy the new `ai_config` and `ai_analytics` tables
- Deploy all AI functions
- Set up the daily cron job for counter resets

### Step 5: Start Development Server

```bash
npm run dev
```

### Step 6: Test AI Functionality

1. Navigate to a project's group chat
2. Click the **AI toggle** button in the header
3. Send a test message: "How does this work?"
4. Wait 3-5 seconds for AI response
5. Verify the AI message appears with blue background and AI badge

## Cost Estimates

Based on Gemini 2.0 Flash pricing:

- **Conservative** (5 responses/day): ~$1/month
- **Moderate** (15 responses/day): ~$3-5/month
- **Active** (30 responses/day): ~$8-12/month

Rate limits are in place to control costs automatically.

## Troubleshooting

**AI not responding?**

- Check if AI is enabled (toggle should show "AI On")
- Verify API key is set in Convex Dashboard
- Check browser console for errors
- Verify you're asking a question or technical issue

**Rate limit errors?**

- Wait 5 minutes between responses
- Check daily limit hasn't been reached
- Adjust frequency setting if needed

**Deployment issues?**

- Run `npx convex deploy --help` for options
- Check Convex Dashboard logs for errors
- Verify schema changes were applied

## API Key Security

> [!WARNING]
> Never commit your API key to version control!

- Keep `.env.local` in `.gitignore`
- Use Convex environment variables for production
- Rotate your API key periodically
- Monitor usage in Google AI Studio
