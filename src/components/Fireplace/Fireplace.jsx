//Filename: Fireplace.jsx
//Author: Kyle McColgan
//Date: 23 January 2026
//Description: This file contains the parent component for the React Fireplace project.

import { useEffect, useRef, useState, useMemo } from "react";
import HeatRefraction from "../HeatRefraction/HeatRefraction.jsx";
import "./Fireplace.css";

const EMBER_COUNT = 18;

function FlameRow({ count, intensity, blur = 0, zIndex = 1, phase = 0 }) {
  const flames = useMemo(() =>
     Array.from({ length: count }).map((_, i) => {
       const t = i / (count - 1);
       const center = 1 - Math.abs(t - 0.5) * 2; //0 edges -> 1 center.
       return {
        scale: (0.9 + Math.random() * 0.3 + center * 0.2).toFixed(2),
        drift: `${(Math.random() * 10 - 5).toFixed(1)}px`,
        heat: (0.75 + Math.random() * 0.45 + center * 0.25).toFixed(2),
        flare: Math.random() > 0.82 ? 1 : 0,
        delay: `${(-Math.random() * 3.5 + phase).toFixed(2)}s`,
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

function EmberLayer() {
    const embers = useMemo(() =>
        Array.from({ length: EMBER_COUNT }).map(() => ({
          x: `${(Math.random() * 100).toFixed(1)}%`,
          delay: `${(Math.random() * 14).toFixed(1)}s`,
          rise: `${(12 + Math.random() * 28).toFixed(1)}px`,
          size: `${(1.2 + Math.random() * 2).toFixed(2)}px`,
          drift: `${(Math.random() * 6 - 3).toFixed(1)}px`,
          cluster: Math.random() > 0.78 ? 1.4 : 1,
          sway: (Math.random() * 4 - 2).toFixed(1),
        })),
      []
    );

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
            }}
          />
        ))}
      </div>
    );
}

function Fireplace() {
  const audioRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);
  const [intensity, setIntensity] = useState(1);

  //Flame Breathing Effects.
  useEffect(() => {
    let target = 1, velocity = 0;

    const pick = () => { target = 0.9 + Math.random() * 0.25; };
    pick();

    const targetTimer = setInterval(pick, 28000);
    const tick = setInterval(() => {
      setIntensity(current => {
        const force = (target - current) * 0.025;
        velocity = velocity * 0.85 + force;
        return current + velocity;
      });
    }, 160);

    return () => { clearInterval(targetTimer); clearInterval(tick); }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--intensity", intensity.toFixed(3));
  }, [intensity]);

  //Audio Handling Effects.
  useEffect(() => {
      const audio = audioRef.current;
      if ( ! audio)
      {
          return;
      }

      const resume = () => soundOn && audio.paused && audio.play().catch(() => {});
      document.addEventListener("visibilitychange", resume);

      if ( ! soundOn)
      {
        audio.pause();
        audio.volume = 0;
        return () => document.removeEventListener("visibilitychange", resume);
      }

      audio.volume = 0.32;
      audio.play().catch(() => {});

      return () => document.removeEventListener("visibilitychange", resume);
    }, [soundOn]);

  return (
    <div className="room">
      <audio
        ref={audioRef}
        src="/react-fireplace/audio/fireplace-crackle.mp3"
        loop
        preload="auto"
      />

      <button
        className="sound-toggle"
        onClick={() => setSoundOn(v => !v)}
        aria-label="Toggle fireplace sound"
      >
        {soundOn ? "ON" : "OFF"}
      </button>

      <div className="fireplace-shell">
        <div className="mantle" />
        <div className="firebox">
          <HeatRefraction />
          <div className="glow" />
          <EmberLayer />
          <div className="logs" />
          <FlameRow count={4} intensity={intensity * 0.85} blur={10} zIndex={1} phase={0} />
          <FlameRow count={9} intensity={intensity} blur={5} zIndex={2} phase={-1.2} />
          <FlameRow count={14} intensity={intensity * 1.1} blur={0} zIndex={3} phase={-2.4} />
        </div>
        <div className="hearth" />
      </div>
    </div>
  );
}

export default Fireplace;
