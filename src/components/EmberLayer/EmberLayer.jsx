//Filename: EmberLayer.jsx
//Author: Kyle McColgan
//Date: 8 October 2026
//Description: This file contains the EmberLayer component for the Fireplace React project.

import { useMemo } from "react";
import "./EmberLayer.css";

const EMBER_COUNT = 42;

export default function EmberLayer()
{
    const embers = useMemo(() =>
    {
        return Array.from({ length: EMBER_COUNT }).map((_, index) =>
        {
            const position = index / EMBER_COUNT;
            const center = 1 - Math.abs(position - 0.5) * 2;
            const random = Math.random();
            const energy = 0.58 + random * 0.34 + center * 0.26;
            const depth = 0.54 + Math.random() * 0.46;
            const temperature = 0.72 + energy * 0.44;
            const spread = 34 + center * 58;
            const rareFlare = Math.random() > 0.84;

            return {
                energy: energy.toFixed(3),
                x: `${(50 + (Math.random() - 0.5) * spread).toFixed(2)}%`,
                size: (rareFlare ? 1.8 + energy * 2.8 : 1.0 + energy * 2.2).toFixed(2) + "px",
                rise: `${(120 + energy * 245).toFixed(0)}px`,
                drift: `${(Math.random() * 64 - 32).toFixed(2)}px`,
                sway: `${(Math.random() * 18 - 9).toFixed(2)}px`,
                mass: (0.68 + energy * 0.46).toFixed(2),
                depth: depth.toFixed(2),
                temperature: temperature.toFixed(2),
                cooling: (1.08 - energy * 0.30).toFixed(2),
                glow: rareFlare || Math.random() > 0.80 ? 1 : 0,
                duration: (4.8 + (1.22 - energy) * 5.8 + Math.random() * 2.2).toFixed(2),
                delay: (-Math.random() * 14).toFixed(2),
                turbulence: (0.72 + Math.random() * 1.45).toFixed(2),
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
