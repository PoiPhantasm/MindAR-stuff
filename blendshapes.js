import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from 'mindar-face-three';

class Avatar {
    constructor() {
        this.gltf = null;
        this.morphTargetMeshes = [];
    }
    async init() {
        const url = "https://assets.codepen.io/9177687/raccoon_head.glb";
        const gltf = await new Promise((resolve) => {
            const loader = new GLTFLoader();
            loader.load(url, (gltf) => {
                resolve(gltf);
            });
        });
        gltf.scene.traverse((object) => {
            if ((object).isBone && !this.root) {
                this.root = object;
            }
            if (!(object).isMesh) return
            const mesh = object;
            if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return
            this.morphTargetMeshes.push(mesh);
        });
        this.gltf = gltf;
    }
    updateBlendshapes(blendshapes) {
        const categories = blendshapes.categories;
        let coefsMap = new Map();
        for (let i = 0; i < categories.length; ++i) {
            coefsMap.set(categories[i].categoryName, categories[i].score);
        }
        for (const mesh of this.morphTargetMeshes) {
            if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) {
                continue;
            }
            for (const [name, value] of coefsMap) {
                if (!Object.keys(mesh.morphTargetDictionary).includes(name)) {
                    continue;
                }
                const idx = mesh.morphTargetDictionary[name];
                mesh.morphTargetInfluences[idx] = value;
            }
        }
    }
}

let mindarThree = null;
let avatar = null;

const setup = async () => {
    avatar = new Avatar();
    mindarThree = new MindARThree({
        container: document.querySelector("#container"),
    });
    const { renderer, scene, camera } = mindarThree;
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);
    const anchor = mindarThree.addAnchor(1);
    await avatar.init();
    avatar.gltf.scene.scale.set(2, 2, 2);
    anchor.group.add(avatar.gltf.scene);
}

const capture = (mindarThree) => {
    const {video, renderer, scene, camera} = mindarThree;
    const renderCanvas = renderer.domElement;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = renderCanvas.width;
    canvas.height = renderCanvas.height;

    const sx = (video.clientWidth - renderCanvas.clientWidth) / 2 * video.videoWidth / video.clientWidth;
    const sy = (video.clientHeight - renderCanvas.clientHeight) / 2 * video.videoHeight / video.clientHeight;
    const sw = video.videoWidth - sx * 2; 
    const sh = video.videoHeight - sy * 2; 

    context.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    
    renderer.preserveDrawingBuffer = true;
    renderer.render(scene, camera);
    context.drawImage(renderCanvas, 0, 0, canvas.width, canvas.height);
    renderer.preserveDrawingBuffer = false;

    const data = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'photo.png';
    link.href = data;
    link.click();
}

const start = async () => {
    if (!mindarThree) {
        await setup();
    }
    await mindarThree.start();
    const { renderer, scene, camera } = mindarThree;
    const feedVideo = document.querySelector("#video-feed");
    feedVideo.srcObject = mindarThree.video.srcObject.clone();
    feedVideo.play();
    renderer.setAnimationLoop(() => {
        const estimate = mindarThree.getLatestEstimate();
        if (estimate && estimate.blendshapes) {
            avatar.updateBlendshapes(estimate.blendshapes);
        }
        renderer.render(scene, camera);
    });

    const toggleButton = document.getElementById('toggle-video-feed');
    toggleButton.addEventListener('click', () => {
        if (feedVideo.style.display === 'none') {
            feedVideo.style.display = 'block';
        } else {
            feedVideo.style.display = 'none';
        }
    });

    const captureButton = document.getElementById('capture');
    captureButton.addEventListener('click', () => {
        capture(mindarThree);
    });

    // Add switch camera functionality
    const switchButton = document.getElementById('switch');
    switchButton.addEventListener('click', () => {
        if (mindarThree) {
            mindarThree.switchCamera();
        }
    });
}

start();
