import { ShaderMaterial, Uniform } from 'three';

export const PsychedelicTransitionMaterial = new ShaderMaterial({
  uniforms: {
    tDiffuse: new Uniform(null),
    time: new Uniform(0),
    amplitude: new Uniform(0),
    colorCycle: new Uniform(0),
    distortion: new Uniform(0.5)
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float amplitude;
    uniform float colorCycle;
    uniform float distortion;
    varying vec2 vUv;

    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    void main() {
      vec2 uv = vUv;
      
      // Apply wave distortion based on amplitude
      float wave = sin(uv.y * 10.0 + time) * cos(uv.x * 8.0 - time * 0.5);
      uv.x += wave * amplitude * distortion * 0.02;
      uv.y += wave * amplitude * distortion * 0.015;
      
      
      // Color cycling
      vec4 texel = texture2D(tDiffuse, uv);
      float hue = fract(colorCycle + length(uv - 0.5) * 0.2);
      vec3 psychColor = hsv2rgb(vec3(hue, 0.7, texel.r));
      
      // Mix original and psychedelic colors based on amplitude
      gl_FragColor = vec4(mix(texel.rgb, psychColor, amplitude * 0.7), 1.0);
    }
  `
});
