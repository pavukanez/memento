# Memento - Deployment Guide

This guide will help you deploy the Memento long-distance relationship memory game to production.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Vercel account (free tier)
- Supabase account (free tier)
- Cloudflare account (free tier)

## 1. Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from Settings > API
3. Go to Settings > Database and note down your service role key

### Set up the Database

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `supabase/schema.sql` and run it
3. This will create all necessary tables and policies

### Enable Realtime

1. Go to Database > Replication
2. Enable replication for the following tables:
   - `puzzle_pieces`
   - `room_members`

## 2. Cloudflare R2 Setup

### Create an R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to R2 Object Storage
3. Create a new bucket (e.g., `memento-photos`)
4. Go to Settings > R2 API tokens
5. Create a new API token with R2 permissions
6. Note down:
   - Account ID
   - Access Key ID
   - Secret Access Key
   - Bucket name

### Set up Public Access

1. In your R2 bucket settings, go to Settings > Public access
2. Enable public access
3. Note down the public URL (e.g., `https://pub-xxxxx.r2.dev`)

## 3. Vercel Deployment

### Prepare Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
R2_PUBLIC_URL=your_r2_public_url

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

## 4. Supabase Edge Functions (Optional)

If you want to use Supabase Edge Functions instead of Vercel API routes:

1. Install Supabase CLI: `npm install -g supabase`
2. Run `supabase login`
3. Run `supabase link --project-ref your-project-ref`
4. Deploy the function: `supabase functions deploy upload-to-r2`

## 5. Testing Your Deployment

1. Visit your deployed Vercel URL
2. Sign up for a new account
3. Create a new puzzle room
4. Upload a photo
5. Test the puzzle functionality
6. Share the room link with another user to test collaboration

## 6. Custom Domain (Optional)

1. In Vercel dashboard, go to your project settings
2. Navigate to Domains
3. Add your custom domain
4. Update the `NEXT_PUBLIC_APP_URL` environment variable

## 7. Monitoring and Maintenance

### Supabase Monitoring

- Monitor your database usage in the Supabase dashboard
- Check the Auth logs for any issues
- Monitor Realtime connections

### Vercel Monitoring

- Check function logs in the Vercel dashboard
- Monitor bandwidth and function execution time
- Set up alerts for errors

### Cloudflare R2 Monitoring

- Monitor storage usage in Cloudflare dashboard
- Check bandwidth usage
- Set up alerts for unusual activity

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your Supabase project allows your domain
2. **Upload Failures**: Check R2 credentials and bucket permissions
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
- **Supabase**: 500MB database, 50,000 monthly active users
- **Cloudflare R2**: 10GB storage, 1M requests

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
5. Regularly rotate API keys

## Support

If you encounter issues:

1. Check the browser console for errors
2. Review Vercel function logs
3. Check Supabase logs
4. Verify all environment variables are set correctly

For additional help, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
