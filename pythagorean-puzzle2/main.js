// ===== state =====

const board = document.getElementById('board');
const pieces = Array.from(document.querySelectorAll('.piece'));
const rotateBtn = document.getElementById('rotateBtn');
const solvedOverlay = document.getElementById('solvedOverlay');

const pieceState = new Map(); // id -> { x, y, angle }

// initial positions around the outside of rectangle-c
// (all in board coordinates; tweak to suit your layout)
const initialPositions = {
  t1: { x: 40,  y: 60,  angle: 0 },
  t2: { x: 540, y: 60,  angle: 0 },
  t3: { x: 40,  y: 320, angle: 0 },
  t4: { x: 540, y: 320, angle: 0 },
  r1: { x: 300, y: 10,  angle: 0 }
};

// one example snap target (triangle t1)
// position + angle where the piece should snap
const snapTargets = {
  t1: { x: 230, y: 90, angle: 0 } // adjust to where it should go on rectC
};

// tolerances for snapping
const SNAP_POS_TOL = 20;   // pixels
const SNAP_ANG_TOL = 10;   // degrees

let selectedPiece = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragging = false;

// ===== helpers =====

function applyTransform(piece) {
  const id = piece.dataset.id;
  const state = pieceState.get(id);
  piece.style.transform = `translate(${state.x}px, ${state.y}px) rotate(${state.angle}deg)`;
}

function setSelected(piece) {
  selectedPiece = piece;
  pieces.forEach(p => p.classList.toggle('selected', p === piece));

  if (!piece) {
    rotateBtn.style.display = 'none';
    return;
  }

  // place rotate button near top-right of piece
  const rect = piece.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();
  const btnX = rect.right - boardRect.left + 5;
  const btnY = rect.top - boardRect.top - 20;

  rotateBtn.style.left = `${btnX}px`;
  rotateBtn.style.top = `${btnY}px`;
  rotateBtn.style.display = 'block';
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

function trySnap(piece) {
  const id = piece.dataset.id;
  const target = snapTargets[id];
  if (!target) return;

  const state = pieceState.get(id);
  const nearPos = distance(state, target) < SNAP_POS_TOL;
  const nearAng = angleDiff(state.angle, target.angle) < SNAP_ANG_TOL;

  if (nearPos && nearAng) {
    pieceState.set(id, { ...target });
    applyTransform(piece);
    piece.classList.add('snapped');
  }
}

function checkSolved() {
  // For now, only require t1 to be snapped.
  const t1 = pieces.find(p => p.dataset.id === 't1');
  if (t1 && t1.classList.contains('snapped')) {
    solvedOverlay.classList.add('visible');
  }
}

// ===== initialization =====

pieces.forEach(piece => {
  const id = piece.dataset.id;
  const init = initialPositions[id] || { x: 0, y: 0, angle: 0 };
  pieceState.set(id, { ...init });
  applyTransform(piece);
});

// ===== event handlers =====

// click/select
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

    // move rotate button along with piece
    const rect = piece.getBoundingClientRect();
    const btnX = rect.right - boardRect.left + 5;
    const btnY = rect.top - boardRect.top - 20;
    rotateBtn.style.left = `${btnX}px`;
    rotateBtn.style.top = `${btnY}px`;
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
board.addEventListener('pointerdown', event => {
  if (!(event.target instanceof Element)) return;
  if (!event.target.classList.contains('piece') &&
      event.target !== rotateBtn) {
    setSelected(null);
  }
});

// rotate button
rotateBtn.addEventListener('click', () => {
  if (!selectedPiece) return;
  const id = selectedPiece.dataset.id;
  const state = pieceState.get(id);
  state.angle = (state.angle + 5) % 360;
  pieceState.set(id, state);
  applyTransform(selectedPiece);
  trySnap(selectedPiece);
  checkSolved();
});
