import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import logoPng from '../assets/crave-logo-4000px.png'

// Cheesecake layers, bottom to top — flat colors only, no gradients/texturing,
// per brand rule. Kept procedural (primitives) for load-time on mobile.
const LAYERS = [
  { height: 0.9, color: '#e7c98f' }, // biscuit base
  { height: 0.7, color: '#e8598c' }, // strawberry
  { height: 1.1, color: '#faf6ef' }, // cream
]

const BODY_RADIUS = 1
const BODY_BOTTOM = -1.3

function Jar() {
  const group = useRef<THREE.Group>(null)
  const logoTexture = useTexture(logoPng)

  useFrame(() => {
    if (!group.current) return
    // Scroll-driven rotation only — no gyroscope/tilt, reliable on any phone.
    group.current.rotation.y = (window.scrollY || 0) * 0.0025
  })

  let cursor = BODY_BOTTOM
  const bands = LAYERS.map((layer, i) => {
    const bandY = cursor + layer.height / 2
    cursor += layer.height
    return (
      <mesh key={i} position={[0, bandY, 0]}>
        <cylinderGeometry args={[BODY_RADIUS * 0.95, BODY_RADIUS * 0.95, layer.height, 48]} />
        <meshStandardMaterial color={layer.color} roughness={0.9} metalness={0} />
      </mesh>
    )
  })

  const jarTop = cursor

  return (
    <group ref={group}>
      {/* Glass body */}
      <mesh position={[0, BODY_BOTTOM + 1.35, 0]}>
        <cylinderGeometry args={[BODY_RADIUS, BODY_RADIUS, 2.9, 48, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.18}
          roughness={0.05}
          transmission={0.9}
          thickness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {bands}

      {/* Lid */}
      <mesh position={[0, jarTop + 0.2, 0]}>
        <cylinderGeometry args={[BODY_RADIUS * 1.05, BODY_RADIUS * 1.05, 0.4, 48]} />
        <meshStandardMaterial color="#000000" roughness={0.6} metalness={0} />
      </mesh>

      {/* Knockout logo on the lid's front face — faces the camera at rest and
          swings in/out of view as the jar rotates with scroll. */}
      <mesh position={[0, jarTop + 0.2, BODY_RADIUS * 1.05 + 0.01]}>
        <planeGeometry args={[0.85, 0.42]} />
        <meshStandardMaterial map={logoTexture} transparent roughness={1} />
      </mesh>
    </group>
  )
}

export function HeroJar() {
  return (
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
  )
}
