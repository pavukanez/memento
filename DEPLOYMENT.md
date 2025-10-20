# Memento - Deployment Guide

This guide will help you deploy the Memento long-distance relationship memory game to production.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Vercel account (free tier)
- Supabase account (free tier)

## 1. Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL from Settings > API
3. Go to Settings > API Keys and copy your publishable key (starts with `sb_publishable_`)
4. Copy your secret key (starts with `sb_secret_`) - keep this secure!

### Set up the Database

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `supabase/schema.sql` and run it
3. This will create all necessary tables and policies

### Enable Realtime

1. Go to Database > Replication
2. Enable replication for the following tables:
   - `puzzle_pieces`
   - `room_members`

### Set up Storage

1. Go to Storage in your Supabase dashboard
2. The `puzzle-images` bucket will be created automatically when you run the schema
3. Verify the bucket is public and accessible

## 2. Vercel Deployment

### Prepare Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts to link your project
4. Add all environment variables in the Vercel dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add each variable from your `.env.local` file

### Alternative: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in the project settings
5. Deploy

## 3. Supabase Edge Functions (Optional)

If you want to use Supabase Edge Functions instead of Vercel API routes:

1. Install Supabase CLI: `npm install -g supabase`
2. Run `supabase login`
3. Run `supabase link --project-ref your-project-ref`
4. Deploy the function: `supabase functions deploy upload-to-r2`

## 4. Testing Your Deployment

1. Visit your deployed Vercel URL
2. Sign up for a new account
3. Create a new puzzle room
4. Upload a photo
5. Test the puzzle functionality
6. Share the room link with another user to test collaboration

## 5. Custom Domain (Optional)

1. In Vercel dashboard, go to your project settings
2. Navigate to Domains
3. Add your custom domain
4. Update the `NEXT_PUBLIC_APP_URL` environment variable

## 6. Monitoring and Maintenance

### Supabase Monitoring

- Monitor your database usage in the Supabase dashboard
- Check the Auth logs for any issues
- Monitor Realtime connections
- Check Storage usage and bandwidth

### Vercel Monitoring

- Check function logs in the Vercel dashboard
- Monitor bandwidth and function execution time
- Set up alerts for errors

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your Supabase project allows your domain
2. **Upload Failures**: Check Supabase Storage bucket permissions and policies
3. **Realtime Not Working**: Ensure Realtime is enabled for the correct tables
4. **Authentication Issues**: Verify Supabase keys and URL

### Debug Mode

To enable debug mode, add this to your environment variables:
```env
NEXT_PUBLIC_DEBUG=true
```

## Cost Optimization

### Free Tier Limits

- **Vercel**: 100GB bandwidth, 100 serverless function executions
- **Supabase**: 500MB database, 1GB storage, 50,000 monthly active users

### Tips for Staying Free

1. Optimize image sizes before upload
2. Use appropriate puzzle difficulty levels
3. Clean up old rooms periodically
4. Monitor usage regularly

## Security Considerations

1. Never commit environment variables to Git
2. Use Row Level Security (RLS) policies in Supabase
3. Validate file uploads on the server side
4. Implement rate limiting for uploads
5. Keep your secret key secure - never expose it in client-side code
6. Use Supabase Storage policies to control access
7. Regularly rotate your secret key for enhanced security

## Support

If you encounter issues:

1. Check the browser console for errors
2. Review Vercel function logs
3. Check Supabase logs
4. Verify all environment variables are set correctly

For additional help, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
