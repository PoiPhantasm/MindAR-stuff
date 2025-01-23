document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');
  const camera = document.querySelector('#player-camera');

  // Function to spawn a zombie
  function spawnZombie() {
      const zombie = document.createElement('a-box'); // Use a box for simplicity
      zombie.setAttribute('color', 'green');
      zombie.setAttribute('depth', '0.5');
      zombie.setAttribute('height', '1');
      zombie.setAttribute('width', '0.5');
      zombie.setAttribute('material', 'color: green; emissive: green; emissiveIntensity: 1');

      // Random position further away from the camera
      const x = Math.random() * 4 - 2; // Random x position
      const z = Math.random() * -10 - 5; // Ensure it's further away from the camera
      zombie.setAttribute('position', `${x} 0 ${z}`);
      
      scene.appendChild(zombie);
      console.log(`Zombie spawned at position: ${x}, 0, ${z}`);

      // Move zombie towards the player
      function moveZombie() {
          const position = zombie.getAttribute('position');
          const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.object3D.quaternion);
          position.x += direction.x * 0.001; // Slower movement speed
          position.z += direction.z * 0.001; // Slower movement speed
          zombie.setAttribute('position', position);

          // Log the current position of the zombie
          console.log(`Zombie current position: x=${position.x}, y=${position.y}, z=${position.z}`);

          // Check if zombie is close to the player
          if (position.z >= 0) {
              console.log(`Zombie reached the player at position: x=${position.x}, y=${position.y}, z=${position.z}`);
              scene.removeChild(zombie);
          } else {
              requestAnimationFrame(moveZombie);
          }
      }
      moveZombie();
  }

  // Spawn zombies at intervals
  setInterval(spawnZombie, 2000);

  // Shooting mechanism
  window.addEventListener('click', (event) => {
      const bullet = document.createElement('a-sphere');
      bullet.setAttribute('radius', '0.05');
      bullet.setAttribute('color', 'red');
      bullet.setAttribute('position', camera.getAttribute('position'));
      
      scene.appendChild(bullet);

      // Move bullet forward
      function moveBullet() {
          const position = bullet.getAttribute('position');
          const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.object3D.quaternion);
          position.x += direction.x * 0.1;
          position.z += direction.z * 0.1;
          bullet.setAttribute('position', position);

          // Check for collisions with zombies
          const zombies = document.querySelectorAll('a-box');
          zombies.forEach(zombie => {
              const zombiePos = zombie.getAttribute('position');
              if (Math.abs(position.x - zombiePos.x) < 0.5 && Math.abs(position.z - zombiePos.z) < 0.5) {
                  console.log(`Zombie hit at position: x=${zombiePos.x}, y=${zombiePos.y}, z=${zombiePos.z}`);
                  scene.removeChild(zombie);
                  scene.removeChild(bullet);
              }
          });

          // Remove bullet if it goes too far
          if (position.z < -20) {
              scene.removeChild(bullet);
          } else {
              requestAnimationFrame(moveBullet);
          }
      }
      moveBullet();
  });
});