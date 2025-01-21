const THREE = window.MINDAR.FACE.THREE;

class CameraSwitcher {
    constructor(container = document.body) {
        this.container = container;
        this.mindarThree = null;
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        this.currentCamera = 'environment'; // 'environment' for back, 'user' for front
    }

    async initialize(config = {}) {
        try {
            // Set initial camera constraints
            const constraints = {
                video: {
                    facingMode: this.currentCamera
                }
            };

            // Check if we can access the camera first
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            stream.getTracks().forEach(track => track.stop()); // Stop the test stream

            // Create MindAR instance with explicit camera settings
            this.mindarThree = new window.MINDAR.FACE.MindARThree({
                container: this.container,
                facingMode: this.currentCamera,
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
                    background-color: white;
                    border: 1px solid black;
                    border-radius: 5px;
                `;
                this.container.appendChild(switchButton);
            }

            // Add event listener
            document.querySelector("#switch").addEventListener("click", async () => {
                console.log('Switch button clicked');
                await this.switchCamera();
            });

            return this.mindarThree;

        } catch (error) {
            console.error('Camera initialization error:', error);
            alert('Camera access error: ' + error.message);
            throw error;
        }
    }

    async switchCamera() {
        console.log('Switching camera on', this.isIOS ? 'iOS' : 'non-iOS device');
        try {
            // Toggle camera facing mode
            this.currentCamera = this.currentCamera === 'environment' ? 'user' : 'environment';
            console.log('Switching to:', this.currentCamera);

            if (this.isIOS) {
                console.log('Stopping current session...');
                await this.mindarThree.stop();
                
                console.log('Waiting for cleanup...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                console.log('Reinitializing with new camera...');
                this.mindarThree = new window.MINDAR.FACE.MindARThree({
                    container: this.container,
                    facingMode: this.currentCamera
                });
                
                console.log('Starting new session...');
                await this.mindarThree.start();
                
            } else {
                await this.mindarThree.switchCamera();
            }
            
            console.log('Camera switch completed');
            
        } catch (error) {
            console.error('Error switching camera:', error);
            alert('Failed to switch camera: ' + error.message);
        }
    }

    async start() {
        if (!this.mindarThree) {
            console.error('MindAR not initialized');
            return;
        }
        try {
            await this.mindarThree.start();
            console.log('MindAR started successfully');
        } catch (error) {
            console.error('Error starting MindAR:', error);
            alert('Failed to start camera: ' + error.message);
        }
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
