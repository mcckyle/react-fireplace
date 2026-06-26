//Filename: EmberLayer.jsx
//Author: Kyle McColgan
//Date: 26 June 2026
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

            return {
                x: `${(50 + (Math.random() - 0.5) * (34 + center * 26)).toFixed(2)}%`,
                size: `${(1 + Math.random() * 2.4 + center * 1.2).toFixed(2)}px`,
                rise: `${(90 + Math.random() * 220).toFixed(0)}px`,
                drift: `${(Math.random() * 50 - 25).toFixed(2)}px`,
                sway: `${(Math.random() * 12 - 6).toFixed(2)}px`,
                mass: (0.65 + Math.random() * 0.8).toFixed(2),
                depth: (0.6 + Math.random() * 0.5).toFixed(2),
                temperature: temperature.toFixed(2),
                cooling: (0.55 + Math.random() * 0.45).toFixed(2),
                glow: Math.random() > 0.78 ? 1 : 0,
                duration: (5 + Math.random() * 8).toFixed(2),
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
