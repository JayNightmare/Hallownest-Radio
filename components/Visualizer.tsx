import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface VisualizerProps {
    isPlaying: boolean;
    volume: number;
}

export function Visualizer({ isPlaying, volume }: VisualizerProps) {
    const [bars, setBars] = useState<number[]>([]);

    const barCount = 32;

    useEffect(() => {
        // Initialize bars with random heights
        setBars(
            Array.from({ length: barCount }, () => Math.random() * 0.6 + 0.2)
        );
    }, []);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isPlaying) {
            interval = setInterval(() => {
                setBars((prevBars) =>
                    prevBars.map(() => {
                        // Create more dynamic movement with some bars staying low, others spiking
                        const rand = Math.random();
                        if (rand < 0.1) {
                            // Occasional high spike
                            return (Math.random() * 0.8 + 0.2) * (volume / 100);
                        } else if (rand < 0.3) {
                            // Medium height
                            return (Math.random() * 0.5 + 0.3) * (volume / 100);
                        } else {
                            // Low baseline
                            return (Math.random() * 0.3 + 0.1) * (volume / 100);
                        }
                    })
                );
            }, 120); // Update frequency for smooth animation
        } else {
            // Fade to baseline when paused
            interval = setInterval(() => {
                setBars((prevBars) =>
                    prevBars.map((bar) => Math.max(0.05, bar * 0.95))
                );
            }, 50);
        }

        return () => clearInterval(interval);
    }, [isPlaying, volume]);

    return (
        <div className="flex items-end justify-center gap-1 h-16 px-4">
            {bars.map((height, index) => (
                <motion.div
                    key={index}
                    className="bg-gradient-to-t from-orange-400/80 via-white/60 to-blue-400/80 rounded-sm"
                    style={{
                        width: "3px",
                        height: `${height * 100}%`,
                        minHeight: "2px",
                    }}
                    animate={{
                        height: `${height * 100}%`,
                        opacity: isPlaying ? 0.8 : 0.3,
                    }}
                    transition={{
                        duration: 0.1,
                        ease: "easeOut",
                    }}
                />
            ))}
        </div>
    );
}
