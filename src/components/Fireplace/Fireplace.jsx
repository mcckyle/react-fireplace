//Filename: Fireplace.jsx
//Author: Kyle McColgan
//Date: 8 November 2026
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
  const [soundOn, setSoundOn] = useState(false);

  /*
   * Fire Simulation
   *
   * The simulation drives the shared lighting variables on the room.
   * Individual visual layers consume those variables independently.
   *
   */
  useEffect(() =>
  {
    const room = roomRef.current;

    if (!room)
    {
      return undefined;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let intensity = 1;
    let target = 1;
    let velocity = 0;
    let heat = 0.8;

    let frameId = null;
    let previousTime = 0;
    let nextShift = 0;

    const setLighting = () =>
    {
      room.style.setProperty("--intensity", intensity.toFixed(3));
      room.style.setProperty("--heat", heat.toFixed(3));

      const flicker = 0.985 +
        Math.sin(performance.now() * 0.0022) * 0.018 +
        Math.sin(performance.now() * 0.0097 + 2.15) * 0.023 +
        Math.sin(performance.now() * 0.0039 + 5.4) * 0.009;

      room.style.setProperty("--flicker", flicker.toFixed(3));
    };

    const chooseTarget = () =>
    {
      /*
       * Most fire movement stays close to equilibrium.
       * Occasionally stronger flares keep the fire organic.
       */
      target = Math.random() < 0.09
        ? 1.08 + Math.random() * 0.15
        : 0.93 + Math.random() * 0.09;
    };

    const update = (time) =>
    {
      if ((document.hidden) || (reducedMotion.matches))
      {
        frameId = null;
        previousTime = 0;
        return;
      }

      const delta = previousTime === 0 ? 1 : Math.min((time - previousTime) / 16.667, 2.5);
      previousTime = time;

      if (time >= nextShift)
      {
        chooseTarget();
        nextShift = time + 1700 + Math.random() * 3800;
      }

      /*
        * Spring-like energy movement.
        *
        * This is deliberately damped so intensity changes
        * feel like fire breathing rather than UI animation.
        */
        velocity += (target - intensity) * 0.017 * delta;
        velocity *= Math.pow(0.935, delta);
        intensity += velocity * delta;

        /*
         * Heat follows intensity more slowly than luminance.
         * This creates the impression of thermal inertia.
         */
        const targetHeat = 0.68 + intensity * 0.12;
        heat += (targetHeat - heat) * (1 - Math.pow(1 - 0.012, delta));
        setLighting();

        frameId = requestAnimationFrame(update);
    };

    const stop = () =>
    {
      if (frameId !== null)
      {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      previousTime = 0;
    };

    const resume = () =>
    {
      if ((!document.hidden) && (!reducedMotion.matches) && (frameId === null))
      {
        previousTime = 0;
        frameId = requestAnimationFrame(update);
      }
    };

    const handleMotionPreference = () =>
    {
      if (reducedMotion.matches)
      {
        stop();
        intensity = 1;
        heat = 0.80;

        room.style.setProperty("--intensity", "1");
        room.style.setProperty("--heat", "0.80");
        room.style.setProperty("--flicker", "1");
      }
      else
      {
        resume();
      }
    };

    chooseTarget();
    nextShift = performance.now() + 1800;

    if (reducedMotion.matches)
    {
      room.style.setProperty("--intensity", "1");
      room.style.setProperty("--heat", "0.80");
      room.style.setProperty("--flicker", "1");
    }
    else
    {
      resume();
    }

    document.addEventListener("visibilitychange", resume);
    reducedMotion.addEventListener("change", handleMotionPreference);

    return () =>
    {
      stop();
      document.removeEventListener("visibilitychange", resume);
      reducedMotion.removeEventListener("change", handleMotionPreference);
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
      audioFadeRef.current = null;
    }

    const targetVolume = soundOn ? 0.34 : 0;

    if ((soundOn) && (audio.paused))
    {
      audio.play().catch(() =>
      {
        setSoundOn(false);
      });
    }

    if ((!soundOn) && (audio.volume === 0))
    {
      audio.pause();
      audio.currentTime = 0;
      return undefined;
    }

    let previousTime = 0;

    const fade = (time) =>
    {
      const delta = previousTime === 0 ? 1 : Math.min((time - previousTime) / 16.667, 2.5);
      previousTime = time;

      const difference = targetVolume - audio.volume;
      const factor = 1 - Math.pow(1 - 0.08, delta);

      if (Math.abs(difference) < 0.004)
      {
        audio.volume = targetVolume;
        audioFadeRef.current = null;

        if (targetVolume === 0)
        {
          audio.pause();
          audio.currentTime = 0;
        }

        return;
      }

      audio.volume += difference * factor;
      audioFadeRef.current = requestAnimationFrame(fade);
    };

    audioFadeRef.current = requestAnimationFrame(fade);

    return () =>
    {
      if (audioFadeRef.current !== null)
      {
        cancelAnimationFrame(audioFadeRef.current);
        audioFadeRef.current = null;
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
      />

      <div className="room-ambient-light" aria-hidden="true" />
      <div className="room-firelight-projection" aria-hidden="true" />
      <div className="room-vignette" aria-hidden="true" />
      <button
        type="button"
        className="sound-toggle"
        onClick={() => setSoundOn(value => !value)}
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
              <path d="m17 9-5 6m0-6 5 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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
          <div className="flame-stage" aria-hidden="true">
            <FlameRow count={7} intensity={0.84} blur={15} zIndex={1} phase={0.6} />
            <FlameRow count={13} intensity={0.98} blur={6} zIndex={2} phase={-1.2} />
            <FlameRow count={19} intensity={1.08} blur={0} zIndex={3} phase={-2.4} />
          </div>
        </div>
        <div className="hearth" aria-hidden="true" />
      </section>
    </main>
  );
}

export default Fireplace;
