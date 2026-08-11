//Filename: Fireplace.jsx
//Author: Kyle McColgan
//Date: 10 August 2026
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
  const simulationRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);

  /*
   * Fire Simulation
   *
   * The simulation intentionally combines:
   * - slow energy drift
   * - medium-scale turbulence
   * - high-frequence flame flicker
   *
   * CSS consumes the resulting variables while the individual
   * visual components remain responsible for their own geometry.
   */
  useEffect(() =>
  {
    const room = roomRef.current;

    if (!room)
    {
      return undefined;
    }

    let intensity = 1;
    let target = 1;
    let velocity = 0;
    let heat = 0.8;
    let flicker = 1;

    let nextShift = performance.now();
    let frameId = null;

    const chooseTarget = () =>
    {
      /*
       * Most fire movement stays close to equilibrium.
       * Occasionally allow a stronger flare so the scene
       * feels organic rather than mechanically periodic.
       */
      target = Math.random() < 0.08
        ? 1.12 + Math.random() * 0.14
        : 0.91 + Math.random() * 0.12;
    };

    const update = (time) =>
    {
      if (document.hidden)
      {
        frameId = null;
        return;
      }

      if (time >= nextShift)
      {
        chooseTarget();
        nextShift = time + 1600 + Math.random() * 3600;
      }

      /*
       * Multiple frequencies prevent the fire from having
       * an obvious repeating animation cycle.
       */
       const slow = Math.sin(time * 0.0024);
       const medium = Math.sin(time * 0.0105 + 2.15);
       const turbulence = Math.sin(time * 0.041 + 5.4) * 0.55 +
                          Math.sin(time * 0.083 + 2.7) * 0.45;
       /*
        * Spring-like energy movement.
        *
        * This is deliberately damped so intensity changes
        * feel like fire breathing rather than UI animation.
        */
        velocity += (target - intensity) * 0.017;
        velocity *= 0.935;
        intensity += velocity;

       /*
        * Keep the high-frequence flicker restrained.
        * Realistic fire should feel alive without making
        * the entire room pulse aggressively.
        */
        flicker = 0.985 + slow * 0.018 + medium * 0.022 + turbulence * 0.012;

        /*
         * Heat follows intensity more slowly than luminance.
         * This creates the impression of thermal inertia.
         */
        const targetHeat = 0.72 + intensity * 0.012;
        heat += (targetHeat - heat) * 0.014;

        room.style.setProperty("--intensity", intensity.toFixed(3));
        room.style.setProperty("--heat", heat.toFixed(3));
        room.style.setProperty("--flicker", flicker.toFixed(3));

        frameId = requestAnimationFrame(update);
    };

    const resume = () =>
    {
      if (frameId === null)
      {
        frameId = requestAnimationFrame(update);
      }
    };

    chooseTarget();

    frameId = requestAnimationFrame(update);

    document.addEventListener("visibilitychange", resume);

    return () =>
    {
      if (frameId !== null)
      {
        cancelAnimationFrame(frameId);
      }
      document.removeEventListener("visibilitychange", resume);
    };
  }, []);

  //Audio fade system (RAF fade).
  useEffect(() =>
  {
    const audio = audioRef.current;

    if (!audio)
    {
        return undefined;
    }

    if (audioFadeRef.current !== null)
    {
      cancelAnimationFrame(audioFadeRef.current);
    }

    const targetVolume = soundOn ? 0.34 : 0;

    if ((soundOn) && (audio.paused))
    {
      audio.volume = Math.min(audio.volume, targetVolume);
      audio.play().catch(() =>
      {
        setSoundOn(false);
      });
    }

    const fade = () =>
    {
      const current = audio.volume;
      const difference = targetVolume - current;

      if (Math.abs(difference) < 0.004)
      {
        audio.volume = targetVolume;

        if (targetVolume === 0)
        {
          audio.pause();
          audio.currentTime = 0;
        }

        audioFadeRef.current = null;
        return;
      }

      audio.volume = current + difference * 0.08;
      audioFadeRef.current = requestAnimationFrame(fade);
    };

    audioFadeRef.current = requestAnimationFrame(fade);

    return () =>
    {
      if (audioFadeRef.current !== null)
      {
        cancelAnimationFrame(audioFadeRef.current);
      }
    };
  }, [soundOn]);

  return (
    <main ref={roomRef} className="room" aria-label="Digital fireplace">
      <audio
        ref={audioRef}
        src="/react-fireplace/audio/fireplace-crackle.mp3"
        loop
        preload="auto"
        aria-hidden="true"
      />

      <div className="room-ambient-light" aria-hidden="true" />
      <div className="room-firelight-projection" aria-hidden="true" />
      <div className="room-vignette" aria-hidden="true" />
      <button
        type="button"
        className="sound-toggle"
        onClick={() => setSoundOn((value) => !value)}
        aria-label={
          soundOn
          ? "Disable fireplace sound"
          : "Enable fireplace sound"
        }
        aria-pressed={soundOn}
      >
        <svg className="sound-icon" viewBox="0 0 24 24" aria-hidden="true">
          {soundOn ? (
            <>
              <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
              <path d="M16 9.5c1.1 1.1 1.1 3.9 0 5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M18.5 7c2.4 2.5 2.4 7.5 0 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
              <path d="m17 9-5 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="m12 9 5 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>

      <section className="fireplace-shell">
        <div className="mantle" aria-hidden="true" />
        <div className="firebox">
          <div className="firebox-reflection" aria-hidden="true" />
          <HeatRefraction />
          <div className="glow" aria-hidden="true" />
          <EmberLayer />
          <div className="coal-bed" aria-hidden="true" />
          <div className="logs" aria-hidden="true" />
          <FlameRow count={4} intensity={0.84} blur={12} zIndex={1} />
          <FlameRow count={9} intensity={1} blur={5} zIndex={2} phase={-1.2} />
          <FlameRow count={14} intensity={1.08} blur={0} zIndex={3} phase={-2.4} />
        </div>
        <div className="hearth" aria-hidden="true" />
      </section>
    </main>
  );
}

export default Fireplace;
