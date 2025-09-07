import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    List,
    Shuffle,
    Repeat,
} from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Visualizer } from "./Visualizer";
import { PlaylistView } from "./PlaylistView";

interface Track {
    id: number;
    title: string;
    artist: string;
    game: "Hollow Knight" | "Silksong";
    src: string; // audio source url
    durationSeconds?: number; // real duration (filled after metadata load)
}

// TypeScript helper for Vite's import.meta.glob if not present in tsconfig types
// (Avoid adding a global.d.ts file for now; lightweight inline augmentation.)
declare global {
    // eslint-disable-next-line no-var
    var __vite_glob_types: boolean; // dummy to allow block
    interface ImportMeta {
        glob: (
            pattern: string,
            opts?: { eager?: boolean }
        ) => Record<string, any>;
    }
}

// Dynamically import all mp3 files under /sounds (recursive)
// Vite will transform these into URLs at build time.
const audioModules = import.meta.glob("../sounds/**/*.mp3", {
    eager: true,
}) as Record<string, { default: string } | string>;

function deriveTitle(filePath: string): string {
    const file = filePath.split("/").pop() || filePath;
    const clean = file.replace(/\.mp3$/i, "").replace(/^\d+\s+/, "");
    return clean;
}

function classifyGame(filePath: string): "Hollow Knight" | "Silksong" {
    if (/silksong/i.test(filePath)) return "Silksong";
    return "Hollow Knight";
}

function formatTime(seconds: number): string {
    if (!isFinite(seconds)) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${s}`;
}

export function MediaPlayer() {
    const [playlist, setPlaylist] = useState<Track[]>([]);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [volume, setVolume] = useState(75);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [shuffleOrder, setShuffleOrder] = useState<number[]>([]);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Build playlist once from discovered modules
    const discoveredTracks: Track[] = useMemo(() => {
        const entries = Object.entries(audioModules)
            // ensure stable order by filename natural sort
            .sort((a, b) =>
                a[0].localeCompare(b[0], undefined, {
                    numeric: true,
                    sensitivity: "base",
                })
            )
            .map(([path, mod], idx) => {
                const url = typeof mod === "string" ? mod : mod.default;
                return {
                    id: idx,
                    title: deriveTitle(path),
                    artist: "Christopher Larkin",
                    game: classifyGame(path),
                    src: url,
                } as Track;
            });
        return entries;
    }, []);

    // Initialize playlist (only once)
    useEffect(() => {
        setPlaylist(discoveredTracks);
    }, [discoveredTracks]);

    // Shuffle order logic
    useEffect(() => {
        if (isShuffle && playlist.length > 0) {
            // Generate a shuffled order, but keep current track at front
            const indices = playlist.map((_, i) => i);
            // Remove currentTrack from indices
            const rest = indices.filter((i) => i !== currentTrack);
            // Shuffle rest
            for (let i = rest.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [rest[i], rest[j]] = [rest[j], rest[i]];
            }
            setShuffleOrder([currentTrack, ...rest]);
        } else {
            setShuffleOrder([]);
        }
    }, [isShuffle, playlist, currentTrack]);

    const track = playlist[currentTrack];

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Prevent default behavior when focus is on input elements
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            switch (event.code) {
                case "Space":
                    event.preventDefault();
                    togglePlay();
                    break;
                case "ArrowLeft":
                    event.preventDefault();
                    prevTrack();
                    break;
                case "ArrowRight":
                    event.preventDefault();
                    nextTrack();
                    break;
                case "ArrowUp":
                    event.preventDefault();
                    setVolume((prev) => Math.min(100, prev + 5));
                    if (isMuted) setIsMuted(false);
                    break;
                case "ArrowDown":
                    event.preventDefault();
                    setVolume((prev) => Math.max(0, prev - 5));
                    break;
                case "KeyM":
                    event.preventDefault();
                    toggleMute();
                    break;
                case "KeyL":
                    event.preventDefault();
                    setShowPlaylist((prev) => !prev);
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPlaying, isMuted]);

    // Load & play track whenever currentTrack changes
    useEffect(() => {
        if (!track) return;
        let audio = audioRef.current;
        if (!audio) {
            audio = new Audio();
            audioRef.current = audio;
        }
        audio.src = track.src;
        audio.currentTime = 0;
        setCurrentTime(0);
        setProgressPercent(0);

        const handleTime = () => {
            if (!audio) return;
            const ct = audio.currentTime;
            setCurrentTime(ct);
            const dur = audio.duration || 0;
            if (dur) setProgressPercent((ct / dur) * 100);
        };
        const handleEnded = () => nextTrack();
        const handleLoaded = () => {
            // store duration in playlist state lazily
            setPlaylist((prev) =>
                prev.map((t) =>
                    t.id === track.id
                        ? { ...t, durationSeconds: audio!.duration }
                        : t
                )
            );
            if (isPlaying) audio!.play().catch(() => {});
        };

        audio.addEventListener("timeupdate", handleTime);
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("loadedmetadata", handleLoaded);

        // Apply volume
        audio.volume = isMuted ? 0 : volume / 100;
        if (isPlaying) {
            audio.play().catch(() => {});
        }

        return () => {
            audio?.pause();
            audio?.removeEventListener("timeupdate", handleTime);
            audio?.removeEventListener("ended", handleEnded);
            audio?.removeEventListener("loadedmetadata", handleLoaded);
        };
    }, [currentTrack, track?.src]);

    // Sync play/pause
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.play().catch(() => {});
        } else {
            audio.pause();
        }
    }, [isPlaying]);

    // Sync volume & mute
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = isMuted ? 0 : volume / 100;
    }, [volume, isMuted]);

    const togglePlay = () => {
        if (!track) return;
        setIsPlaying((p) => !p);
    };

    const nextTrack = () => {
        if (playlist.length === 0) return;
        if (isShuffle && shuffleOrder.length > 0) {
            const idx = shuffleOrder.indexOf(currentTrack);
            if (idx < shuffleOrder.length - 1) {
                setCurrentTrack(shuffleOrder[idx + 1]);
            } else if (isRepeat) {
                setCurrentTrack(shuffleOrder[0]);
            }
        } else {
            setCurrentTrack((prev) => {
                if (prev < playlist.length - 1) return prev + 1;
                return isRepeat ? 0 : prev;
            });
        }
    };

    const prevTrack = () => {
        if (playlist.length === 0) return;
        if (isShuffle && shuffleOrder.length > 0) {
            const idx = shuffleOrder.indexOf(currentTrack);
            if (idx > 0) {
                setCurrentTrack(shuffleOrder[idx - 1]);
            } else if (isRepeat) {
                setCurrentTrack(shuffleOrder[shuffleOrder.length - 1]);
            }
        } else {
            setCurrentTrack((prev) => {
                if (prev > 0) return prev - 1;
                return isRepeat ? playlist.length - 1 : prev;
            });
        }
    };

    const toggleMute = () => setIsMuted(!isMuted);

    const handleProgressChange = (value: number[]) => {
        const audio = audioRef.current;
        if (!audio) return;
        const newProgress = value[0];
        if (audio.duration) {
            const newTime = (newProgress / 100) * audio.duration;
            audio.currentTime = newTime;
            setCurrentTime(newTime);
            setProgressPercent(newProgress);
        }
    };

    const handleTrackSelect = (index: number) => {
        setCurrentTrack(index);
        setShowPlaylist(false);
        // If shuffle is enabled, regenerate shuffle order with new currentTrack
        if (isShuffle) {
            // This will trigger the shuffleOrder effect
        }
    };

    const formattedTrackDuration = (track: Track | null) => {
        if (!track) return "--:--";
        if (track.durationSeconds) return formatTime(track.durationSeconds);
        return "--:--";
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
            >
                {/* Playlist Toggle Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPlaylist(true)}
                    className="absolute top-4 right-4 hover:bg-accent/50"
                >
                    <List className="w-4 h-4" />
                </Button>

                {/* Album Art Placeholder */}
                <Button
                    variant={"ghost"}
                    onClick={togglePlay}
                    className="w-48 h-48 mx-auto mb-6 rounded-xl bg-gradient-to-br from-orange-900/30 to-blue-900/30 flex flex-col items-center justify-center border border-border/30 overflow-hidden"
                >
                    <div className="text-4xl opacity-40 mb-2">🎵</div>
                    <Visualizer
                        isPlaying={isPlaying}
                        volume={isMuted ? 0 : volume}
                    />
                </Button>

                {/* Track Info */}
                <div className="text-center mb-6">
                    {track ? (
                        <>
                            <h2
                                className="text-xl mb-1 text-foreground truncate"
                                title={track.title}
                            >
                                {track.title}
                            </h2>
                            <p className="text-muted-foreground text-sm mb-1">
                                {track.artist}
                            </p>
                            <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                    track.game === "Hollow Knight"
                                        ? "bg-orange-900/30 text-orange-200"
                                        : "bg-blue-900/30 text-blue-200"
                                }`}
                            >
                                {track.game}
                            </span>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Loading playlist…
                        </p>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <Slider
                        value={[progressPercent]}
                        onValueChange={handleProgressChange}
                        max={100}
                        step={1}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formattedTrackDuration(track)}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mb-6">
                    {/* Repeat */}
                    <Button
                        variant={isRepeat ? "secondary" : "outline"}
                        size="sm"
                        className={`hover:bg-accent/50 ${
                            isRepeat ? "border-primary text-primary" : ""
                        }`}
                        onClick={() => setIsRepeat((r) => !r)}
                        aria-pressed={isRepeat}
                        title="Repeat"
                    >
                        <Repeat className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={prevTrack}
                        className="hover:bg-accent/50"
                    >
                        <SkipBack className="w-5 h-5" />
                    </Button>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            onClick={togglePlay}
                            className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90"
                        >
                            {isPlaying ? (
                                <Pause className="w-6 h-6" />
                            ) : (
                                <Play className="w-6 h-6 ml-0.5" />
                            )}
                        </Button>
                    </motion.div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={nextTrack}
                        className="hover:bg-accent/50"
                    >
                        <SkipForward className="w-5 h-5" />
                    </Button>

                    {/* Shuffle */}
                    <Button
                        variant={isShuffle ? "secondary" : "outline"}
                        size="sm"
                        className={`hover:bg-accent/50 ${
                            isShuffle
                                ? "border-primary text-primary"
                                : "text-primary"
                        }`}
                        onClick={() => setIsShuffle((s) => !s)}
                        aria-pressed={isShuffle}
                        title={isShuffle ? "Disable Shuffle" : "Enable Shuffle"}
                    >
                        <Shuffle className="w-5 h-5" />
                    </Button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMute}
                        className="hover:bg-accent/50"
                    >
                        {isMuted || volume === 0 ? (
                            <VolumeX className="w-4 h-4" />
                        ) : (
                            <Volume2 className="w-4 h-4" />
                        )}
                    </Button>
                    <Slider
                        value={[isMuted ? 0 : volume]}
                        onValueChange={(value) => {
                            setVolume(value[0]);
                            if (value[0] > 0) setIsMuted(false);
                        }}
                        max={100}
                        step={1}
                        className="flex-1"
                    />
                </div>

                {/* Keyboard Shortcuts Hint */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-muted-foreground/60">
                        Press{" "}
                        <kbd className="px-1 py-0.5 bg-muted/50 rounded text-xs">
                            Space
                        </kbd>{" "}
                        to play/pause,{" "}
                        <kbd className="px-1 py-0.5 bg-muted/50 rounded text-xs">
                            ←→
                        </kbd>{" "}
                        to skip,{" "}
                        <kbd className="px-1 py-0.5 bg-muted/50 rounded text-xs">
                            L
                        </kbd>{" "}
                        for playlist
                    </p>
                </div>
            </motion.div>

            <PlaylistView
                playlist={
                    playlist.map((t) => ({
                        ...t,
                        // Provide a string duration for UI if loaded
                        duration: t.durationSeconds
                            ? formatTime(t.durationSeconds)
                            : "",
                    })) as any
                }
                currentTrack={currentTrack}
                isOpen={showPlaylist}
                onClose={() => setShowPlaylist(false)}
                onTrackSelect={handleTrackSelect}
            />
        </>
    );
}
