//Filename: Fireplace.jsx
//Author: Kyle McColgan
//Date: 9 May 2026
//Description: This file contains the parent component for the Fireplace React project.

import { useEffect, useRef, useState } from "react";
import FlameRow from "../FlameRow/FlameRow.jsx";
import EmberLayer from "../EmberLayer/EmberLayer.jsx";
import HeatRefraction from "../HeatRefraction/HeatRefraction.jsx";
import "./Fireplace.css";

function Fireplace()
{
  const audioRef = useRef(null);
  const audioFadeRef = useRef(null);
  const rafRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);

  //Fire Intensity Simulation (CSS-driven, not React-driven).
  useEffect(() =>
  {
    let current = 1;
    let target = 1;
    let velocity = 0;
    let lastTargetChange = performance.now();

    const pickTarget = () =>
    {
      target = 0.92 + Math.random() * 0.22;
      lastTargetChange = performance.now();
    };

    pickTarget();

    const animate = (t) =>
    {
      if (document.hidden)
      {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      if ((t - lastTargetChange) > (2400 + Math.random() * 2400))
      {
        pickTarget();
      }

      const force = (target - current) * 0.015;
      velocity *= 0.93;
      velocity += force;
      current += velocity;

      document.documentElement.style.setProperty(
        "--intensity",
        current.toFixed(3)
      );
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  //Audio fade system (RAF fade).
  useEffect(() =>
  {
    const audio = audioRef.current;
    if (!audio)
    {
        return;
    }

    cancelAnimationFrame(audioFadeRef.current);

    const targetVolume = soundOn ? 0.34 : 0;

    if ((soundOn) && (audio.paused))
    {
      audio.play().catch(() => {});
    }

    const fade = () =>
    {
      const diff = targetVolume - audio.volume;

      if (Math.abs(diff) < 0.005)
      {
        audio.volume = targetVolume;

        if (targetVolume === 0)
        {
          audio.pause();
        }
        return;
      }

      audio.volume += diff * 0.05;
      audioFadeRef.current = requestAnimationFrame(fade);
    };

    fade();

    return () => cancelAnimationFrame(audioFadeRef.current);
  }, [soundOn]);

  return (
    <main className="room" aria-label="Digital fireplace">
      <audio
        ref={audioRef}
        src="/react-fireplace/audio/fireplace-crackle.mp3"
        loop
        preload="auto"
      />

      <div className="room-vignette" />
      <div className="room-ambient-light" />

      <button
        type="button"
        className="sound-toggle"
        onClick={() => setSoundOn((v) => ! v)}
        aria-label={
          soundOn
          ? "Disable fireplace sound"
          : "Enable fireplace sound"
        }
      >
        {soundOn ? "🔊" : "🔇"}
      </button>

      <section className="fireplace-shell">
        <div className="mantle" />
        <div className="firebox">
          <div className="firebox-reflection" />
          <HeatRefraction />
          <div className="glow" />
          <EmberLayer />
          <div className="logs" />
          <FlameRow count={4} intensity={0.84} blur={12} zIndex={1} />
          <FlameRow count={9} intensity={1} blur={5} zIndex={2} phase={-1.2} />
          <FlameRow count={14} intensity={1.08} blur={0} zIndex={3} phase={-2.4} />
        </div>
        <div className="hearth" />
      </section>
    </main>
  );
}

export default Fireplace;
