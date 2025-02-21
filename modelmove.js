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
    model.setAttribute('position', { x: 0, y: -0.25, z: 0 });
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

const moveModel = (modelId, deltaX, deltaY) => {
  const model = document.getElementById(modelId);
  const currentPosition = model.getAttribute('position');
  model.setAttribute('position', {
    x: currentPosition.x + deltaX,
    y: currentPosition.y + deltaY,
    z: currentPosition.z
  });
};

let startX, startY, isDragging = false, initialDistance = null;

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
      const deltaX = (touch.clientX - startX) * 0.01;
      const deltaY = (touch.clientY - startY) * 0.01;

      moveModel('raccoonModelEntity', deltaX, -deltaY);
      moveModel('bearModelEntity', deltaX, -deltaY);

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

const setupMouseControls = () => {
  document.addEventListener('mousedown', (event) => {
    if (event.button === 0 || event.button === 2) {
      isDragging = true;
      startX = event.clientX;
      startY = event.clientY;
    }
  });

  document.addEventListener('mousemove', (event) => {
    if (!isDragging) return;

    const deltaX = (event.clientX - startX) * 0.01;
    const deltaY = (event.clientY - startY) * 0.01;

    if (event.buttons === 2) {
      rotateModel('raccoonModelEntity', -deltaY * 20, deltaX * 20);
      rotateModel('bearModelEntity', -deltaY * 20, deltaX * 20);
    } else if (event.buttons === 1) {
      moveModel('raccoonModelEntity', deltaX, -deltaY);
      moveModel('bearModelEntity', deltaX, -deltaY);
    }

    startX = event.clientX;
    startY = event.clientY;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

  document.addEventListener('wheel', (event) => {
    const scaleFactor = event.deltaY < 0 ? 1.1 : 0.9;
    zoomModel('raccoonModelEntity', scaleFactor);
    zoomModel('bearModelEntity', scaleFactor);
  });
};

const setupResetButton = () => {
  document.getElementById('reset-button').addEventListener('click', () => {
    resetModelProperties(document.getElementById('raccoonTarget'));
    resetModelProperties(document.getElementById('bearTarget'));
  });
};

// Initialize everything when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeTargets();
  setupTouchControls();
  setupMouseControls();
  setupResetButton();
});
