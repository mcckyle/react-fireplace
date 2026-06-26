//Filename: FlameRow.jsx
//Author: Kyle McColgan
//Date: 26 June 2026
//Description: This file contains the FlameRow component for the  Fireplace React project.

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
            return {
                scale: (0.75 + Math.random() * 0.35 + center * 0.35).toFixed(3),
                temperature: temperature.toFixed(3),
                fuel: (0.75 + Math.random() * 0.45).toFixed(3),
                width: (0.75 + Math.random() * 0.45).toFixed(3),
                height: (0.8 + Math.random() * 0.65).toFixed(3),
                sway: (Math.random() * 20 - 10).toFixed(2),
                lift: (8 + Math.random() * 18).toFixed(2),
                lean: (Math.random() * 10 - 5).toFixed(2),
                turbulence: (0.75 + Math.random() * 0.75).toFixed(2),
                delay: (-Math.random() * 3 + phase).toFixed(2),
                duration: (1.1 + Math.random() * 1.4).toFixed(2),
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
