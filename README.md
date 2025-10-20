# Memento - Long Distance Memory Game

A collaborative jigsaw puzzle game designed for long-distance relationships. Upload photos, create puzzles, and solve them together in real-time!

## Features

- 🔐 **Authentication**: Email/password and magic link authentication via Supabase
- 📸 **Photo Upload**: Upload photos to Cloudflare R2 storage
- 🧩 **Jigsaw Puzzles**: Generate puzzles with different difficulty levels (Easy: 3×4, Medium: 4×6, Hard: 6×8)
- 🔄 **Real-time Collaboration**: Multiple users can solve puzzles together with live synchronization
- 📱 **Mobile-Friendly**: Responsive design that works on all devices
- 🏠 **Room Management**: Create multiple puzzle rooms and switch between them
- 💾 **Progress Persistence**: Puzzle progress is saved and can be continued later

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Storage**: Cloudflare R2 for photo storage
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Cloudflare account
- Vercel account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd memento
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`:
   - Supabase project URL and keys
   - Cloudflare R2 credentials
   - App URL

5. Set up the database:
   - Create a new Supabase project
   - Run the SQL from `supabase/schema.sql` in your Supabase SQL editor

6. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app!

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

```
memento/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Auth callback
│   ├── room/              # Puzzle room pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── puzzle/            # Puzzle game components
│   ├── providers/         # Context providers
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   ├── supabase.ts        # Supabase client
│   ├── r2.ts              # Cloudflare R2 client
│   ├── puzzle.ts          # Puzzle logic
│   └── utils.ts           # Utility functions
├── supabase/              # Supabase configuration
│   ├── schema.sql         # Database schema
│   └── functions/         # Edge functions
└── public/                # Static assets
```

## How It Works

1. **User Authentication**: Users sign up/login using Supabase Auth
2. **Room Creation**: Users upload photos which become puzzle rooms
3. **Puzzle Generation**: The app generates jigsaw puzzles based on difficulty
4. **Real-time Collaboration**: Multiple users can join rooms and solve puzzles together
5. **Progress Sync**: All puzzle piece movements are synchronized in real-time via Supabase Realtime

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please open an issue on GitHub or refer to the deployment guide.
