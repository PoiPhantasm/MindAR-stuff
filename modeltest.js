// Photo capture functionality
const setupCapture = () => {
  const captureButton = document.getElementById('capture');
  captureButton.addEventListener('click', () => {
    const scene = document.querySelector('a-scene');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const video = document.querySelector('video');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imageDataUrl;
    link.download = 'captured-image.png';
    link.click();
  });
};

// Keep models visible component
AFRAME.registerComponent('keep-visible', {
  init: function () {
    const el = this.el;
    let isVisible = false;

    el.addEventListener('targetFound', () => {
      isVisible = true;
      el.setAttribute('visible', true);
    });

    el.addEventListener('targetLost', () => {
      if (isVisible) {
        el.setAttribute('visible', true);
        resetModelProperties(el);
      }
    });
  }
});

const ORIGINAL_SCALE = 0.05;
const MIN_SCALE = ORIGINAL_SCALE * 0.5;
const MAX_SCALE = ORIGINAL_SCALE * 3;

const resetModelProperties = (entity) => {
  const model = entity.querySelector('a-gltf-model');
  if (model) {
    model.setAttribute('rotation', { x: 0, y: 0, z: 0 });
    model.setAttribute('scale', { x: ORIGINAL_SCALE, y: ORIGINAL_SCALE, z: ORIGINAL_SCALE });
  }
};

const initializeTargets = () => {
  document.querySelectorAll('[mindar-image-target]').forEach(target => {
    target.setAttribute('keep-visible', '');
  });
};

const rotateModel = (modelId, angleX, angleY) => {
  const model = document.getElementById(modelId);
  const currentRotation = model.getAttribute('rotation');
  model.setAttribute('rotation', {
    x: currentRotation.x + angleX,
    y: currentRotation.y + angleY,
    z: currentRotation.z
  });
};

const zoomModel = (modelId, scaleFactor) => {
  const model = document.getElementById(modelId);
  const currentScale = model.getAttribute('scale');
  const newScale = {
    x: Math.min(Math.max(currentScale.x * scaleFactor, MIN_SCALE), MAX_SCALE),
    y: Math.min(Math.max(currentScale.y * scaleFactor, MIN_SCALE), MAX_SCALE),
    z: Math.min(Math.max(currentScale.z * scaleFactor, MIN_SCALE), MAX_SCALE)
  };
  model.setAttribute('scale', newScale);
};

// Touch and mouse control variables
let startX, startY, isDragging = false, initialDistance = null;

// Touch controls
const setupTouchControls = () => {
  document.addEventListener('touchstart', (event) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    } else if (event.touches.length === 2) {
      initialDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
    }
  });

  document.addEventListener('touchmove', (event) => {
    if (event.touches.length === 1 && startX !== null && startY !== null) {
      const touch = event.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      rotateModel('raccoonModelEntity', -deltaY * 0.2, deltaX * 0.2);
      rotateModel('bearModelEntity', -deltaY * 0.2, deltaX * 0.2);

      startX = touch.clientX;
      startY = touch.clientY;
    } else if (event.touches.length === 2 && initialDistance !== null) {
      const currentDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
      const scaleFactor = currentDistance / initialDistance;
      zoomModel('raccoonModelEntity', scaleFactor);
      zoomModel('bearModelEntity', scaleFactor);
      initialDistance = currentDistance;
    }
  });

  document.addEventListener('touchend', () => {
    startX = null;
    startY = null;
    initialDistance = null;
  });
};

// Mouse controls
const setupMouseControls = () => {
  document.addEventListener('mousedown', (event) => {
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
  });

  document.addEventListener('mousemove', (event) => {
    if (!isDragging) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    rotateModel('raccoonModelEntity', -deltaY * 0.2, deltaX * 0.2);
    rotateModel('bearModelEntity', -deltaY * 0.2, deltaX * 0.2);

    startX = event.clientX;
    startY = event.clientY;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  document.addEventListener('wheel', (event) => {
    const scaleFactor = event.deltaY < 0 ? 1.1 : 0.9;
    zoomModel('raccoonModelEntity', scaleFactor);
    zoomModel('bearModelEntity', scaleFactor);
  });
};

// Initialize everything when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupCapture();
  initializeTargets();
  setupTouchControls();
  setupMouseControls();
});
