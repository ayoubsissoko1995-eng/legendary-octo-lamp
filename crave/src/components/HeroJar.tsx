import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import logoPng from '../assets/crave-logo-4000px.png'

// Cheesecake layers, bottom to top — flat colors only, no gradients/texturing,
// per brand rule. Kept procedural (primitives) for load-time on mobile.
const LAYERS = [
  { height: 0.5, color: '#e7c98f' }, // biscuit base
  { height: 0.75, color: '#faf6ef' }, // cheesecake cream
  { height: 0.45, color: '#c8203f' }, // strawberry compote
]

const WALL_RADIUS = 1
const RIM_RADIUS = 1.05
const BODY_BOTTOM = -1
const BODY_TOP = 1
const LID_RADIUS = 1.08
const LID_HEIGHT = 0.5

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

function Jar() {
  const group = useRef<THREE.Group>(null)
  const spin = useRef(0)
  const logoTexture = useTexture(logoPng)
  const lidRidgeTexture = useLidRidgeTexture()

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
  })

  let cursor = BODY_BOTTOM + 0.15
  const bands = LAYERS.map((layer, i) => {
    const bandY = cursor + layer.height / 2
    cursor += layer.height
    return (
      <mesh key={i} position={[0, bandY, 0]}>
        <cylinderGeometry args={[WALL_RADIUS * 0.94, WALL_RADIUS * 0.94, layer.height, 48]} />
        <meshStandardMaterial color={layer.color} roughness={0.9} metalness={0} />
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

export function HeroJar() {
  const [flashKey, setFlashKey] = useState(0)
  const triggerFlash = () => setFlashKey((k) => k + 1)

  return (
    <div
      className="relative h-full w-full"
      onPointerEnter={triggerFlash}
      onPointerDown={triggerFlash}
    >
      <Canvas
        camera={{ position: [0, 0.26, 7.5], fov: 36 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 4]} intensity={1.1} />
        <directionalLight position={[-3, 2, -4]} intensity={0.4} />
        <Suspense fallback={null}>
          <Jar />
        </Suspense>
      </Canvas>
      {flashKey > 0 && (
        <div key={flashKey} aria-hidden="true" className="jar-flash pointer-events-none absolute inset-0" />
      )}
    </div>
  )
}
