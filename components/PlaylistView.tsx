import { motion, AnimatePresence } from "motion/react";
import { Music, X } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface Track {
    id: number;
    title: string;
    artist: string;
    duration?: string; // may be '--:--' placeholder
    game: "Hollow Knight" | "Silksong";
}

interface PlaylistViewProps {
    playlist: Track[];
    currentTrack: number;
    isOpen: boolean;
    onClose: () => void;
    onTrackSelect: (index: number) => void;
}

export function PlaylistView({
    playlist,
    currentTrack,
    isOpen,
    onClose,
    onTrackSelect,
}: PlaylistViewProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Playlist Panel */}
                    <motion.div
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                        }}
                        className="fixed right-0 top-0 h-full w-80 bg-card/95 backdrop-blur-xl border-l border-border/50 z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border/30">
                            <div className="flex items-center gap-2">
                                <Music className="w-5 h-5 text-primary" />
                                <h2 className="text-lg">Playlist</h2>
                            </div>
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Playlist Items */}
                        <ScrollArea className="flex-1 px-2 overflow-y-auto">
                            <div className="space-y-1 pt-4 h-full min-h-0">
                                {playlist.map((track, index) => (
                                    <motion.button
                                        key={track.id}
                                        onClick={() => onTrackSelect(index)}
                                        className={`w-full p-3 rounded-lg text-left transition-all hover:bg-accent/50 ${
                                            index === currentTrack
                                                ? "bg-primary/20 border border-primary/30"
                                                : "hover:bg-accent/30"
                                        }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h3
                                                    className={`text-sm truncate ${
                                                        index === currentTrack
                                                            ? "text-primary"
                                                            : "text-foreground"
                                                    }`}
                                                >
                                                    {track.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {track.artist}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span
                                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                                            track.game ===
                                                            "Hollow Knight"
                                                                ? "bg-orange-900/30 text-orange-200"
                                                                : "bg-blue-900/30 text-blue-200"
                                                        }`}
                                                    >
                                                        {track.game}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground ml-2">
                                                {track.duration}
                                            </span>
                                        </div>

                                        {index === currentTrack && (
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                className="h-0.5 bg-primary rounded-full mt-2"
                                            />
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Footer */}
                        <div className="p-4 border-t border-border/30 text-center">
                            <p className="text-xs text-muted-foreground">
                                {playlist.length} tracks • Hallownest Radio
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
