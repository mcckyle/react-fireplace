//Filename: EmberLayer.jsx
//Author: Kyle McColgan
//Date: 12 June 2026
//Description: This file contains the EmberLayer component for the Fireplace React project.

import { useMemo } from "react";
import "./EmberLayer.css";

const EMBER_COUNT = 22;

export default function EmberLayer()
{
    const embers = useMemo(() =>
    {
        return Array.from({ length: EMBER_COUNT }).map((_, index) =>
        {
            const centerBias = 1 - Math.abs((index / EMBER_COUNT) - 0.5) * 2;
            const spread = 36 + (1 - centerBias) * 28;
            const largeCluster = Math.random() > 0.93;
            return {
                x: `${(50 + (Math.random() - 0.5) * spread).toFixed(2)}%`,
                size: `${(1.2 + Math.random() * 2.8 + centerBias * 0.8).toFixed(2)}px`,
                rise: `${(80 + Math.random() * 180).toFixed(1)}px`,
                sway: `${(Math.random() * 10 - 5).toFixed(2)}px`,
                drift: `${(Math.random() * 32 - 16).toFixed(2)}px`,
                blur: (0.4 + Math.random() * 1.4).toFixed(2),
                opacity: (0.24 + Math.random() * 0.58).toFixed(2),
                cooling: (0.65 + Math.random() * 0.35).toFixed(2),
                depth: (0.72 + Math.random() * 0.7).toFixed(2),
                cluster: largeCluster ? 1.8 : 1,
                glow: Math.random() > 0.8 ? 1 : 0,
                spark: Math.random() > 0.96 ? 1 : 0,
                duration: (5.8 + Math.random() * 5.4).toFixed(2),
                delay: (-Math.random() * 12).toFixed(2),
                turbulence: (0.8 + Math.random() * 1.6).toFixed(2),
                temperature: (0.7 + Math.random() * 0.4).toFixed(2),
            };
        });
    }, []);

    return (
        <div className="embers">
            {embers.map((ember, index) => (
                <span
                    key={index}
                    className="ember"
                    style={{
                        "--x": ember.x,
                        "--size": ember.size,
                        "--rise": ember.rise,
                        "--sway": ember.sway,
                        "--drift": ember.drift,
                        "--blur": ember.blur,
                        "--ember-opacity": ember.opacity,
                        "--cooling": ember.cooling,
                        "--depth": ember.depth,
                        "--cluster": ember.cluster,
                        "--glow": ember.glow,
                        "--spark": ember.spark,
                        "--duration": `${ember.duration}s`,
                        "--delay": `${ember.delay}s`,
                        "--turbulence": ember.turbulence,
                        "--temperature": ember.temperature,
                    }}
                />
            ))}
        </div>
    );
}
