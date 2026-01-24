//Filename: HeatRefraction.jsx
//Author: Kyle McColgan
//Date: 23 January 2026
//Description: This file contains the WebGL component for the React Fireplace project.

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeatRefraction() {
    const mountRef = useRef(null);

    useEffect(() => {
        const container = mountRef.current;

        if ( ! container)
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
            powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        //Uniforms.
        const uniforms = {
            uTime: { value: 0 },
            uResolution: {
                value: new THREE.Vector2(container.clientWidth, container.clientHeight),
            },
        };

        //Material.
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
              uniform vec2 uResolution;

              /* Hash + value noise. */
              float hash(vec2 p) {
                  p = fract(p * vec2(127.1, 311.7));
                  p += dot(p, p + 34.2);
                  return fract(p.x * p.y);
              }

              float noise(vec2 p) {
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
              float fbm(vec2 p) {
                float v = 0.0;
                float a = 0.5;
                for (int i = 0; i < 4; i ++)
                {
                    v += a * noise(p);
                    p *= 2.0;
                    a *= 0.5;
                }
                return v;
              }

              void main() {
                  vec2 uv = gl_FragCoord.xy / uResolution;

                  /* Horizontal Center Weighting. */
                  float center = 1.0 - abs(uv.x - 0.5) * 2.0;
                  center = clamp(center, 0.0, 1.0);

                  /* Vertical Heat Column. */
                  float base = smoothstep(0.02, 0.38, uv.y);
                  float topFade = 1.0 - smoothstep(0.55, 0.95, uv.y);
                  float heatMask = base * topFade * center;

                  /* Time. */
                  float t = uTime * 0.18;

                  /* Convection Flow. */
                  vec2 flow = vec2(fbm(uv * 4.0 + t) * 0.05, -t * 0.9);

                  /* Layered Turbulence. */
                  float nLarge = fbm(uv * 0.5 + flow * 0.6);
                  float nSmall = fbm(uv * 16.0 - flow * 1.1);
                  float distortion = (nLarge * 0.6 + nSmall * 0.4) - 0.5;

                  /* Anisotropic Distortion (Heat Rises). */
                  vec2 offset = vec2(distortion * 0.018, distortion * 0.05) * heatMask;

                  /* Alpha Controls Refraction Strength. */
                  float alpha = abs(distortion) * heatMask * 0.22;
                  gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
              }
            `,
        });

        const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        scene.add(quad);

        //Animation.
        let raf;
        const animate = () => {
            uniforms.uTime.value += 0.016;
            renderer.render(scene, camera);
            raf = requestAnimationFrame(animate);
        };
        animate();

        //Resize.
        const onResize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            renderer.setSize(w, h);
            uniforms.uResolution.value.set(w, h);
        };
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} className="heat-webgl" aria-hidden />;
}
