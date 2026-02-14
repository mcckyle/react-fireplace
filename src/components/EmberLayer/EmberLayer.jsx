//Filename: EmberLayer.jsx
//Author: Kyle McColgan
//Date: 13 February 2026
//Description: This file contains the EmberLayer component for the  Fireplace React project.

import { useMemo } from "react";
import "./EmberLayer.css";

const EMBER_COUNT = 20;

export default function EmberLayer()
{
    const embers = useMemo(() =>
        Array.from({ length: EMBER_COUNT }).map(() => ({
            x: `${(Math.random() * 100).toFixed(1)}%`,
            delay: `${(Math.random() * 12).toFixed(1)}s`,
            rise: `${(14 + Math.random() * 36).toFixed(1)}px`,
            size: `${(1.5 + Math.random() * 2.5).toFixed(2)}px`,
            drift: `${(Math.random() * 8 - 4).toFixed(1)}px`,
            cluster: Math.random() > 0.78 ? 1.5 : 1,
            sway: (Math.random() * 5 - 2.5).toFixed(1),
            opacity: (0.35 + Math.random() * 0.45).toFixed(2),
            glow: Math.random() > 0.85 ? 1 : 0,
        })),
      []);

    return (
        <div className="embers">
            {embers.map((e, i) => (
                <span
                    key={i}
                    className="ember"
                    style={{
                        "--x": e.x,
                        "--delay": e.delay,
                        "--rise": e.rise,
                        "--size": e.size,
                        "--drift": e.drift,
                        "--cluster": e.cluster,
                        "--sway": e.sway,
                        "--ember-opacity": e.opacity,
                        "--glow": e.glow,
                    }}
                />
            ))}
        </div>
    );
}
