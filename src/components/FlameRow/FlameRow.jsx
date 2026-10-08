//Filename: FlameRow.jsx
//Author: Kyle McColgan
//Date: 8 October 2026
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
        return Array.from({ length: count }).map((_, index) =>
        {
            const position = index / Math.max(count - 1, 1);
            const center = 1 - Math.abs(position - 0.5) * 2; //0 edges -> 1 center.
            const variation = Math.random();
            const energy = 0.66 + variation * 0.24 + center * 0.34;
            const temperature = 0.74 + variation * 0.18 + center * 0.28;
            const turbulence = 0.72 + Math.random() * 0.68;
            const heightBias = center > 0.72 ? 1.08 : 0.94 + center * 0.08;

            return {
                energy: energy.toFixed(3),
                scale: (0.84 + energy * 0.32).toFixed(3),
                temperature: temperature.toFixed(3),
                width: (0.82 + energy * 0.28).toFixed(3),
                height: ((0.78 + energy * 0.68) * heightBias).toFixed(3),
                sway: ((Math.random() * 18) - 9).toFixed(2),
                lift: (9 + energy * 23).toFixed(2),
                lean: ((Math.random() * 10) - 5).toFixed(2),
                turbulence: turbulence.toFixed(2),
                duration: (1.10 + Math.random() * 0.82 + (1 - Math.min(energy, 1)) * 0.35).toFixed(2),
                delay: (-Math.random() * 4.2 + phase).toFixed(2),
                taper: (0.76 + Math.random() * 0.20 + center * 0.10).toFixed(3),
                core: (0.82 + Math.random() * 0.20 + center * 0.12).toFixed(3),
            };
        });
    }, [count, phase]);

    return (
        <div
          className="flame-row"
          style={{
              "--row-blur": `${blur}px`,
              "--row-intensity": intensity,
              zIndex
          }}
          aria-hidden="true"
        >
            {flames.map((flame, index) => (
                <span
                    key={index}
                    className="flame"
                    style={{
                        "--energy": flame.energy,
                        "--scale": flame.scale,
                        "--temperature": flame.temperature,
                        "--width": flame.width,
                        "--height": flame.height,
                        "--sway": `${flame.sway}px`,
                        "--lift": `${flame.lift}px`,
                        "--lean": `${flame.lean}deg`,
                        "--turbulence": flame.turbulence,
                        "--delay": `${flame.delay}s`,
                        "--duration": `${flame.duration}s`,
                        "--taper": flame.taper,
                        "--core": flame.core,
                    }}
                />
            ))}
        </div>
    );
}
