import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import logoPng from '../assets/crave-logo-4000px.png'

type LayerType = 'crumb' | 'cream' | 'chunk'

// Parfait layering matched to the reference photo: crumb base, cream,
// diced-strawberry, a thin crumb line, cream, diced-strawberry, cream cap.
const LAYERS: { height: number; type: LayerType }[] = [
  { height: 0.34, type: 'crumb' },
  { height: 0.3, type: 'cream' },
  { height: 0.22, type: 'chunk' },
  { height: 0.12, type: 'crumb' },
  { height: 0.3, type: 'cream' },
  { height: 0.22, type: 'chunk' },
  { height: 0.2, type: 'cream' },
]

const WALL_RADIUS = 1
const RIM_RADIUS = 1.05
const BODY_BOTTOM = -1
const BODY_TOP = 1
const LID_RADIUS = 1.08
const LID_HEIGHT = 0.5
const BASE_CAMERA_Z = 7.5

// Wide-mouth glass jar silhouette: tapered foot, straight wall, flared rim
// lip — revolved as a lathe so it reads as an actual jar, not a plain tube.
const BODY_PROFILE: [number, number][] = [
  [0, BODY_BOTTOM],
  [WALL_RADIUS * 0.85, BODY_BOTTOM],
  [WALL_RADIUS * 0.85, BODY_BOTTOM + 0.05],
  [WALL_RADIUS, BODY_BOTTOM + 0.15],
  [WALL_RADIUS, BODY_TOP - 0.15],
  [RIM_RADIUS, BODY_TOP - 0.05],
  [RIM_RADIUS, BODY_TOP],
  [0, BODY_TOP],
]

function speckleTexture(base: string, speckles: string[], seed: number) {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, size, size)
    // Simple deterministic PRNG so the texture is stable across re-renders.
    let s = seed
    const rand = () => {
      s = (s * 9301 + 49297) % 233280
      return s / 233280
    }
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = speckles[Math.floor(rand() * speckles.length)]
      const x = rand() * size
      const y = rand() * size
      const r = 3 + rand() * 7
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function useLayerTextures() {
  const base = useMemo(
    () => ({
      crumb: speckleTexture('#c99a5b', ['#a9782f', '#e0b877', '#8a6224'], 7),
      chunk: speckleTexture('#c81f3f', ['#e0435f', '#8f0f28', '#f2607a'], 19),
    }),
    [],
  )

  // One clone per band so each can tile at a density matched to its own
  // height — otherwise a short band and a tall band show identically sized
  // (and on short bands, stretched) speckles.
  return useMemo(
    () =>
      LAYERS.map((layer) => {
        if (layer.type === 'cream') return undefined
        const tex = base[layer.type].clone()
        tex.repeat.set(4, Math.max(1, Math.round(layer.height * 4)))
        tex.needsUpdate = true
        return tex
      }),
    [base],
  )
}

function useLidRidgeTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 8
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (ctx) {
      for (let i = 0; i < canvas.height; i++) {
        ctx.fillStyle = i % 4 < 2 ? '#050505' : '#1c1c1c'
        ctx.fillRect(0, i, canvas.width, 1)
      }
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, 22)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])
}

function Jar({ getProgress }: { getProgress: () => number }) {
  const group = useRef<THREE.Group>(null)
  const spin = useRef(0)
  const logoTexture = useTexture(logoPng)
  const lidRidgeTexture = useLidRidgeTexture()
  const layerTextures = useLayerTextures()
  const { camera } = useThree()

  const bodyPoints = useMemo(
    () => BODY_PROFILE.map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  )

  useFrame((_, delta) => {
    if (!group.current) return
    // Continuous slow idle spin, nudged further by scroll position — no
    // gyroscope/tilt, reliable on any phone.
    spin.current += delta * 0.2
    const scrollOffset = (window.scrollY || 0) * 0.0025
    group.current.rotation.y = spin.current + scrollOffset

    // Portal zoom: as the hero scrolls past, the jar grows toward the
    // camera and the camera dollies in, selling a "fly through" transition.
    const progress = getProgress()
    const scale = 1 + progress * 2.4
    group.current.scale.setScalar(scale)
    camera.position.z = BASE_CAMERA_Z - progress * 4.2
  })

  let cursor = BODY_BOTTOM + 0.15
  const bands = LAYERS.map((layer, i) => {
    const bandY = cursor + layer.height / 2
    cursor += layer.height
    const map = layerTextures[i]
    const color = layer.type === 'cream' ? '#faf1ea' : '#ffffff'
    return (
      <mesh key={i} position={[0, bandY, 0]}>
        <cylinderGeometry args={[WALL_RADIUS * 0.94, WALL_RADIUS * 0.94, layer.height, 48]} />
        <meshStandardMaterial map={map} color={color} roughness={0.9} metalness={0} />
      </mesh>
    )
  })

  const lidCenter = BODY_TOP + LID_HEIGHT / 2

  return (
    <group ref={group}>
      {/* Glass body — lathe-revolved profile for the tapered foot + flared rim */}
      <mesh>
        <latheGeometry args={[bodyPoints, 48]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.16}
          roughness={0.05}
          transmission={0.92}
          thickness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {bands}

      {/* Lid — separate band sitting on the rim, ridged sides (screw threads), flat matte top */}
      <mesh position={[0, lidCenter, 0]}>
        <cylinderGeometry args={[LID_RADIUS, LID_RADIUS, LID_HEIGHT, 48]} />
        <meshStandardMaterial attach="material-0" map={lidRidgeTexture} roughness={0.55} metalness={0.1} />
        <meshStandardMaterial attach="material-1" color="#0a0a0a" roughness={0.4} metalness={0.1} />
        <meshStandardMaterial attach="material-2" color="#050505" roughness={0.6} metalness={0} />
      </mesh>

      {/* Knockout logo on the lid's front face — faces the camera at rest and
          swings in/out of view as the jar spins. */}
      <mesh position={[0, lidCenter, LID_RADIUS + 0.01]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshStandardMaterial map={logoTexture} transparent roughness={1} />
      </mesh>
    </group>
  )
}

export function HeroJar({ getProgress = () => 0 }: { getProgress?: () => number }) {
  const [flashKey, setFlashKey] = useState(0)
  const triggerFlash = () => setFlashKey((k) => k + 1)

  return (
    <div
      className="relative h-full w-full"
      onPointerEnter={triggerFlash}
      onPointerDown={triggerFlash}
    >
      <Canvas
        camera={{ position: [0, 0.26, BASE_CAMERA_Z], fov: 36 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 4]} intensity={1.1} />
        <directionalLight position={[-3, 2, -4]} intensity={0.4} />
        <Suspense fallback={null}>
          <Jar getProgress={getProgress} />
        </Suspense>
      </Canvas>
      {flashKey > 0 && (
        <div key={flashKey} aria-hidden="true" className="jar-flash pointer-events-none absolute inset-0" />
      )}
    </div>
  )
}
