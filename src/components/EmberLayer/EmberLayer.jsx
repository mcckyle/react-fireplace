//Filename: EmberLayer.jsx
//Author: Kyle McColgan
//Date: 19 March 2026
//Description: This file contains the EmberLayer component for the Fireplace React project.

import { useMemo } from "react";
import "./EmberLayer.css";

const EMBER_COUNT = 20;

export default function EmberLayer()
{
    const embers = useMemo(() =>
        Array.from({ length: EMBER_COUNT }).map(() => ({
            x: `${(Math.random() * 100).toFixed(1)}%`,
            delay: `${(Math.random() * 10).toFixed(1)}s`,
            rise: `${(16 + Math.random() * 40).toFixed(1)}px`,
            size: `${(1.4 + Math.random() * 2.4).toFixed(2)}px`,
            drift: `${(Math.random() * 10 - 5).toFixed(2)}px`,
            sway: (Math.random() * 6 - 3).toFixed(2),
            cluster: Math.random() > 0.8 ? 1.6 : 1,
            opacity: (0.4 + Math.random() * 0.4).toFixed(2),
            glow: Math.random() > 0.82 ? 1 : 0,
            depth: (0.8 + Math.random() * 0.6).toFixed(2)
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
                        "--sway": e.sway,
                        "--cluster": e.cluster,
                        "--ember-opacity": e.opacity,
                        "--glow": e.glow,
                        "--depth": e.depth
                    }}
                />
            ))}
        </div>
    );
}
