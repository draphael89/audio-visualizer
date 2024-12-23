export const ChromaticAberrationShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'distortion': { value: 0.5 },
    'time': { value: 0 }
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
    uniform float distortion;
    uniform float time;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      
      // Time-based wave distortion
      float wave = sin(uv.y * 10.0 + time) * 0.01 * distortion;
      
      // Sample each color channel with offset
      float r = texture2D(tDiffuse, vec2(uv.x + wave + distortion * 0.01, uv.y)).r;
      float g = texture2D(tDiffuse, vec2(uv.x + wave, uv.y)).g;
      float b = texture2D(tDiffuse, vec2(uv.x + wave - distortion * 0.01, uv.y)).b;
      
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `
};