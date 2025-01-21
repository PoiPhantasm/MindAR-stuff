const THREE = window.MINDAR.FACE.THREE;

class CameraSwitcher {
    constructor(container = document.body) {
        this.container = container;
        this.mindarThree = null;
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    async initialize(config = {}) {
        // Create MindAR instance with custom or default config
        this.mindarThree = new window.MINDAR.FACE.MindARThree({
            container: this.container,
            ...config
        });

        // Create switch camera button if it doesn't exist
        if (!document.querySelector("#switch")) {
            const switchButton = document.createElement('button');
            switchButton.id = 'switch';
            switchButton.innerHTML = 'Switch Camera';
            switchButton.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 100;
                padding: 10px;
            `;
            this.container.appendChild(switchButton);
        }

        // Add event listener
        document.querySelector("#switch").addEventListener("click", () => this.switchCamera());

        return this.mindarThree;
    }

    async switchCamera() {
        if (!this.mindarThree) {
            console.error('MindAR not initialized');
            return;
        }

        if (this.isIOS) {
            await this.mindarThree.stop();
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.mindarThree.start();
        } else {
            await this.mindarThree.switchCamera();
        }
    }

    async start() {
        if (!this.mindarThree) {
            console.error('MindAR not initialized');
            return;
        }
        await this.mindarThree.start();
    }

    async stop() {
        if (this.mindarThree) {
            await this.mindarThree.stop();
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CameraSwitcher;
}

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    // Add iOS detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    const mindarThree = new window.MINDAR.FACE.MindARThree({
      container: document.body,
    });
    const {renderer, scene, camera} = mindarThree;

    const geometry = new THREE.SphereGeometry( 0.1, 32, 16 );
    const material = new THREE.MeshBasicMaterial( {color: 0x00ffff, transparent: true, opacity: 0.5} );
    const sphere = new THREE.Mesh( geometry, material );

    const anchor = mindarThree.addAnchor(1);
    anchor.group.add(sphere);

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
  start();
});
