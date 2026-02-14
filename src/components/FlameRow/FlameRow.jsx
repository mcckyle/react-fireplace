//Filename: FlameRow.jsx
//Author: Kyle McColgan
//Date: 13 February 2026
//Description: This file contains the FlameRow component for the  Fireplace React project.

import { useMemo } from "react";
import "./FlameRow.css";

export default function FlameRow({ count, intensity, blur = 0, zIndex = 1, phase = 0 }) {
    const flames = useMemo(() =>
    Array.from({ length: count }).map((_, i) => {
        const t = i / (count - 1);
        const center = 1 - Math.abs(t - 0.5) * 2; //0 edges -> 1 center.
        return {
            scale: (0.85 + Math.random() * 0.35 + center * 0.2).toFixed(2),
            drift: `${(Math.random() * 12 - 6).toFixed(1)}px`,
            heat: (0.75 + Math.random() * 0.45 + center * 0.25).toFixed(2),
            flare: Math.random() > 0.8 ? 1 : 0,
            delay: `${(-Math.random() * 3 + phase).toFixed(2)}s`,
        };
      }),
      [count, phase]
    );

    return (
        <div className="flame-row" style={{ '--row-blur': blur, zIndex }}>
        {flames.map((flame, index) => (
            <span
            key={index}
            className="flame"
            style={{
                "--scale": flame.scale,
                "--drift": flame.drift,
                "--heat": flame.heat,
                "--flare": flame.flare,
                "--delay": flame.delay,
                "--intensity": intensity.toFixed(3),
            }}
            />
        ))}
        </div>
    );
}
