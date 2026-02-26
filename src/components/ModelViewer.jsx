import React, { useRef, useState, useEffect, Suspense, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// 主持人模型组件
function HostModel({ modelPath, onLoad }) {
  const gltf = useLoader(GLTFLoader, modelPath);
  const [mixer, setMixer] = useState(null);
  const modelRef = useRef();

  useEffect(() => {
    if (gltf && gltf.scene) {
      // 调整模型位置和缩放
      gltf.scene.scale.set(1, 1, 1);
      gltf.scene.position.set(0, -1, 0);
      
      // 设置动画
      if (gltf.animations && gltf.animations.length > 0) {
        const newMixer = new THREE.AnimationMixer(gltf.scene);
        const action = newMixer.clipAction(gltf.animations[0]);
        action.play();
        newMixer.timeScale = 0.5; // 减慢动画速度
        setMixer(newMixer);
      }
      
      // 启用阴影
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      if (onLoad) onLoad(gltf);
    }
  }, [gltf, onLoad]);

  // 更新动画
  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);
  });

  return gltf ? <primitive object={gltf.scene} ref={modelRef} /> : null;
}

// 模特模型组件（支持换装）
function ModelWithClothing({ 
  humanModelPath, 
  clothingModelPath, 
  isHost = false,
  animationSpeed = 0.5 
}) {
  const humanGltf = useLoader(GLTFLoader, humanModelPath);
  const clothingGltf = useLoader(GLTFLoader, clothingModelPath);
  const [mixer, setMixer] = useState(null);
  const [humanSkeleton, setHumanSkeleton] = useState(null);
  const [clothingRoot, setClothingRoot] = useState(null);
  const humanRef = useRef();
  const clothingRef = useRef();

  useEffect(() => {
    if (humanGltf && humanGltf.scene) {
      // 调整模特位置和缩放
      humanGltf.scene.scale.set(isHost ? 0.8 : 1, isHost ? 0.8 : 1, isHost ? 0.8 : 1);
      humanGltf.scene.position.set(0, -1, 0);
      
      // 寻找人体骨架
      humanGltf.scene.traverse((child) => {
        if (child.isSkinnedMesh && child.skeleton && !humanSkeleton) {
          setHumanSkeleton(child.skeleton);
        }
      });
      
      // 设置动画
      if (humanGltf.animations && humanGltf.animations.length > 0) {
        const newMixer = new THREE.AnimationMixer(humanGltf.scene);
        const action = newMixer.clipAction(humanGltf.animations[0]);
        action.play();
        newMixer.timeScale = animationSpeed;
        setMixer(newMixer);
      }
      
      // 启用阴影
      humanGltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [humanGltf, isHost, animationSpeed]);

  useEffect(() => {
    if (clothingGltf && clothingGltf.scene && humanSkeleton) {
      // 将衣服绑定到人体骨架
      clothingGltf.scene.traverse((child) => {
        if (child.isSkinnedMesh && humanSkeleton) {
          // 绑定到人体骨架
          child.bind(humanSkeleton, child.bindMatrix);
        }
      });
      
      // 调整衣服位置和缩放以匹配人体
      clothingGltf.scene.scale.set(isHost ? 0.8 : 1, isHost ? 0.8 : 1, isHost ? 0.8 : 1);
      clothingGltf.scene.position.set(0, -1, 0);
      clothingGltf.scene.rotation.y = Math.PI; // 旋转180度使其面向相机
      
      setClothingRoot(clothingGltf.scene);
    }
  }, [clothingGltf, humanSkeleton, isHost]);

  // 更新动画
  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);
  });

  return (
    <>
      {humanGltf && <primitive object={humanGltf.scene} ref={humanRef} />}
      {clothingRoot && <primitive object={clothingRoot} ref={clothingRef} />}
    </>
  );
}

// 场景灯光配置
function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />
    </>
  );
}

// 主要3D查看器组件
const ModelViewer = forwardRef(({ 
  modelType = 'host', 
  style = '日常', 
  outfit = 'A',
  showControls = true,
  cameraPosition = [0, 1.2, 3],
  onModelLoad 
}, ref) => {
  const { camera, gl, scene } = useThree();
  const controlsRef = useRef();
  
  // 根据类型和风格确定模型路径
  const getModelPath = () => {
    const basePath = '/models';
    
    if (modelType === 'host') {
      return `${basePath}/host.glb`;
    }
    
    if (modelType === 'human') {
      return `${basePath}/${style}/${style}human.glb`;
    }
    
    if (modelType === 'clothing') {
      return `${basePath}/${style}/${style}${outfit}.glb`;
    }
    
    return `${basePath}/host.glb`;
  };

  // 截图方法
  const captureScreenshot = () => {
    // 渲染一帧以确保最新状态
    gl.render(scene, camera);
    
    // 获取canvas数据
    const dataURL = gl.domElement.toDataURL('image/png');
    return dataURL;
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    captureScreenshot,
    getScene: () => scene,
    getCamera: () => camera,
    getRenderer: () => gl
  }));

  return (
    <>
      <SceneLights />
      <Suspense fallback={<Html center><div style={{color: 'white'}}>加载模型中...</div></Html>}>
        {modelType === 'host' ? (
          <HostModel 
            modelPath={getModelPath()} 
            onLoad={onModelLoad}
          />
        ) : modelType === 'human-clothing' ? (
          <ModelWithClothing
            humanModelPath={`/models/${style}/${style}human.glb`}
            clothingModelPath={`/models/${style}/${style}${outfit}.glb`}
            animationSpeed={0.5}
          />
        ) : null}
      </Suspense>
      
      {showControls && <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={2}
        maxDistance={10}
      />}
    </>
  );
});

// 包装组件，提供完整的Canvas环境
const ModelViewerWrapper = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(true);
  const internalRef = useRef();

  // 合并refs
  useImperativeHandle(ref, () => internalRef.current);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.3)',
          zIndex: 10,
          color: 'white'
        }}>
          初始化3D场景...
        </div>
      )}
      
      <Canvas
        shadows
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        onCreated={() => setLoading(false)}
      >
        <PerspectiveCamera 
          makeDefault 
          position={props.cameraPosition || [0, 1.2, 3]} 
          fov={45} 
        />
        <ModelViewer ref={internalRef} {...props} />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
});

export default ModelViewerWrapper;