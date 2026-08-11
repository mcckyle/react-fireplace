//Filename: EmberLayer.jsx
//Author: Kyle McColgan
//Date: 11 August 2026
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
            const random = Math.random();
            const energy = 0.62 + random * 0.30 + center * 0.28;
            const depth = 0.58 + Math.random() * 0.42;
            const temperature = 0.76 + energy * 0.42;
            const spread = 28 + center * 48;

            return {
                energy: energy.toFixed(3),
                x: `${(50 + (Math.random() - 0.5) * spread).toFixed(2)}%`,
                size: `${(1.1 + energy * 2.4).toFixed(2)}px`,
                rise: `${(105 + energy * 210).toFixed(0)}px`,
                drift: `${(Math.random() * 52 - 26).toFixed(2)}px`,
                sway: `${(Math.random() * 14 - 7).toFixed(2)}px`,
                mass: (0.72 + energy * 0.42).toFixed(2),
                depth: depth.toFixed(2),
                temperature: temperature.toFixed(2),
                cooling: (1.08 - energy * 0.30).toFixed(2),
                glow: Math.random() > 0.80 ? 1 : 0,
                duration: (4.6 + (1.22 - energy) * 5.8 + Math.random() * 1.8).toFixed(2),
                delay: (-Math.random() * 12).toFixed(2),
                turbulence: (0.78 + Math.random() * 1.35).toFixed(2),
            };
        });
    }, []);

    return (
        <div className="embers" aria-hidden="true">
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
