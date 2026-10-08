//Filename: HeatRefraction.jsx
//Author: Kyle McColgan
//Date: 8 October 2026
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
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        //Renderer.
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
            depth: false,
            stencil: false,
            powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(renderer.domElement);

        //Uniforms.
        const uniforms = {
            uTime: { value: 0 },
            uHeat: { value: 0.8 },
            uResolution: {
                value: new THREE.Vector2(container.clientWidth, container.clientHeight),
            },
        };

        //Shader Material.
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms,
            vertexShader: `
              void main() { gl_Position = vec4(position, 1.0); }
            `,
            fragmentShader: `
              precision highp float;

              uniform float uTime;
              uniform float uHeat;
              uniform vec2 uResolution;

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

                  float a = hash(i);
                  float b = hash(i + vec2(1.0, 0.0));
                  float c = hash(i + vec2(0.0, 1.0));
                  float d = hash(i + vec2(1.0, 1.0));

                  vec2 u = f * f * (3.0 - 2.0 * f);
                  return mix(a, b, u.x) +
                         (c - a) * u.y * (1.0 - u.x) +
                         (d - b) * u.x * u.y;
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
                  vec2 uv = gl_FragCoord.xy / uResolution;
                  float center = 1.0 - abs(uv.x - 0.5) * 1.55;
                  float column = smoothstep(0.0, 0.82, center);
                  float lower = smoothstep(0.16, 0.30, uv.y);
                  float upper = 1.0 - smoothstep(0.68, 0.92, uv.y);

                  float mask = column * lower * upper;
                  float time = uTime * 0.16;

                  vec2 flow = vec2(fbm(uv * 2.6 - vec2(0.0, time)), fbm(uv * 2.0 + vec2(time * 0.32, -time))) - 0.5;

                  float heat = fbm(uv * 7.0 + flow * 2.2 - vec2(0.0, time * 2.8));
                  float shimmer = (heat - 0.5) * mask * uHeat;
                  float alpha = (abs(shimmer) * 0.17);

                  vec3 color = vec3(1.0, 0.58, 0.28);
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
            uniforms.uTime.value += 0.016;

            /*
             * Read the dynamic variables from the
             * actual fireplace room, not :root.
             *
             * Updating this at ~10Hz is sufficient and
             * avoids forcing a computed-style read every
             * render frame.
             */

            if (time - lastHeatUpdate > 100)
            {
                const computed = getComputedStyle(room || container);
                const energy = parseFloat(computed.getPropertyValue("--fire-energy"));

                if (Number.isFinite(energy))
                {
                    uniforms.uHeat.value = energy;
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

        //Resize.
        const onResize = () =>
        {
            const width = container.clientWidth;
            const height = container.clientHeight;

            if ((!width) || (!height))
            {
                return;
            }
            renderer.setSize(width, height);
            uniforms.uResolution.value.set(width, height);
        };

        const resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(container);
        document.addEventListener("visibilitychange", resume);
        reducedMotion.addEventListener("change", resume);

        if (!reducedMotion.matches)
        {
            raf = requestAnimationFrame(animate);
        }

        //Cleanup.
        return () =>
        {
            if (raf !== null)
            {
                cancelAnimationFrame(raf);
            }

            resizeObserver.disconnect();
            document.removeEventListener("visibilitychange", resume);
            reducedMotion.removeEventListener("change", resume);
            quad.geometry.dispose();
            material.dispose();
            renderer.dispose();

            if (renderer.domElement.parentNode)
            {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={mountRef} className="heat-webgl" aria-hidden />;
}
