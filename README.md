# Hallownest Radio

A minimalist ambient music player inspired by the haunting soundscapes of Hollow Knight and Silksong.

## Features
- Animated atmospheric background (Framer Motion via `motion`)
- Playlist panel with smooth transitions
- Keyboard shortcuts (Space, Arrow keys, M, L)
- Volume and progress sliders
- Responsive and theme-ready styling with Tailwind CSS + custom design tokens
- Radix UI primitives + utility components

## Getting Started

Install dependencies and start the dev server:

```
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Tech Stack
- React + TypeScript
- Vite
- Tailwind CSS
- Radix UI
- class-variance-authority + tailwind-merge
- Lucide Icons
- Motion (Framer Motion-compatible API)

## Project Structure
```
App.tsx          # Root app component
src/main.tsx     # Vite entry
components/      # UI + feature components
styles/globals.css
```

## Planned Improvements
- Actual audio playback & streaming
- Persist volume & last track to localStorage
- Add search & filtering to playlist
- Add theming toggle
- Unit tests

## License
Content and names referencing Hollow Knight and Silksong are for fan project purposes only.
