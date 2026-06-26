//Filename: HeatRefraction.jsx
//Author: Kyle McColgan
//Date: 26 June 2026
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
            return;
        }

        //Scene Setup.
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
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(renderer.domElement);

        //Uniforms.
        const uniforms = {
            uTime: { value: 0 },
            uHeat: { value: 1 },
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
                  float b = hash(i + vec2(1, 0));
                  float c = hash(i + vec2(0, 1));
                  float d = hash(i + vec2(1, 1));

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
                for (int i = 0; i < 5; i++)
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
                  vec2 centered = uv - vec2(0.5, 0.65);
                  float width = 1.0 - abs(centered.x) * 1.7;

                  float flameColumn = smoothstep(0.0, 0.85, width);
                  float vertical = smoothstep(0.05, 0.25, uv.y) * (1.0 - smoothstep(0.55, 0.95, uv.y));

                  float mask = flameColumn * vertical;
                  float time = uTime * 0.22;

                  vec2 flow = vec2(fbm(uv * 2.2 - vec2(0, time)), fbm(uv * 1.8 - vec2(time * 0.3, time))) - 0.5;

                  float heat = fbm(uv * 8.0 + flow * 2.0 - vec2(0, time * 3.));
                  float shimmer = (heat - 0.5) * mask * uHeat;

                  /* Distortion Composition. */
                  vec2 distortion = vec2(shimmer * 0.018, shimmer * 0.065);

                  float red = abs(distortion.x) * mask;
                  float alpha = (abs(distortion.y) * 0.45);

                  vec3 color = vec3(1.0, 0.72 + red, 0.45);
                  gl_FragColor = vec4(color, alpha);
              }
            `,
        });

        //Fullscreen Quad.
        const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        scene.add(quad);

        //Animation.
        let raf;
        const animate = () =>
        {
            uniforms.uTime.value += 0.016;
            uniforms.uHeat.value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--fire-energy")) || 1;
            renderer.render(scene, camera);
            raf = requestAnimationFrame(animate);
        };
        animate();

        //Resize.
        const onResize = () =>
        {
            const width = container.clientWidth;
            const height = container.clientHeight;
            renderer.setSize(width, height);
            uniforms.uResolution.value.set(width, height);
        };
        window.addEventListener("resize", onResize);

        //Cleanup.
        return () =>
        {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
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
