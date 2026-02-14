//Filename: Fireplace.jsx
//Author: Kyle McColgan
//Date: 13 February 2026
//Description: This file contains the parent component for the React Fireplace project.

import { useEffect, useRef, useState } from "react";
import FlameRow from "../FlameRow/FlameRow.jsx";
import EmberLayer from "../EmberLayer/EmberLayer.jsx";
import HeatRefraction from "../HeatRefraction/HeatRefraction.jsx";
import "./Fireplace.css";

function Fireplace()
{
  const audioRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);
  const [intensity, setIntensity] = useState(1);

  //Flame Breathing Effects.
  useEffect(() => {
    let target = 1;
    let velocity = 0;

    const pickTarget = () => (target = 0.9 + Math.random() * 0.25);
    pickTarget();

    const targetTimer = setInterval(pickTarget, 28000);
    const tick = setInterval(() => {
      setIntensity((current) => {
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

      let fade;

      if (soundOn)
      {
        audio.volume = 0;
        audio.play().catch(() => {});
        fade = setInterval(() => {
          audio.volume = Math.min(audio.volume + 0.02, 0.32);
          if (audio.volume >= 0.32)
          {
            clearInterval(fade);
          }
        }, 60);
      }
      else
      {
        fade = setInterval(() => {
          audio.volume = Math.max(audio.volume - 0.03, 0);
          if (audio.volume === 0)
          {
            audio.pause();
            clearInterval(fade);
          }
        }, 50);
      }

      return () => clearInterval(fade);
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
        onClick={() => setSoundOn((v) => ! v)}
        aria-label="Toggle fireplace sound"
      >
        {soundOn ? "🔊" : "🔇"}
      </button>

      <div className="fireplace-shell">
        <div className="mantle" />
        <div className="firebox">
          <HeatRefraction />
          <div className="glow" />
          <EmberLayer />
          <div className="logs" />
          <FlameRow count={4} intensity={intensity * 0.85} blur={10} zIndex={1} />
          <FlameRow count={9} intensity={intensity} blur={5} zIndex={2} phase={-1.2} />
          <FlameRow count={14} intensity={intensity * 1.1} blur={0} zIndex={3} phase={-2.4} />
        </div>
        <div className="hearth" />
      </div>
    </div>
  );
}

export default Fireplace;
