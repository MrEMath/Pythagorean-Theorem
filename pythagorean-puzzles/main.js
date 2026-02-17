// ===== state =====
const board = document.getElementById('board');
const pieces = Array.from(document.querySelectorAll('.piece'));
const rotateBtn = document.getElementById('rotateBtn');
const solvedOverlay = document.getElementById('solvedOverlay');

const pieceState = new Map(); // id -> { x, y, angle }

const initialPositions = {
  t1: { x: 95,  y: 10,  angle: 90  },
  t2: { x: 95,  y: 20,  angle: 270 },
  t3: { x: 95,  y: 175, angle: 90  },
  t4: { x: 95,  y: 185, angle: 270 },
  r1: { x: 95,  y: 415, angle: 0   }
};

const snapTargets = {
  t1: { x: 497, y: 10,  angle: -63.5 },
  t2: { x: 662, y: 171, angle: 26.5  },
  t3: { x: 335, y: 175, angle: 206.5 },
  t4: { x: 501, y: 336, angle: -243.5 },
  r1: { x: 503, y: 250, angle: 26.5 }
};

const SNAP_POS_TOL = 20;
const SNAP_ANG_TOL = 10;

let selectedPiece = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragging = false;

let rotating = false;
let rotateStartAngle = 0;
let pieceStartAngle = 0;

// ===== helpers =====
function applyTransform(piece) {
  const id = piece.dataset.id;
  const state = pieceState.get(id);
  piece.style.transform =
    `translate(${state.x}px, ${state.y}px) rotate(${state.angle}deg)`;
}

function positionRotateBtnFor(piece) {
  if (!rotateBtn) return;
  if (!piece) {
    rotateBtn.style.display = 'none';
    return;
  }
  const boardRect = board.getBoundingClientRect();
  const rect = piece.getBoundingClientRect();
  const btnX = rect.right - boardRect.left + 5;
  const btnY = rect.top - boardRect.top - 20;
  rotateBtn.style.left = `${btnX}px`;
  rotateBtn.style.top = `${btnY}px`;
  rotateBtn.style.display = 'block';
}

function setSelected(piece) {
  selectedPiece = piece;
  pieces.forEach(p => p.classList.toggle('selected', p === piece));
  positionRotateBtnFor(piece);
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function angleDiff(a, b) {
  let d = (a - b + 540) % 360 - 180;
  return Math.abs(d);
}

// ===== shared-snap logic =====
const triangleSlots = ['t1','t2','t3','t4'].map(id => ({
  id: `slot-${id}`,
  x:  snapTargets[id].x,
  y:  snapTargets[id].y,
  angle: snapTargets[id].angle
}));

const rectTarget = snapTargets.r1;

function trySnap(piece) {
  const id = piece.dataset.id;
  const state = pieceState.get(id);

  // rectangle r1
  if (id === 'r1') {
    const nearPos = distance(state, rectTarget) < SNAP_POS_TOL;
    const nearAng = angleDiff(state.angle, rectTarget.angle) < SNAP_ANG_TOL;
    if (nearPos && nearAng) {
      pieceState.set(id, { ...rectTarget });
      applyTransform(piece);
      piece.classList.add('snapped');
    }
    return;
  }

  // triangles only
  if (!piece.classList.contains('triangle')) return;

  let bestSlot = null;
  let bestDist = Infinity;

  triangleSlots.forEach(slot => {
    const occupied = pieces.some(p => {
      if (!p.classList.contains('triangle')) return false;
      if (p === piece) return false;
      return p.dataset.slotId === slot.id;
    });
    if (occupied) return;

    const d = distance(state, slot);
    if (d < bestDist) {
      bestDist = d;
      bestSlot = slot;
    }
  });

  if (!bestSlot) return;

  const nearPos = bestDist < SNAP_POS_TOL;
  const nearAng = angleDiff(state.angle, bestSlot.angle) < SNAP_ANG_TOL;

  if (nearPos && nearAng) {
    pieceState.set(id, {
      x: bestSlot.x,
      y: bestSlot.y,
      angle: bestSlot.angle
    });
    applyTransform(piece);
    piece.classList.add('snapped');
    piece.dataset.slotId = bestSlot.id;
  }
}

function checkSolved() {
  const r1 = pieces.find(p => p.dataset.id === 'r1');

  const trianglesDone = triangleSlots.every(slot =>
    pieces.some(p =>
      p.classList.contains('triangle') &&
      p.dataset.slotId === slot.id
    )
  );

  if (r1 && r1.classList.contains('snapped') && trianglesDone) {
    if (solvedOverlay) {
      solvedOverlay.classList.add('visible');
    }
    if (window.markPuzzleComplete) {
      window.markPuzzleComplete();
    }
  }
}

// ===== initialization =====
pieces.forEach(piece => {
  const id = piece.dataset.id;
  const init = initialPositions[id] || { x: 0, y: 0, angle: 0 };
  pieceState.set(id, { ...init });
  applyTransform(piece);
});

// ===== drag events =====
pieces.forEach(piece => {
  piece.addEventListener('pointerdown', event => {
    event.preventDefault();
    const id = piece.dataset.id;
    const state = pieceState.get(id);

    setSelected(piece);
    dragging = true;
    piece.setPointerCapture(event.pointerId);

    const boardRect = board.getBoundingClientRect();
    const pointerX = event.clientX - boardRect.left;
    const pointerY = event.clientY - boardRect.top;

    dragOffsetX = pointerX - state.x;
    dragOffsetY = pointerY - state.y;
  });

  piece.addEventListener('pointermove', event => {
    if (!dragging || selectedPiece !== piece) return;
    event.preventDefault();

    const id = piece.dataset.id;
    const state = pieceState.get(id);

    const boardRect = board.getBoundingClientRect();
    const pointerX = event.clientX - boardRect.left;
    const pointerY = event.clientY - boardRect.top;

    state.x = pointerX - dragOffsetX;
    state.y = pointerY - dragOffsetY;

    pieceState.set(id, state);
    applyTransform(piece);
    positionRotateBtnFor(piece);
  });

  piece.addEventListener('pointerup', event => {
    if (!dragging || selectedPiece !== piece) return;
    dragging = false;
    piece.releasePointerCapture(event.pointerId);

    trySnap(piece);
    checkSolved();
  });
});

// click outside pieces to clear selection
if (board) {
  board.addEventListener('pointerdown', event => {
    if (!(event.target instanceof Element)) return;
    if (!event.target.classList.contains('piece') &&
        event.target !== rotateBtn) {
      setSelected(null);
    }
  });
}

// ===== rotation via handle (guarded) =====
if (rotateBtn) {
  rotateBtn.addEventListener('pointerdown', event => {
    event.preventDefault();
    if (!selectedPiece) return;

    rotating = true;
    rotateBtn.setPointerCapture(event.pointerId);

    const boardRect = board.getBoundingClientRect();
    const id = selectedPiece.dataset.id;
    const state = pieceState.get(id);

    const pieceRect = selectedPiece.getBoundingClientRect();
    const cx = pieceRect.left - boardRect.left + pieceRect.width / 2;
    const cy = pieceRect.top  - boardRect.top  + pieceRect.height / 2;

    selectedPiece._center = { cx, cy };

    const dx = event.clientX - boardRect.left - cx;
    const dy = event.clientY - boardRect.top  - cy;
    rotateStartAngle = Math.atan2(dy, dx);
    pieceStartAngle = state.angle * Math.PI / 180;
  });

  rotateBtn.addEventListener('pointermove', event => {
    if (!rotating || !selectedPiece) return;
    event.preventDefault();

    const boardRect = board.getBoundingClientRect();
    const { cx, cy } = selectedPiece._center;

    const dx = event.clientX - boardRect.left - cx;
    const dy = event.clientY - boardRect.top  - cy;
    const currentAngle = Math.atan2(dy, dx);

    const delta = currentAngle - rotateStartAngle;
    const newAngleRad = pieceStartAngle + delta;
    const newAngleDeg = (newAngleRad * 180 / Math.PI + 360) % 360;

    const id = selectedPiece.dataset.id;
    const state = pieceState.get(id);
    state.angle = newAngleDeg;
    pieceState.set(id, state);
    applyTransform(selectedPiece);
  });

  rotateBtn.addEventListener('pointerup', event => {
    if (!rotating) return;
    rotating = false;
    rotateBtn.releasePointerCapture(event.pointerId);

    if (selectedPiece) {
      trySnap(selectedPiece);
      checkSolved();
    }
  });
}
