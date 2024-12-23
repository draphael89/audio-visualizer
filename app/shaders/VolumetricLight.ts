import { Vector2, Uniform } from 'three';

interface VolumetricLightUniforms {
  tDiffuse: { value: null | THREE.Texture };
  lightPosition: { value: Vector2 };
  exposure: { value: number };
  decay: { value: number };
  density: { value: number };
  weight: { value: number };
  samples: { value: number };
}

export const VolumetricLightShader: {
  uniforms: { [K in keyof VolumetricLightUniforms]: Uniform };
  vertexShader: string;
  fragmentShader: string;
} = {
  uniforms: {
    'tDiffuse': new Uniform(null),
    'lightPosition': new Uniform(new Vector2(0.5, 0.5)),
    'exposure': new Uniform(0.3),
    'decay': new Uniform(0.95),
    'density': new Uniform(0.5),
    'weight': new Uniform(0.4),
    'samples': new Uniform(50)
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
    uniform vec2 lightPosition;
    uniform float exposure;
    uniform float decay;
    uniform float density;
    uniform float weight;
    uniform int samples;
    varying vec2 vUv;

    void main() {
      vec2 texCoord = vUv;
      vec2 deltaTextCoord = texCoord - lightPosition;
      deltaTextCoord *= 1.0 / float(samples) * density;
      vec4 color = texture2D(tDiffuse, texCoord);
      float illuminationDecay = 1.0;

      for(int i = 0; i < 50; i++) {
        if(i >= samples) break;
        texCoord -= deltaTextCoord;
        vec4 sample = texture2D(tDiffuse, texCoord);
        sample *= illuminationDecay * weight;
        color += sample;
        illuminationDecay *= decay;
      }
      
      gl_FragColor = color * exposure;
    }
  `
};
