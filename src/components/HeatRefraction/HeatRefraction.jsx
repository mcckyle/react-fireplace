//Filename: HeatRefraction.jsx
//Author: Kyle McColgan
//Date: 9 May 2026
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
                float amp = 0.5;
                for (int i = 0; i < 5; i++)
                {
                    value += amp * noise(p);
                    p *= 2.0;
                    amp *= 0.5;
                }
                return value;
              }

              /* Main. */
              void main()
              {
                  vec2 uv = gl_FragCoord.xy / uResolution;

                  /* Heat Column Shape. */
                  float center = 1.0 - abs(uv.x - 0.5) * 2.0;
                  center = smoothstep(0.0, 0.9, center);

                  /* Vertical Heat Column. */
                  float lower = smoothstep(0.02, 0.22, uv.y);
                  float upper = 1.0 - smoothstep(0.52, 0.96, uv.y);
                  float heatMask = center * lower * upper;

                  /* Time. */
                  float t = uTime * 0.16;

                  /* Large Convection Flow. */
                  vec2 convection = vec2(fbm(uv * 1.4 + vec2(0.0, -t, 0.18)) - 0.5, fbm(uv * 1.1 - vec2(0.0, t * 0.12)));

                  /* Thermal Turbulence. */
                  float turbulenceLarge = fbm(uv * 3.0 + convection * 1.2 + vec2(0.0, -t * 0.8));
                  float turbulenceMedium = fbm(uv * 8.0 - convection * 1.4 + vec2(0.0, -t * 1.4));
                  float turbulenceFine = fbm(uv * 20.0 + convection * 2.0 + vec2(0.0, -t * 2.6));

                  /* Distortion Composition. */
                  float distortion = (turbulenceLarge * 0.55 + turbulenceMedium * 0.32 + turbulenceFine * 0.13) - 0.5;

                  /* Thermal Pulsing. */
                  float pulse = 0.94 + sin(uTime * 0.7 + uv.y * 12.0) * 0.06;

                  /* Anisotropic Refraction. */
                  vec2 offset = vec2(distortion * 0.028, distortion * 0.085) * heatMask * pulse;

                  /* Depth Falloff. */
                  float fade = smoothstep(0.0, 0.22, uv.y);
                  fade *= 1.0 - smoothstep(0.74, 1.0, uv.y);

                  /* Final Alpha. */
                  float alpha = abs(offset.y) * heatMask * fade * 0.16;
                  gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
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
