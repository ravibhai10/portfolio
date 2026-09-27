import { useEffect, useRef, useState } from 'react'

/**
 * LiquidLogo Canvas
 * Inspired by github.com/paper-design/liquid-logo & paper-design shaders.
 * Renders the brand wordmark "ravikumar gupta" with a fluid chrome / liquid
 * metal WebGL2 shader.
 */

/** The wordmark rasterized into the shader mask. */
const TEXT = 'Ravikumar Gupta'

/** Display box of the mark inside the 62px navbar. */
const DISPLAY_W = 150
const DISPLAY_H = 28

const VS_SOURCE = `#version 300 es
precision highp float;
in vec2 a_position;
out vec2 vUv;
void main() {
    vUv = 0.5 * (a_position + 1.0);
    gl_Position = vec4(a_position, 0.0, 1.0);
}`

const FS_SOURCE = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D u_image_texture;
uniform float u_time;
uniform float u_ratio;
uniform float u_speed;
uniform float u_refraction;

#define PI 3.14159265358979323846

vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 permute(vec3 x) { return mod289(((x*34.)+1.)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
    m = m*m;
    m = m*m;
    vec3 x = 2. * fract(p * C.www) - 1.;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130. * dot(m, g);
}

vec2 rotate(vec2 uv, float th) {
    return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

void main() {
    vec2 uv = vUv;
    vec4 maskSample = texture(u_image_texture, uv);
    float alpha = maskSample.a;
    if (alpha < 0.02) {
        discard;
    }

    float t = u_time * 0.00065 * u_speed;
    vec2 aspectUv = vec2(uv.x * u_ratio, uv.y);

    float n = snoise(aspectUv * 2.4 - vec2(t * 1.2, t * 0.8));
    float n2 = snoise(aspectUv * 5.0 + vec2(t * 0.6, -t * 1.1));

    float dist = maskSample.r;
    vec2 pStep = vec2(1.0 / 640.0, 1.0 / 120.0);
    float dX = texture(u_image_texture, uv + vec2(pStep.x, 0.0)).r - texture(u_image_texture, uv - vec2(pStep.x, 0.0)).r;
    float dY = texture(u_image_texture, uv + vec2(0.0, pStep.y)).r - texture(u_image_texture, uv - vec2(0.0, pStep.y)).r;
    vec3 normal = normalize(vec3(-dX * 4.0, -dY * 4.0, 1.0));

    vec2 reflUv = rotate(uv - 0.5, PI * 0.25) + 0.5;
    float stripe = sin((reflUv.x + reflUv.y * 0.5 + normal.x * u_refraction + n * 0.08 - t) * 12.0);
    stripe = smoothstep(-0.4, 0.4, stripe);

    vec3 chromeDark = vec3(0.08, 0.08, 0.09);
    vec3 chromeMid = vec3(0.42, 0.40, 0.38);
    vec3 chromeBright = vec3(0.98, 0.96, 0.92);
    vec3 chromeWarmSheen = vec3(0.85, 0.55, 0.38);

    vec3 metal = mix(chromeDark, chromeMid, stripe);
    float highlight = pow(clamp(dot(normal, normalize(vec3(0.3, 0.6, 0.8))) + n2 * 0.15, 0.0, 1.0), 4.5);
    metal += chromeBright * highlight * 0.9;

    float edgeGlow = smoothstep(0.2, 0.9, dist) * (1.0 - smoothstep(0.85, 1.0, dist));
    metal += chromeWarmSheen * edgeGlow * 0.35;
    metal *= (0.4 + 0.6 * dist);

    fragColor = vec4(metal * alpha, alpha);
}
`
export default function LiquidLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const gl = canvas.getContext('webgl2', { alpha: true, antialias: true })
    if (!gl) {
      // No WebGL2 (or context creation refused): keep the static wordmark.
      setSupported(false)
      return
    }

    const createShader = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s)
        return null
      }
      return s
    }

    const vs = createShader(gl.VERTEX_SHADER, VS_SOURCE)
    const fs = createShader(gl.FRAGMENT_SHADER, FS_SOURCE)
    if (!vs || !fs) return

    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

    gl.useProgram(program)

    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const quadBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf)
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW)
    const posLoc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const offCanvas = document.createElement('canvas')
    const w = 640
    const h = 120
    offCanvas.width = w
    offCanvas.height = h
    const ctx = offCanvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    // Rasterize the wordmark into the offscreen mask. The mask is authored in a
    // dedicated texture space (640x120 = 5.33:1), not in screen pixels: the
    // shader reads it through u_ratio, so the canvas display size can stay
    // small while the glyphs keep enough resolution for a clean bevel.
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Auto-fit: measure at a probe size, then scale so the wordmark fills the
    // mask width without clipping, capped so ascenders/descenders stay inside.
    const padX = 22
    const probe = 100
    const fontFor = (size: number) =>
      `700 ${size}px Georgia, "Times New Roman", "Noto Serif", serif`
    ctx.letterSpacing = '0px'
    ctx.font = fontFor(probe)
    const probeWidth = ctx.measureText(TEXT).width || probe
    let fontSize = Math.min((probe * (w - padX * 2)) / probeWidth, h - 26)
    ctx.font = fontFor(fontSize)
    ctx.letterSpacing = `${Math.round(fontSize * 0.015)}px`
    const fitted = ctx.measureText(TEXT).width
    if (fitted > w - padX * 2) {
      fontSize *= (w - padX * 2) / fitted
      ctx.font = fontFor(fontSize)
      ctx.letterSpacing = `${Math.round(fontSize * 0.015)}px`
    }
    ctx.fillText(TEXT, w / 2, h / 2 + fontSize * 0.04)

    const imgData = ctx.getImageData(0, 0, w, h)
    const data = imgData.data
    const outImg = ctx.createImageData(w, h)
    const outData = outImg.data

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4
        const a = data[idx + 3]
        if (a > 20) {
          let minNeighbor = a
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const nx = Math.min(w - 1, Math.max(0, x + dx))
              const ny = Math.min(h - 1, Math.max(0, y + dy))
              const nIdx = (ny * w + nx) * 4
              minNeighbor = Math.min(minNeighbor, data[nIdx + 3])
            }
          }
          const bevel = minNeighbor / 255
          outData[idx] = Math.round(bevel * 255)
          outData[idx + 1] = Math.round(bevel * 255)
          outData[idx + 2] = Math.round(bevel * 255)
          outData[idx + 3] = a
        }
      }
    }
    ctx.putImageData(outImg, 0, 0)

    const tex = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    // 2D-canvas rasters are top-left origin; WebGL samples bottom-left. Flip on
    // upload so the wordmark reads upright instead of mirrored.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, outImg.data)

    const uTime = gl.getUniformLocation(program, 'u_time')
    const uRatio = gl.getUniformLocation(program, 'u_ratio')
    const uSpeed = gl.getUniformLocation(program, 'u_speed')
    const uRefr = gl.getUniformLocation(program, 'u_refraction')
    const uTex = gl.getUniformLocation(program, 'u_image_texture')

    gl.uniform1i(uTex, 0)
    gl.uniform1f(uSpeed, 1.0)
    gl.uniform1f(uRefr, 0.45)

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const displayW = DISPLAY_W
    const displayH = DISPLAY_H
    canvas.width = displayW * dpr
    canvas.height = displayH * dpr
    canvas.style.width = displayW + 'px'
    canvas.style.height = displayH + 'px'
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform1f(uRatio, canvas.width / canvas.height)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    let rafId = 0
    let running = true

    const render = (time: number) => {
      if (!running) return
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(uTime, time)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(rafId)
      } else {
        if (!running) {
          running = true
          rafId = requestAnimationFrame(render)
        }
      }
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      document.removeEventListener('visibilitychange', onVisibility)
      gl.deleteTexture(tex)
      gl.deleteBuffer(quadBuf)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [])

  return (
    <div
      className={`liquid-logo-wrap${supported ? '' : ' is-fallback'}`}
      title="ravikumar gupta — Creative Full-Stack Developer"
    >
      <canvas ref={canvasRef} className="liquid-logo-canvas" aria-hidden="true" />
      <span className="liquid-logo-fallback">{TEXT}</span>
    </div>
  )
}

