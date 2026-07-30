"use client";

import { useEffect, useRef } from "react";

const vertexShader = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

// Smoke preset supplied for the About sky. It deliberately keeps the packed
// WebGL1 uniform interface so the visual recipe can be adjusted without a library.
const fragmentShader = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec3 u_colors[8];
uniform vec4 u_scene;
uniform vec4 u_shape;
uniform vec4 u_surface;
uniform vec4 u_finish;
uniform vec4 u_transform;
uniform vec4 u_space;
uniform vec4 u_cursor;

#define u_resolution u_scene.xy
#define u_time u_scene.z
#define u_colorCount u_scene.w
#define u_scale u_shape.x
#define u_intensity u_shape.y
#define u_detail u_surface.x
#define u_contrast u_surface.y
#define u_brightness u_surface.z
#define u_saturation u_surface.w
#define u_seed u_transform.x

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + 1.0), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(17.0, 9.2); a *= 0.5; }
  return v;
}
vec3 palette(float x) {
  float f = clamp(x, 0.0, 1.0) * max(u_colorCount - 1.0, 1.0);
  vec3 col = u_colors[0];
  for (int i = 0; i < 7; i++) if (float(i) < u_colorCount - 1.0)
    col = mix(col, u_colors[i + 1], smoothstep(0.0, 1.0, clamp(f - float(i), 0.0, 1.0)));
  return col;
}
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  p *= u_scale;
  float t = u_time;
  vec2 q = vec2(fbm(p + t * 0.08), fbm(p + vec2(5.2, 1.3) - t * 0.06));
  vec2 r = vec2(fbm(p + (2.0 + u_intensity * 4.0) * q + vec2(1.7, 9.2)), fbm(p + (2.0 + u_intensity * 4.0) * q + vec2(8.3, 2.8)));
  vec3 col = palette(fbm(p + 3.0 * r + u_seed));
  col = (col - 0.5) * u_contrast + 0.5;
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(luma), col, u_saturation) + u_brightness;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export function SmokeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) return;
    const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vertex || !fragment) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    const buffer = gl.createBuffer();
    if (!buffer) return;
    gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const colors = uniform("u_colors");
    if (colors) gl.uniform3fv(colors, new Float32Array([.012, .110, .149, .106, .424, .659, .353, .824, .957, .918, .976, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
    const set4 = (name: string, a: number, b: number, c: number, d: number) => { const loc = uniform(name); if (loc) gl.uniform4f(loc, a, b, c, d); };
    set4("u_shape", 1.72, .60, .50, 0); set4("u_surface", 2.40, 1.22, 0, 1);
    set4("u_finish", 0, 0, 0, 0); set4("u_transform", 635, 0, 0, 0);
    set4("u_space", 0, 0, 0, 0); set4("u_cursor", 0, 2, .65, .46);
    const scene = uniform("u_scene");
    let width = 1, height = 1, frame = 0, started = performance.now();
    const resize = () => { const rect = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2); width = Math.max(1, Math.round(rect.width * dpr)); height = Math.max(1, Math.round(rect.height * dpr)); if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; gl.viewport(0, 0, width, height); } };
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
    const render = (now: number) => { if (scene) gl.uniform4f(scene, width, height, ((now - started) / 1000) * .97, 4); gl.drawArrays(gl.TRIANGLES, 0, 3); frame = requestAnimationFrame(render); };
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else if (!frame) { started = performance.now(); frame = requestAnimationFrame(render); } };
    document.addEventListener("visibilitychange", visibility); frame = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener("visibilitychange", visibility); gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment); };
  }, []);
  return <canvas ref={canvasRef} className="smoke-canvas" aria-hidden="true" />;
}
