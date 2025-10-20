# Memento - Long Distance Memory Game

A collaborative jigsaw puzzle game designed for long-distance relationships. Upload photos, create puzzles, and solve them together in real-time!

## Features

- 🔐 **Authentication**: Email/password and magic link authentication via Supabase
- 📸 **Photo Upload**: Upload photos to Supabase Storage
- 🧩 **Jigsaw Puzzles**: Generate puzzles with different difficulty levels (Easy: 3×4, Medium: 4×6, Hard: 6×8)
- 🔄 **Real-time Collaboration**: Multiple users can solve puzzles together with live synchronization
- 📱 **Mobile-Friendly**: Responsive design that works on all devices
- 🏠 **Room Management**: Create multiple puzzle rooms and switch between them
- 💾 **Progress Persistence**: Puzzle progress is saved and can be continued later

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Storage**: Supabase Storage for photo storage
- **Styling**: Tailwind CSS
- **Deployment**: Vercel