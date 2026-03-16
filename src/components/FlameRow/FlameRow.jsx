//Filename: FlameRow.jsx
//Author: Kyle McColgan
//Date: 16 March 2026
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
            const t = i / (count - 1);
            const center = 1 - Math.abs(t - 0.5) * 2; //0 edges -> 1 center.
            return {
                scale: (0.9 + Math.random() * 0.3 + center * 0.25).toFixed(3),
                heat: (0.8 + Math.random() * 0.4 + center * 0.35).toFixed(3),
                drift: `${(Math.random() * 10 - 5).toFixed(2)}px`,
                offset: `${(Math.random() * 8 - 4).toFixed(2)}px`,
                flare: Math.random() > 0.82 ? 1 : 0,
                delay: `${(-Math.random() * 3 + phase).toFixed(2)}s`,
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
                        "--drift": flame.drift,
                        "--offset": flame.offset,
                        "--flare": flame.flare,
                        "--delay": flame.delay,
                    }}
                />
            ))}
        </div>
    );
}
