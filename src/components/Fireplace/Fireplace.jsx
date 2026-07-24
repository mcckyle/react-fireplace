//Filename: Fireplace.jsx
//Author: Kyle McColgan
//Date: 24 July 2026
//Description: This file contains the parent component for the Fireplace React project.

import { useEffect, useRef, useState } from "react";
import FlameRow from "../FlameRow/FlameRow.jsx";
import EmberLayer from "../EmberLayer/EmberLayer.jsx";
import HeatRefraction from "../HeatRefraction/HeatRefraction.jsx";
import "./Fireplace.css";

function Fireplace()
{
  const roomRef = useRef(null);
  const audioRef = useRef(null);
  const audioFadeRef = useRef(null);
  const rafRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);

  //Fire Intensity Simulation (CSS-driven).
  useEffect(() =>
  {
    let intensity = 1;
    let target = 1;
    let velocity = 0;
    let heat = 0.8;
    let flicker = 1;

    const chooseTarget = () =>
    {
      target = Math.random() < 0.1
        ? 1.15 + Math.random() * 0.12
        : 0.9 + Math.random() * 0.15;
    };

    chooseTarget();

    let nextShift = performance.now();

    const animate = (time) =>
    {
      if (!document.hidden)
      {
        if (time > nextShift)
        {
          chooseTarget();
          nextShift = time + 1800 + Math.random() * 3500;
        }

        const slow = Math.sin(time * 0.0027);
        const medium = Math.sin(time * 0.011 + 2.1);
        const fast = (Math.random() - 0.5);

        velocity += (target - intensity) * 0.018;
        velocity *= 0.94;
        intensity += velocity;
        flicker = 0.97 + slow * 0.02 + medium * 0.03 + fast * 0.018;
        heat += ((intensity * 0.82) - heat) * 0.015;

        const room = roomRef.current;

        if (room)
        {
          room.style.setProperty("--intensity", intensity.toFixed(3));
          room.style.setProperty("--heat", heat.toFixed(3));
          room.style.setProperty("--flicker", flicker.toFixed(3));
        }
      }

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
    <main ref={roomRef} className="room" aria-label="Digital fireplace">
      <audio
        ref={audioRef}
        src="/react-fireplace/audio/fireplace-crackle.mp3"
        loop
        preload="auto"
      />

      <div className="room-vignette" />
      <div className="room-ambient-light" />
      <div className="room-firelight-projection" />

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
          <div className="coal-bed" />
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
