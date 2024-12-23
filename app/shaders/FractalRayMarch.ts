import { ShaderMaterial, Uniform, Vector2 } from 'three';

interface FractalRayMarchUniforms {
  tDiffuse: { value: null | THREE.Texture };
  u_time: { value: number };
  u_amplitude: { value: number };
  u_resolution: { value: [number, number] };
  u_frequencyData: { value: Float32Array };
  u_bassIntensity: { value: number };
  u_midIntensity: { value: number };
  u_trebleIntensity: { value: number };
}

export const FractalRayMarchShader: {
  uniforms: { [K in keyof FractalRayMarchUniforms]: Uniform };
  vertexShader: string;
  fragmentShader: string;
} = {
  uniforms: {
    'tDiffuse': new Uniform(null),
    'u_time': new Uniform(0.0),
    'u_amplitude': new Uniform(0.5),
    'u_resolution': new Uniform([800.0, 600.0]),
    'u_frequencyData': new Uniform(new Float32Array(128)),
    'u_bassIntensity': new Uniform(0.0),
    'u_midIntensity': new Uniform(0.0),
    'u_trebleIntensity': new Uniform(0.0)
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
    uniform float u_time;
    uniform float u_amplitude;
    uniform vec2 u_resolution;
    uniform float u_frequencyData[128];
    uniform float u_bassIntensity;
    uniform float u_midIntensity;
    uniform float u_trebleIntensity;
    
    varying vec2 vUv;
    
    const int MAX_STEPS = 100;
    const float MIN_DIST = 0.001;
    const float MAX_DIST = 100.0;
    const float EPSILON = 0.0001;
    
    // Mandelbulb distance estimation
    float mandelbulbDE(vec3 pos) {
      vec3 z = pos;
      float dr = 1.0;
      float r = 0.0;
      float power = 8.0 + u_bassIntensity * 4.0; // Audio-reactive power
      
      for(int i = 0; i < 15; i++) {
        r = length(z);
        if(r > 2.0) break;
        
        // Convert to polar coordinates
        float theta = acos(z.z/r);
        float phi = atan(z.y, z.x);
        dr = pow(r, power-1.0) * power * dr + 1.0;
        
        // Scale by audio frequency
        float freqScale = u_frequencyData[i * 8] * 0.01;
        
        // Scale and rotate
        float zr = pow(r, power);
        theta = theta * power;
        phi = phi * power;
        
        // Convert back to cartesian coordinates
        z = zr * vec3(
          sin(theta) * cos(phi),
          sin(theta) * sin(phi),
          cos(theta)
        );
        z += pos * (1.0 + freqScale);
      }
      return 0.5 * log(r) * r / dr;
    }
    
    // Ray marching
    float rayMarch(vec3 ro, vec3 rd) {
      float depth = 0.0;
      
      for(int i = 0; i < MAX_STEPS; i++) {
        vec3 pos = ro + depth * rd;
        float dist = mandelbulbDE(pos) * u_amplitude;
        
        if(dist < MIN_DIST) return depth;
        depth += dist;
        if(depth >= MAX_DIST) break;
      }
      
      return MAX_DIST;
    }
    
    // Normal calculation
    vec3 calcNormal(vec3 pos) {
      vec2 e = vec2(1.0, -1.0) * EPSILON;
      return normalize(
        e.xyy * mandelbulbDE(pos + e.xyy) +
        e.yyx * mandelbulbDE(pos + e.yyx) +
        e.yxy * mandelbulbDE(pos + e.yxy) +
        e.xxx * mandelbulbDE(pos + e.xxx)
      );
    }
    
    void main() {
      // Screen coordinates
      vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
      
      // Ray origin and direction
      vec3 ro = vec3(0.0, 0.0, -2.0);
      vec3 rd = normalize(vec3(uv, 1.0));
      
      // Rotate ray based on time and audio
      float rotSpeed = u_midIntensity * 0.5;
      float rotAngle = u_time * rotSpeed;
      mat2 rot = mat2(cos(rotAngle), -sin(rotAngle), sin(rotAngle), cos(rotAngle));
      rd.xz = rot * rd.xz;
      
      // Ray march
      float dist = rayMarch(ro, rd);
      vec4 color = texture2D(tDiffuse, vUv);
      
      
      if(dist < MAX_DIST) {
        vec3 pos = ro + rd * dist;
        vec3 normal = calcNormal(pos);
        
        // Audio-reactive coloring
        vec3 fractalColor = vec3(
          0.5 + 0.5 * sin(u_time + normal.x * 2.0 + u_bassIntensity),
          0.5 + 0.5 * sin(u_time + normal.y * 2.0 + u_midIntensity),
          0.5 + 0.5 * sin(u_time + normal.z * 2.0 + u_trebleIntensity)
        );
        
        // Mix with original scene
        color.rgb = mix(color.rgb, fractalColor, 0.5);
      }
      
      gl_FragColor = color;
    }
  `
};
