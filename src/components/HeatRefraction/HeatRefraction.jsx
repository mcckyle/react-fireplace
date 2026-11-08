//Filename: HeatRefraction.jsx
//Author: Kyle McColgan
//Date: 8 November 2026
//Description: This file contains the WebGL component for the React Fireplace project.

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeatRefraction()
{
    const mountRef = useRef(null);

    useEffect(() =>
    {
        const container = mountRef.current;

        if (!container)
        {
            return undefined;
        }

        //Scene Setup.
        const room = container.closest(".room");
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const width = container.clientWidth;
        const height = container.clientHeight;

        if ((!width) || (!height))
        {
            return undefined;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        //Renderer.
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
            depth: false,
            stencil: false,
            powerPreference: "low-power",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(width, height);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(renderer.domElement);

        //Shader Uniforms.
        const uniforms = {
            uTime: { value: 0 },
            uHeat: { value: 0.8 },
            uResolution: {
                value: new THREE.Vector2(renderer.domElement.width, renderer.domElement.height),
            },
        };

        //Heat distortion shader.
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms,
            vertexShader: `
              varying vec2 vUv;
              void main()
              {
                  vUv = uv;
                  gl_Position = vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              precision highp float;

              uniform float uTime;
              uniform float uHeat;
              uniform vec2 uResolution;

              varying vec2 vUv;

              /* Hash. */
              float hash(vec2 p)
              {
                  p = fract(p * vec2(234.34, 435.345));
                  p += dot(p, p + 34.23);
                  return fract(p.x * p.y);
              }

              /* Value Noise. */
              float noise(vec2 p)
              {
                  vec2 i = floor(p);
                  vec2 f = fract(p);
                  vec2 u = f * f * (3.0 - 2.0 * f);

                  float a = hash(i);
                  float b = hash(i + vec2(1.0, 0.0));
                  float c = hash(i + vec2(0.0, 1.0));
                  float d = hash(i + vec2(1.0, 1.0));

                  return mix(
                      mix(a, b, u.x),
                      mix(c, d, u.x),
                      u.y
                  );
              }

              /* Fractal Brownian Motion. */
              float fbm(vec2 p)
              {
                float value = 0.0;
                float amplitude = 0.5;
                for (int i = 0; i < 4; i++)
                {
                    value += noise(p) * amplitude;
                    p *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
              }

              /* Main. */
              void main()
              {
                  vec2 uv = vUv;
                  float center = 1.0 - abs(uv.x - 0.5) * 1.65;
                  float horizontalMask = smoothstep(0.0, 0.82, center);
                  float lowerMask = smoothstep(0.12, 0.32, uv.y);
                  float upperMask = 1.0 - smoothstep(0.66, 0.94, uv.y);

                  float mask = horizontalMask * lowerMask * upperMask;
                  float time = uTime;

                  vec2 flow = vec2(
                      fbm(uv * vec2(2.8, 3.6) - vec2(0.0, time * 0.24)),
                      fbm(uv * vec2(2.2, 4.2) + vec2(time * 0.12, -time * 0.20))
                  );

                  float heat = fbm(
                      uv * vec2(7.0, 9.0) +
                      (flow - 0.5) * 2.4 -
                      vec2(0.0, time * 0.45)
                  );
                  float turbulence = abs(heat - 0.5);
                  float shimmer = smoothstep(0.055, 0.31, turbulence);
                  float alpha = shimmer * mask * uHeat * 0.065;

                  vec3 color = mix(
                    vec3(1.0, 0.34, 0.10),
                    vec3(1.0, 0.72, 0.36),
                    smoothstep(0.12, 0.38, turbulence)
                  );
                  gl_FragColor = vec4(color, alpha);
              }
            `,
        });

        //Fullscreen Quad.
        const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        scene.add(quad);

        //Animation.
        let raf = null;
        let lastHeatUpdate = 0;
        const animate = (time) =>
        {
            if ((document.hidden) || (reducedMotion.matches))
            {
                raf = null;
                return;
            }
            uniforms.uTime.value += 0.001;

            /*
             * Read the dynamic variables from the
             * actual fireplace room, not :root.
             *
             * Updating this at ~10Hz is sufficient and
             * avoids forcing a computed-style read every
             * render frame.
             */

            if (time - lastHeatUpdate >= 100)
            {
                const computed = getComputedStyle(room || container);
                const intensity = parseFloat(computed.getPropertyValue("--intensity"));
                const heat = parseFloat(computed.getPropertyValue("--heat"));

                if ((Number.isFinite(intensity)) && (Number.isFinite(heat)))
                {
                    uniforms.uHeat.value = intensity * heat;
                }

                lastHeatUpdate = time;
            }

            renderer.render(scene, camera);
            raf = requestAnimationFrame(animate);
        };

        const resume = () =>
        {
            if ((!document.hidden) && (!reducedMotion.matches) && (raf === null))
            {
                raf = requestAnimationFrame(animate);
            }
        };

        const stop = () =>
        {
            if (raf !== null)
            {
                cancelAnimationFrame(raf);
                raf = null;
            }
        };

        //Resize.
        const resizeObserver = new ResizeObserver(() =>
        {
            const nextWidth = container.clientWidth;
            const nextHeight = container.clientHeight;

            if ((!nextWidth) || (!nextHeight))
            {
                return;
            }
            renderer.setSize(nextWidth, nextHeight);
            uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height);
        });

        resizeObserver.observe(container);
        document.addEventListener("visibilitychange", resume);
        reducedMotion.addEventListener("change", () =>
        {
            if (reducedMotion.matches)
            {
                stop();
            }
            else
            {
                resume();
            }
        });

        resume();

        //Cleanup.
        return () =>
        {
            stop();
            resizeObserver.disconnect();
            document.removeEventListener("visibilitychange", resume);
            quad.geometry.dispose();
            material.dispose();
            renderer.dispose();
            renderer.domElement.remove();
        };
    }, []);

    return <div ref={mountRef} className="heat-webgl" aria-hidden />;
}
