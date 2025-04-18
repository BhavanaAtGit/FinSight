import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const ThreeDGraph = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.6);
    mountRef.current.appendChild(renderer.domElement);

    // Grid Helper (White Grid)
    const gridHelper = new THREE.GridHelper(10, 20, 0xffffff, 0x888888);
    scene.add(gridHelper);

    // Blue Line Material
    const material = new THREE.LineBasicMaterial({ color: 0x0077ff });

    // Generate 3D Sine Wave Data
    let points = [];
    for (let i = -5; i <= 5; i += 0.2) {
      let x = i;
      let y = Math.sin(i) * 2;
      let z = Math.cos(i) * 2;
      points.push(new THREE.Vector3(x, y, z));
    }

    // Create Line Geometry
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    // Camera Position
    camera.position.set(0, 2, 10);

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      line.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default ThreeDGraph;
