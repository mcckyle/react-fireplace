//Filename: FlameRow.jsx
//Author: Kyle McColgan
//Date: 9 May 2026
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
            const centerWeight = 1 - Math.abs(t - 0.5) * 2; //0 edges -> 1 center.
            const heat = 0.82 + Math.random() * 0.38 + centerWeight * 0.42;
            return {
                scale: (0.82 + Math.random() * 0.32 + centerWeight * 0.32).toFixed(3),
                heat: heat.toFixed(3),
                width: (0.82 + Math.random() * 0.34).toFixed(3),
                sway: (Math.random() * 18 - 9).toFixed(2),
                lift: (6 + Math.random() * 16).toFixed(2),
                offset: (Math.random() * 10 - 5).toFixed(2),
                flare: Math.random() > 0.84 ? 1 : 0,
                turbulence: (0.8 + Math.random() * 0.9).toFixed(2),
                delay: (-Math.random() * 4 + phase).toFixed(2),
                duration: (2.1 + Math.random() * 1.6).toFixed(2),
            };
        });
    }, [count, phase]);

    return (
        <div
          className="flame-row"
          style={{
              "--row-blur": blur,
              "--intensity": intensity.toFixed(3),
              zIndex
          }}
        >
            {flames.map((flame, index) => (
                <span
                    key={index}
                    className="flame"
                    style={{
                        "--scale": flame.scale,
                        "--heat": flame.heat,
                        "--width": flame.width,
                        "--sway": `${flame.sway}px`,
                        "--lift": `${flame.lift}px`,
                        "--offset": `${flame.offset}px`,
                        "--flare": flame.flare,
                        "--delay": `${flame.delay}s`,
                        "--duration": `${flame.duration}s`,
                        "--turbulence": flame.turbulence,
                    }}
                />
            ))}
        </div>
    );
}
