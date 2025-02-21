document.addEventListener("DOMContentLoaded", function() {
  const list = ["glasses1", "glasses2", "hat1", "hat2", "earring"];
  const visibles = [true, false, false, true, true];
  
  const setVisible = (button, entities, visible) => {
    if (visible) {
      button.classList.add("selected");
    } else {
      button.classList.remove("selected");
    }
    entities.forEach((entity) => {
      entity.setAttribute("visible", visible);
    });
  }

  list.forEach((item, index) => {
    const button = document.querySelector("#" + item);
    const entities = document.querySelectorAll("." + item + "-entity");
    setVisible(button, entities, visibles[index]);
    button.addEventListener('click', () => {
      visibles[index] = !visibles[index];
      setVisible(button, entities, visibles[index]);
    });
  });

  const capture = (scene) => {
    const video = document.querySelector("video");
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const renderer = document.querySelector("a-scene").renderer;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.save();
    context.scale(-1, 1);
    context.translate(-canvas.width, 0);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.restore();

    renderer.preserveDrawingBuffer = true;
    renderer.render(scene.object3D, scene.camera);
    context.drawImage(renderer.domElement, 0, 0, canvas.width, canvas.height);
    renderer.preserveDrawingBuffer = false;

    const data = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'photo.png';
    link.href = data;
    link.click();
  }

  // Add switch camera functionality
  const switchButton = document.getElementById('switch');
  switchButton.addEventListener('click', () => {
    const scene = document.querySelector('a-scene');
    if (scene.systems['mindar-face-system']) {
      scene.systems['mindar-face-system'].switchCamera();
    }
  });

  const captureButton = document.getElementById('capture');
  const scene = document.querySelector('a-scene');
  captureButton.addEventListener('click', () => {
    capture(scene);
  });
});
