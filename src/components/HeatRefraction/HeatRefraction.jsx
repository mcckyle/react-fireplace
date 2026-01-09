//Filename: HeatRefraction.jsx
//Author: Kyle McColgan
//Date: 8 January 2026
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

        /* Scene Setup. */
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
            powerPreference: "high-performance",
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        /* Uniforms. */
        const uniforms = {
            uTime: { value: 0 },
            uResolution: {
                value: new THREE.Vector2(
                    container.clientWidth,
                    container.clientHeight
                ),
            },
        };

        /* Material. */
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms,
            vertexShader: `
              void main() {
                  gl_Position = vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              precision highp float;

              uniform float uTime;
              uniform vec2 uResolution;

              // Hash + value noise...
              float hash(vec2 p) {
                  p = fract(p * vec2(123.34, 456.21));
                  p += dot(p, p + 45,32);
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

              void main() {
                  vec2 uv = gl_FragCoord.xy / uResolution;

                  /* Heat Strength by Height. */
                  float base = smoothstep(0.05, 0.4, uv.y);
                  float fade = 1.0 - smoothstep(0.55, 0.95, uv.y);
                  float heightMask = base * fade;

                  /* Slow, Upward Convection. */
                  float t = uTime * 0.12;
                  vec2 flow = vec2(0.0, -t);

                  float n1 = noise(uv * 14.0 + flow);
                  float n2 = noise(uv * 28.0 - flow * 1.3);

                  float distortion = (n1 * 0.6 + n2 * 0.4 - 0.5);

                  /* Vertical Bias (Heat Rises). */
                  vec2 offset = vec2(
                      distortion * 0.015,
                      distortion * 0.035
                  ) * heightMask;

                  /* Invisible Refraction Layer. */
                  float alpha = abs(distortion) * heightMask * 0.22;
                  gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
              }
            `,
        });

        const quad = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            material
        );

        scene.add(quad);

        /* Animation. */
        let raf;
        const animate = () => {
            uniforms.uTime.value += 0.016;
            renderer.render(scene, camera);
            raf = requestAnimationFrame(animate);
        };

        animate();

        /* Resize. */
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

    return (
        <div
          ref={mountRef}
          className="heat-webgl"
          aria-hidden
        />
    );
}
