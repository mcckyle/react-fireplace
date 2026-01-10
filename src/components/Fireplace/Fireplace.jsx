//Filename: Fireplace.jsx
//Author: Kyle McColgan
//Date: 9 January 2026
//Description: This file contains the parent component for the React Fireplace project.

import { useEffect, useRef, useState, useMemo } from "react";
import HeatRefraction from "../HeatRefraction/HeatRefraction.jsx";
import "./Fireplace.css";

const EMBER_COUNT = 18;

function FlameRow({ count, intensity, blur = 0, zIndex = 1, phase = 0 }) {
  const flames = useMemo(
   () =>
     Array.from({ length: count }).map(() => ({
        scale: (0.85 + Math.random() * 0.4).toFixed(2),
        drift: `${(Math.random() * 10 - 5).toFixed(1)}px`,
        heat: (0.7 + Math.random() * 0.6).toFixed(2),
        flare: Math.random() > 0.78 ? 1 : 0,
        delay: `${(-Math.random() * 4 + phase).toFixed(2)}s`,
      })),
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
    const embers = useMemo(
      () =>
        Array.from({ length: EMBER_COUNT }).map(() => ({
          x: `${(Math.random() * 100).toFixed(1)}%`,
          delay: `${(Math.random() * 12).toFixed(1)}s`,
          rise: `${(14 + Math.random() * 18).toFixed(1)}px`,
          size: `${(1.6 + Math.random() * 1.8).toFixed(2)}px`,
          drift: `${(Math.random() * 8 - 4).toFixed(1)}px`,
          cluster: Math.random() > 0.75 ? 1.5 : 1,
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

  /* Flame Breathing. */
  useEffect(() => {
    let target = 1;
    let velocity = 0;
    const pick = () => {
      target = 0.9 + Math.random() * 0.25;
    };

    pick();
    const targetTimer = setInterval(pick, 28000);

    const tick = setInterval(() => {
      setIntensity(current => {
        const force = (target - current) * 0.02;
        velocity = velocity * 0.85 + force;
        return current + velocity;
      });
    }, 160);

    return () => { clearInterval(targetTimer); clearInterval(tick); }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--intensity",
      intensity.toFixed(3)
    );
  }, [intensity]);

  const fadeAudio = (audio, target, onDone) => {
    const step = target > audio.volume ? 0.008 : -0.01;

    const interval = setInterval(() => {
      const next = audio.volume + step;
      audio.volume = Math.min(1, Math.max(0, next));
      if (
        ( (step > 0) && (audio.volume >= target) ) ||
        ( (step < 0) && (audio.volume <= target) )
      ) {
        clearInterval(interval);
        onDone?.();
      }
    }, 40);
  }

  /* Audio Effects. */
  useEffect(() => {
      const audio = audioRef.current;
      if ( ! audio)
      {
          return;
      }

      if ( ! soundOn)
      {
        fadeAudio(audio, 0, () => audio.pause());
        return;
      }

      audio.volume = 0;
      audio.play().catch(() => {});
      fadeAudio(audio, 0.32);
    }, [soundOn]);

  /* Night Warmth Effects. */
  useEffect(() => {
    const update = () => {
      const hour = new Date().getHours();

      //Normalize: 18 -> 0 (early evening), 2 -> 1 (deep night).
      let t = (hour >= 18 ? hour : hour + 24) - 18;
      t = Math.min(Math.max(t / 8, 0), 1);
      const eased = t * t * (3 - 2 * t);

      const root = document.documentElement;
      document.documentElement.style.setProperty("--night", eased.toFixed(3));
      document.documentElement.style.setProperty("--night-inv", (1 - eased).toFixed(3));
    };

    update();
    const i = setInterval(update, 5 * 60 * 1000);
    return () => clearInterval(i);
  }, []);

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

          <FlameRow count={4} intensity={intensity * 0.85} blur={14} zIndex={1} phase={0} />
          <FlameRow count={9} intensity={intensity * 1.0} blur={7} zIndex={2} phase={-1.2} />
          <FlameRow count={14} intensity={intensity * 1.1} blur={0} zIndex={3} phase={-2.4} />
        </div>

        <div className="hearth" />
      </div>
    </div>
  );
}

export default Fireplace;
