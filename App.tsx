import { AnimatedBackground } from "./components/AnimatedBackground";
import { MediaPlayer } from "./components/MediaPlayer";

export default function App() {
  return (
    <div className="dark min-h-screen bg-background text-foreground relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          {/* Site Title */}
          <div className="mb-8">
            <h1 className="text-3xl mb-2 bg-gradient-to-r from-orange-400 via-white to-blue-400 bg-clip-text text-transparent">
              Hallownest Radio
            </h1>
            <p className="text-muted-foreground">
              Chill vibes from the depths of Hallownest
            </p>
          </div>
          
          {/* Media Player */}
          <MediaPlayer />
          
          {/* Ambient Text */}
          <div className="mt-8 text-xs text-muted-foreground/60 max-w-md mx-auto">
            <p>Let the haunting melodies guide you through forgotten kingdoms...</p>
          </div>
        </div>
      </div>
      
      {/* Additional atmospheric elements */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-orange-500/5 to-transparent blur-3xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-gradient-to-bl from-blue-500/5 to-transparent blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-gradient-to-r from-white/3 to-transparent blur-2xl" />
    </div>
  );
}