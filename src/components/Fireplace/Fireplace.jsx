//Filename: Fireplace.jsx
//Author: Kyle McColgan
//Date: 27 December 2025
//Description: This file contains the parent component for the React Fireplace project.

import { useEffect, useRef, useState } from "react";
import HeatRefraction from "../HeatRefraction/HeatRefraction.jsx";
import "./Fireplace.css";

const EMBER_COUNT = 18;

function FlameRow({ className, intensity }) {
  const [flameCount, setFlameCount] = useState(
    Math.min(30, Math.floor(window.innerWidth / 90))
  );

  useEffect(() => {
    const onResize = () =>
    setFlameCount(Math.min(30, Math.floor(window.innerWidth / 90)));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

    return (
        <div className={`flame-row ${className}`}>
          {Array.from({ length: flameCount }).map((_, i) => (
            <span
              key={i}
              className="flame"
              style={{
                "--delay": `${Math.random() * 2}s`,
                "--scale": (0.85 + Math.random() * 0.4).toFixed(2),
                "--drift": `${(Math.random() * 10 - 5).toFixed(1)}px`,
                "--flare": Math.random() > 0.75 ? 1 : 0,
                "--intensity": intensity.toFixed(2),
                "--heat": (0.7 + Math.random() * 0.6).toFixed(2),
                "--burst": intensity > 1.05 && Math.random() > 0.85 ? 1 : 0,
              }}
            />
          ))}
        </div>
    );
}

function EmberLayer() {
    const base = [30, 45, 60, 72][Math.floor(Math.random() * 4)];
    return (
        <div className="embers">
          {Array.from({ length: EMBER_COUNT }).map((_, i) => (
            <span
              key={i}
              className="ember"
              style={{
                "--x": `${(base + Math.random() * 6 - 3).toFixed(1)}%`,
                "--delay": `${(Math.random() * 12).toFixed(1)}s`,
                "--rise": `${(12 + Math.random() * 18).toFixed(1)}px`,
                "--size": `${(1.2 + Math.random() * 1.6).toFixed(2)}px`,
                "--drift": `${(Math.random() * 12 - 6).toFixed(1)}px`,
                "--cluster": Math.random() > 0.7 ? 1.6 : 1,
              }}
            />
          ))}
        </div>
    );
}

//Ultra-light 1D smooth noise (Perlin-like).
function smoothNoise(t) {
  return (
    Math.sin(t) * 0.6 +
    Math.sin(t * 0.37 + 1.7) * 0.3 +
    Math.sin(t * 0.13 + 4.2) * 0.1
  );
}

function Fireplace() {
  const audioRef = useRef(null);
  const noiseTime = useRef(0);
  const [soundOn, setSoundOn] = useState(false);
  const [intensity, setIntensity] = useState(1);

  useEffect(() => {
    let raf;
    const tick = () => {
      noiseTime.current += 0.0025;

      const n = smoothNoise(noiseTime.current);
      const root = document.documentElement;

      root.style.setProperty("--noise-drift", (n * 6).toFixed(3));
      root.style.setProperty("--noise-breathe", (0.5 + n * 0.15).toFixed(3));
      root.style.setProperty("--noise-flare", (0.5 + n * 0.5).toFixed(3));
      root.style.setProperty("--convection", (n * 2.5).toFixed(3));

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIntensity(0.9 + Math.random() * 0.25);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if ( ( ! audioRef.current) || ( ! soundOn))
    {
      return;
    }

    const interval = setInterval(() => {
      audioRef.current.volume = 0.25 + Math.random() * 0.15;
    }, 9000);

    return () => clearInterval(interval);
  }, [soundOn]);

  useEffect(() => {
    if ( ( ! audioRef.current) || ( ! soundOn))
    {
      return;
    }
    const t = setInterval(() => {
      audioRef.current.playbackRate = 0.96 + Math.random() * 0.08;
    }, 14000);
    return () => clearInterval(t);
  }, [soundOn]);

  useEffect(() => {
      const audio = audioRef.current;
      if ( ! audio)
      {
          return;
      }

      audio.volume = 0;

      if (soundOn)
      {
          audio.play().catch(() => {});
          fadeAudio(audio, 0.35);
      }
      else
      {
          fadeAudio(audio, 0, () => audio.pause());
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setSoundOn(false);
      }
  }, [soundOn]);

  useEffect(() => {
    const updateNightWarmth = () => {
      const hour = new Date().getHours();

      //Normalize: 18 -> 0 (early evening), 2 -> 1 (deep night).
      let t = (hour >= 18 ? hour : hour + 24) - 18;
      t = Math.min(Math.max(t / 8, 0), 1);

      //Ease it (slow, natural).
      const eased = t * t * (3 - 2 * t);

      const root = document.documentElement;
      root.style.setProperty("--night", eased.toFixed(3));
      root.style.setProperty("--night-inv", (1 - eased).toFixed(3));
    };

    updateNightWarmth();
    const i = setInterval(updateNightWarmth, 5 * 60 * 1000);
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
        title="Ambient fireplace sound"
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
          <FlameRow className="back" intensity={intensity} />
          <FlameRow className="mid" intensity={intensity} />
          <FlameRow className="front" intensity={intensity} />
        </div>

        <div className="hearth" />
      </div>
    </div>
  );

  function fadeAudio(audio, target, onDone) {
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
}

export default Fireplace;
