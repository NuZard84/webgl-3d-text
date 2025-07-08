import { type JSX, useEffect, useRef, useState } from 'react'
import './App.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/Addons.js'

function App(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Remove the unused mouse state since we're only setting it but never reading it
  const [_, setMouse] = useState({
    x: 0,
    y: 0,
  })

  useEffect(() => {
    if (!canvasRef.current) return

    // Move sizes inside useEffect to avoid dependency issues
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    const canvas = canvasRef.current
    const scene = new THREE.Scene()

    // const axesHelper = new THREE.AxesHelper(1)
    // scene.add(axesHelper)

    const textureloader = new THREE.TextureLoader()
    // Fix the texture path - it should be 'textures/matcaps' not 'texture/metcaps'
    const matcapTexture = textureloader.load(
      './textures/matcaps/8.png',
      // Success callback - removed unused parameter
      () => {
        console.log('Matcap texture loaded successfully')
      },
      // Progress callback
      undefined,
      // Error callback
      (error) => {
        console.error('Error loading matcap texture:', error)
      }
    )
    matcapTexture.colorSpace = THREE.SRGBColorSpace

    const fontLoader = new FontLoader()
    fontLoader.load(
      "/helvetiker_regular.typeface.json", 
      (font) => {
        console.log('Font loaded successfully:', font)
        const textGeo = new TextGeometry('Three JS is Cool', {
          font: font,
          size: 0.5,
          depth: 0.2,
          curveSegments: 5,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 4,
        })

        textGeo.center()
        
        const textMaterial = new THREE.MeshMatcapMaterial({
          matcap: matcapTexture,  
        })

        const textMesh = new THREE.Mesh(textGeo, textMaterial)
        scene.add(textMesh)

        const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
    
        for(let i = 0; i < 160; i++)
          {
             
              const donut = new THREE.Mesh(donutGeometry, textMaterial)
              donut.position.x = (Math.random() - 0.5) * 10
              donut.position.y = (Math.random() - 0.5) * 10
              donut.position.z = (Math.random() - 0.5) * 10
    
              donut.rotation.x = Math.random() * Math.PI * 2
              donut.rotation.y = Math.random() * Math.PI * 2
              
              const scale = Math.random()
              donut.scale.set(scale, scale, scale)
              scene.add(donut)
          }
      },
      // Progress callback
      undefined,
      // Error callback
      (error) => {
        console.error('Error loading font:', error)
      }
    )

    



    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.z = 3
    scene.add(camera)

    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    const renderer = new THREE.WebGLRenderer({
      canvas
    })
    renderer.setSize(sizes.width, sizes.height)

    // Remove unused clock variable
    // const clock = new THREE.Clock()

    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / sizes.width - 0.5) * 2,
        y: -(e.clientY / sizes.height - 0.5) * 2,
      })
    }

    const handleResize = (_: UIEvent) => {
      sizes.width = window.innerWidth
      sizes.height = window.innerHeight

      //update the camera
      camera.aspect = sizes.width / sizes.height
      camera.updateProjectionMatrix()

      //update the renderer
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(Math.min(window.devicePixelRatio, 2)))

    }

    const handleDoubleClick = (_: MouseEvent) => {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        canvas.requestFullscreen()
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)
    window.addEventListener('dblclick', handleDoubleClick)

    const tick = () => {
      controls.update()
      renderer.render(scene, camera)
      window.requestAnimationFrame(tick)
    }

    tick()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener("dblclick", handleDoubleClick)

      controls.dispose()
      renderer.dispose()
    }
  }, []) 

  return (
    <>
      <div className='hero'>
        <canvas ref={canvasRef} className='webgl'></canvas>
      </div>
    </>
  )
}

export default App