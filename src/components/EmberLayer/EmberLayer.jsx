//Filename: EmberLayer.jsx
//Author: Kyle McColgan
//Date: 4 August 2026
//Description: This file contains the EmberLayer component for the Fireplace React project.

import { useMemo } from "react";
import "./EmberLayer.css";

const EMBER_COUNT = 34;

export default function EmberLayer()
{
    const embers = useMemo(() =>
    {
        return Array.from({ length: EMBER_COUNT }).map((_, index) =>
        {
            const position = index / EMBER_COUNT;
            const center = 1 - Math.abs(position - 0.5) * 2;
            const temperature = 0.75 + Math.random() * 0.25;
            const energy = 0.65 + Math.random() * 0.35 + center * 0.35;

            return {
                energy: energy.toFixed(3),
                x: `${(50 + (Math.random() - 0.5) * (34 + center * 26)).toFixed(2)}%`,
                size: `${(1.1 + energy * 2.7).toFixed(2)}px`,
                rise: `${(110 + energy * 220).toFixed(0)}px`,
                drift: `${(Math.random() * 50 - 25).toFixed(2)}px`,
                sway: `${(Math.random() * 12 - 6).toFixed(2)}px`,
                mass: (0.70 + energy * 0.50).toFixed(2),
                depth: (0.55 + Math.random() * 0.45).toFixed(2),
                temperature: (0.75 + energy * 0.50).toFixed(2),
                cooling: (1.05 - energy * 0.28).toFixed(2),
                glow: Math.random() > 0.78 ? 1 : 0,
                duration: (4.8 + (1.25 - energy) * 6).toFixed(2),
                delay: (-Math.random() * 12).toFixed(2),
                turbulence: (0.8 + Math.random() * 1.5).toFixed(2),
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
                        "--energy": ember.energy,
                        "--x": ember.x,
                        "--size": ember.size,
                        "--rise": ember.rise,
                        "--drift": ember.drift,
                        "--sway": ember.sway,
                        "--mass": ember.mass,
                        "--depth": ember.depth,
                        "--temperature": ember.temperature,
                        "--cooling": ember.cooling,
                        "--glow": ember.glow,
                        "--duration": `${ember.duration}s`,
                        "--delay": `${ember.delay}s`,
                        "--turbulence": ember.turbulence,
                    }}
                />
            ))}
        </div>
    );
}
