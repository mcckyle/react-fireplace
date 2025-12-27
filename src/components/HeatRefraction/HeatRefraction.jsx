//Filename: HeatRefraction.jsx
//Author: Kyle McColgan
//Date: 25 December 2025
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

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            powerPreference: "high-performance",
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        const uniforms = {
            uTime: { value: 0 },
            uResolution: {
                value: new THREE.Vector2(
                    container.clientWidth,
                    container.clientHeight
                ),
            },
        };

        const material = new THREE.ShaderMaterial({
            transparent: true,
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

              float noise(vec2 p) {
                  return sin(p.x) * sin(p.y);
              }

              void main() {
                  vec2 uv = gl_FragCoord.xy / uResolution;

                  //Vertical heat falloff.
                  float height = smoothstep(0.2, 0.9, uv.y);

                  //Animated turbulence.
                  float t = uTime * 0.6;
                  float n =
                    noise(uv * 18.0 + vec2(0.0, t)) +
                    noise(uv * 36.0 - vec2(t * 0.7, 0.0)) * 0.5;

                  float distortion = n * 0.015 * height;

                  vec2 offset = vec2(
                      distortion,
                      distortion * 1.6
                  );

                  //Fake refraction via screen-space offset.
                  gl_FragColor = vec4(1.0, 1.0, 1.0, 0.08 * height);
                  gl_FragColor.a += abs(distortion) * 4.0;
              }
            `,
        });

        const quad = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            material
        );

        scene.add(quad);

        let raf;
        const animate = () => {
            uniforms.uTime.value += 0.016;
            renderer.render(scene, camera);
            raf = requestAnimationFrame(animate);
        };

        animate();

        const onResize = () => {
            renderer.setSize(container.clientWidth, container.clientHeight);
            uniforms.uResolution.value.set(
                container.clientWidth,
                container.clientHeight
            );
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
