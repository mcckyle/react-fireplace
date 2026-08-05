//Filename: FlameRow.jsx
//Author: Kyle McColgan
//Date: 4 August 2026
//Description: This file contains the FlameRow component for the Fireplace React project.

import { useMemo } from "react";
import "./FlameRow.css";

export default function FlameRow({
    count,
    intensity,
    blur = 0,
    zIndex = 1,
    phase = 0
})
{
    const flames = useMemo(() =>
    {
        return Array.from({ length: count }).map((_, i) =>
        {
            const t = i / Math.max(count - 1, 1);
            const center = 1 - Math.abs(t - 0.5) * 2; //0 edges -> 1 center.
            const temperature = 0.75 + Math.random() * 0.22 + center * 0.35;
            const energy = 0.70 + Math.random() * 0.30 + center * 0.35;
            return {
                energy: energy.toFixed(3),
                scale: (0.82 + energy * 0.38).toFixed(3),
                temperature: (0.78 + energy * 0.34).toFixed(3),
                fuel: (0.82 + energy * 0.24).toFixed(3),
                width: (0.82 + energy * 0.26).toFixed(3),
                height: (0.72 + energy * 0.70).toFixed(3),
                sway: ((Math.random() * 18) - 9).toFixed(2),
                lift: (8 + energy * 22).toFixed(2),
                lean: ((Math.random() * 10) - 5).toFixed(2),
                turbulence: (0.85 + energy * 0.55).toFixed(2),
                delay: (-Math.random() * 3 + phase).toFixed(2),
                duration: (1.15 + (1.35 - energy * 0.35)).toFixed(2),
            };
        });
    }, [count, phase]);

    return (
        <div
          className="flame-row"
          style={{
              "--row-blur": blur,
              "--intensity": intensity,
              zIndex
          }}
        >
            {flames.map((flame, index) => (
                <span
                    key={index}
                    className="flame"
                    style={{
                        "--energy": flame.energy,
                        "--scale": flame.scale,
                        "--temperature": flame.temperature,
                        "--fuel": flame.fuel,
                        "--width": flame.width,
                        "--height": flame.height,
                        "--sway": `${flame.sway}px`,
                        "--lift": `${flame.lift}px`,
                        "--lean": `${flame.lean}deg`,
                        "--turbulence": flame.turbulence,
                        "--delay": `${flame.delay}s`,
                        "--duration": `${flame.duration}s`,
                    }}
                />
            ))}
        </div>
    );
}
