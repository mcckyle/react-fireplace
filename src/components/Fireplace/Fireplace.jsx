//Filename: Fireplace.jsx
//Author: Kyle McColgan
//Date: 2 January 2026
//Description: This file contains the parent component for the React Fireplace project.

import { useEffect, useRef, useState, useMemo } from "react";
import HeatRefraction from "../HeatRefraction/HeatRefraction.jsx";
import "./Fireplace.css";

const EMBER_COUNT = 18;

function FlameRow({ count, intensity, blur = 0, zIndex = 1 }) {
  const flames = useMemo(
   () =>
     Array.from({ length: count }).map(() => ({
        scale: (0.9 + Math.random() * 0.3).toFixed(2),
        drift: `${(Math.random() * 6 - 3).toFixed(1)}px`,
        heat: (0.75 + Math.random() * 0.5).toFixed(2),
        flare: Math.random() > 0.8 ? 1 : 0,
      })),
     [count]
    );

    return (
        <div className="flame-row" style={{ '--row-blur': `${blur}px`, zIndex }}>
          {flames.map((flame, index) => (
            <span
              key={index}
              className="flame"
              style={{
                "--scale": flame.scale,
                "--drift": flame.drift,
                "--heat": flame.heat,
                "--flare": flame.flare,
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
    const pick = () => (target = 0.92 + Math.random() * 0.2);
    pick();

    const targetTimer = setInterval(pick, 16000);

    const smooth = setInterval(
      () => setIntensity(value => value + (target - value) * 0.015),
      100
    );

    return () => { clearInterval(targetTimer); clearInterval(smooth); }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--intensity",
      intensity.toFixed(3)
    );
  }, [intensity]);

  const fadeAudio = (audio, target, onDone) => {
    const step = target > audio.volume ? 0.01 : -0.01;
    const interval = setInterval(() => {
      audio.volume = Math.min(1, Math.max(0, audio.volume + step));
      if (
        (step > 0 && audio.volume >= target) ||
        (step < 0 && audio.volume <= target)
      ) {
        clearInterval(interval);
        onDone?.();
      }
    }, 30);
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
        audio.volume = 0;
        audio.pause();
        return;
      }

      audio.volume = 0;
      audio.play().catch(() => {});
      const fade = setInterval(() => {
        audio.volume = Math.min(0.32, audio.volume + 0.01);
        if (audio.volume >= 0.32)
        {
          clearInterval(fade);
        }
      }, 40);

      return () => clearInterval(fade);
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

          <FlameRow count={4} intensity={intensity} blur={10} zIndex={1} />
          <FlameRow count={9} intensity={intensity} blur={4} zIndex={2} />
          <FlameRow count={14} intensity={intensity} blur={0} zIndex={3} />
        </div>

        <div className="hearth" />
      </div>
    </div>
  );
}

export default Fireplace;
