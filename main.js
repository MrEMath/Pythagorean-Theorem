// ===== rotator state =====
const deviceWrapper = document.getElementById('deviceWrapper');
const device = document.getElementById('device');
const angleInput = document.getElementById('angle');
const angleValue = document.getElementById('angleValue');

const liqA = document.getElementById('liqA');
const liqB = document.getElementById('liqB');
const liqC = document.getElementById('liqC');

// side lengths
const a = 120;
const b = 160;
const c = 200;

// areas
const areaA = a * a;
const areaB = b * b;
const areaC = c * c; // = areaA + areaB

// triangle vertices: (0,0), (160,0), (0,120)
// centroid:
const centroidX = (0 + 160 + 0) / 3; // 160/3
const centroidY = (0 + 0 + 120) / 3; // 40

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function rotatePoint(x, y, angleRad) {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos
  };
}

function translatePoint(x, y, tx, ty) {
  return { x: x + tx, y: y + ty };
}

// clip polygon (world coords) against half-plane y >= waterY
function clipAgainstHorizontal(polygon, waterY) {
  const output = [];
  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i];
    const next = polygon[(i + 1) % polygon.length];

    const curIn = current.y >= waterY;
    const nextIn = next.y >= waterY;

    if (curIn && nextIn) {
      output.push(next);
    } else if (curIn && !nextIn) {
      const t = (waterY - current.y) / (next.y - current.y);
      const ix = current.x + t * (next.x - current.x);
      output.push({ x: ix, y: waterY });
    } else if (!curIn && nextIn) {
      const t = (waterY - current.y) / (next.y - current.y);
      const ix = current.x + t * (next.x - current.x);
      output.push({ x: ix, y: waterY });
      output.push(next);
    }
  }
  return output;
}

function polygonToPointsAttr(poly) {
  return poly.map(p => `${p.x},${p.y}`).join(' ');
}

// level-filled polygon for square defined in device coords,
// rotated around centroid, with fill fraction f
function levelFillPolygonGeneric(localRect, deviceAngleRad, f) {
  const { x, y, w, h } = localRect;

  const cornersLocal = [
    { x: x,     y: y     },
    { x: x + w, y: y     },
    { x: x + w, y: y + h },
    { x: x,     y: y + h }
  ];

  // transform to world: translate so centroid at origin, then rotate
  const cornersWorld = cornersLocal.map(p => {
    const shifted = translatePoint(p.x, p.y, -centroidX, -centroidY);
    return rotatePoint(shifted.x, shifted.y, deviceAngleRad);
  });

  let minY = cornersWorld[0].y;
  let maxY = cornersWorld[0].y;
  for (const p of cornersWorld) {
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const frac = clamp01(f);
  if (frac <= 0) return [];
  if (frac >= 1) return cornersLocal;

  const waterY = maxY - (maxY - minY) * frac;

  const clippedWorld = clipAgainstHorizontal(cornersWorld, waterY);
  if (clippedWorld.length < 3) return [];

  // map back: inverse rotation, then translate centroid back
  const angleInv = -deviceAngleRad;
  const clippedLocal = clippedWorld.map(p => {
    const unrot = rotatePoint(p.x, p.y, angleInv);
    const unshift = translatePoint(unrot.x, unrot.y, centroidX, centroidY);
    return unshift;
  });

  return clippedLocal;
}

function update() {
  // Slider angle is 0..180 (UI)
  const sliderAngle = Number(angleInput.value);

  // Map slider 0..180 → physical device angle 37..217
  const deviceAngleDeg = sliderAngle * (217 - 37) / 180 + 37;
  const deviceAngleRad = deviceAngleDeg * Math.PI / 180;

  angleValue.textContent = `${sliderAngle}°`;

  // Rotate deviceWrapper about the triangle centroid:
  // translate(C) rotate(angle) translate(-C)
  deviceWrapper.setAttribute(
    'transform',
    `translate(${centroidX},${centroidY}) rotate(${deviceAngleDeg}) translate(${-centroidX},${-centroidY})`
  );

  // same transfer mapping using physical angle
  const start = 35;
  const end   = 217;
  let t;
  if (deviceAngleDeg <= start) {
    t = 0;
  } else if (deviceAngleDeg >= end) {
    t = 1;
  } else {
    t = (deviceAngleDeg - start) / (end - start);
  }

  const areaCfluid = (1 - t) * areaC;
  const areaLegs   = t * areaC;

  // fill horizontal leg (B) first, then vertical leg (A)
  let areaBfluid, areaAfluid;
  if (areaLegs <= areaB) {
    areaBfluid = areaLegs;
    areaAfluid = 0;
  } else {
    areaBfluid = areaB;
    areaAfluid = areaLegs - areaB;
    if (areaAfluid > areaA) areaAfluid = areaA;
  }

  const fillC = clamp01(areaCfluid / areaC);
  const fillA = clamp01(areaAfluid / areaA);
  const fillB = clamp01(areaBfluid / areaB);

  // ---------- Square A (vertical leg), device coords ----------
  const localA = { x: -120, y: 0, w: 120, h: 120 };
  const polyA = levelFillPolygonGeneric(localA, deviceAngleRad, fillA);
  if (polyA.length >= 3) {
    liqA.setAttribute('points', polygonToPointsAttr(polyA));
    liqA.style.display = 'inline';
  } else {
    liqA.style.display = 'none';
  }

  // ---------- Square B (horizontal leg), device coords ----------
  const localB = { x: 0, y: -160, w: 160, h: 160 };
  const polyB = levelFillPolygonGeneric(localB, deviceAngleRad, fillB);
  if (polyB.length >= 3) {
    liqB.setAttribute('points', polygonToPointsAttr(polyB));
    liqB.style.display = 'inline';
  } else {
    liqB.style.display = 'none';
  }

  // ---------- Big square on hypotenuse (C) ----------
  const staticAngleDeg = -36.87;
  const staticAngleRad = staticAngleDeg * Math.PI / 180;

  const cornersLocalC = [
    { x: 0,   y: 0   },
    { x: 200, y: 0   },
    { x: 200, y: 200 },
    { x: 0,   y: 200 }
  ];

  // bigSquare local → device: translate(0,120), rotate(-36.87)
  // then device → centroid-centered world: translate(-Cx,-Cy), rotate(deviceAngle)
  const cornersWorldC = cornersLocalC.map(p => {
    const afterStaticRot = rotatePoint(p.x, p.y, staticAngleRad);
    const afterStaticTx = translatePoint(afterStaticRot.x, afterStaticRot.y, 0, 120);
    const shifted = translatePoint(afterStaticTx.x, afterStaticTx.y, -centroidX, -centroidY);
    return rotatePoint(shifted.x, shifted.y, deviceAngleRad);
  });

  let minY = cornersWorldC[0].y;
  let maxY = cornersWorldC[0].y;
  for (const p of cornersWorldC) {
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const fracC = clamp01(fillC);
  if (fracC <= 0) {
    liqC.style.display = 'none';
  } else if (fracC >= 1) {
    liqC.setAttribute('points', '0,0 200,0 200,200 0,200');
    liqC.style.display = 'inline';
  } else {
    const waterY = maxY - (maxY - minY) * fracC;
    const clippedWorldC = clipAgainstHorizontal(cornersWorldC, waterY);

    if (clippedWorldC.length < 3) {
      liqC.style.display = 'none';
    } else {
      // world (centroid-centered) → device → bigSquare local
      const clippedLocalC = clippedWorldC.map(pWorld => {
        const unrot = rotatePoint(pWorld.x, pWorld.y, -deviceAngleRad);
        const unshift = translatePoint(unrot.x, unrot.y, centroidX, centroidY);
        const afterStaticTxInv = translatePoint(unshift.x, unshift.y, 0, -120);
        const afterStaticRotInv = rotatePoint(afterStaticTxInv.x, afterStaticTxInv.y, -staticAngleDeg * Math.PI / 180);
        return afterStaticRotInv;
      });

      liqC.setAttribute('points', polygonToPointsAttr(clippedLocalC));
      liqC.style.display = 'inline';
    }
  }
}

// wire slider as soon as update is defined, but only if the element exists
if (angleInput) {
  angleInput.addEventListener('input', update);
  update();
}

// ===== puzzle sequence loader =====
// rotator code...
// wire slider...

// ===== puzzle sequence loader =====
const puzzleContainer = document.getElementById('puzzle-container');
const nextPuzzleBtn = document.getElementById('nextPuzzleBtn');

const puzzlePages = [
  'pythagorean-puzzles/content.html',
  'pythagorean-puzzle2/content.html',
  'proof/content.html'
];

let currentPuzzleIndex = 0;

// define initProof BEFORE loadPuzzle
function initProof() {
  if (window.markPuzzleComplete) {
    window.markPuzzleComplete();
  }
}

function loadPuzzle(index) {
  const url = puzzlePages[index];
  fetch(url)
    .then(res => res.text())
.then(html => {
  puzzleContainer.innerHTML = html;
  currentPuzzleIndex = index;

  // default: disable Next until the current puzzle marks complete
  if (nextPuzzleBtn) nextPuzzleBtn.disabled = true;

      if (index === 1) {
        initPuzzle2();
      }
      if (index === 2) {
        initProof();
      }

      if (index === 0) {
        const script = document.createElement('script');
        script.src = 'pythagorean-puzzles/main.js';
        script.defer = false;
        document.body.appendChild(script);
      }
    })
    .catch(err => {
      console.error('Error loading puzzle', url, err);
      puzzleContainer.innerHTML =
        '<p style="padding:1rem;color:#c00;">Unable to load this puzzle.</p>';
    });
}

function initPuzzle2() {
  // query everything inside the loaded puzzle 2
  const board = document.getElementById('board');
  const pieces = Array.from(document.querySelectorAll('.piece'));
  const rotateBtn = document.getElementById('rotateBtn');
  const solvedOverlay = document.getElementById('solvedOverlay');

  if (!board || !pieces.length) {
    console.warn('Puzzle 2 elements not found');
    return;
  }

  const pieceState = new Map(); // id -> { x, y, angle }

  const initialPositions = {
    t1: { x: 95,  y: 10,  angle: 90  },
    t2: { x: 95,  y: 20,  angle: 270 },
    t3: { x: 95,  y: 175, angle: 90  },
    t4: { x: 95,  y: 185, angle: 270 },
    r1: { x: 51,  y: 415, angle: 0   }
  };

  // any triangle can go on any of these four targets
  const triangleTargets = [
    { x: 598, y: 234, angle: 90  },
    { x: 600, y: 233, angle: 270 },
    { x: 376, y: 158, angle: 180 },
    { x: 377, y: 158, angle: 360 }
  ];

  // rectangle target
  const rectTarget = { x: 523, y: 158, angle: 0 };

  const SNAP_POS_TOL = 20; // pixels
  const SNAP_ANG_TOL = 10; // degrees

  let selectedPiece = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let dragging = false;

  let rotating = false;
  let rotateStartAngle = 0; // radians
  let pieceStartAngle = 0;  // radians

  // ----- helpers -----

  function applyTransform(piece) {
    const id = piece.dataset.id;
    const state = pieceState.get(id);
    piece.style.transform =
      `translate(${state.x}px, ${state.y}px) rotate(${state.angle}deg)`;
  }

  function positionRotateBtnFor(piece) {
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

  function initPositions() {
    pieces.forEach(piece => {
      const id = piece.dataset.id;
      const init = initialPositions[id];
      if (!init) return;
      pieceState.set(id, { ...init });
      applyTransform(piece);
    });
  }

  function isSnapped(id, state) {
    // rectangle has its own single target
    if (id === 'r1') {
      const dx = state.x - rectTarget.x;
      const dy = state.y - rectTarget.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const dang = Math.abs(((state.angle - rectTarget.angle + 540) % 360) - 180);
      return dist <= SNAP_POS_TOL && dang <= SNAP_ANG_TOL;
    }

    // triangles: any triangle can go on any triangle target
    for (const target of triangleTargets) {
      const dx = state.x - target.x;
      const dy = state.y - target.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const dang = Math.abs(((state.angle - target.angle + 540) % 360) - 180);
      if (dist <= SNAP_POS_TOL && dang <= SNAP_ANG_TOL) return true;
    }
    return false;
  }

  function checkSolved() {
    for (const [id, state] of pieceState.entries()) {
      if (!isSnapped(id, state)) return;
    }
    if (solvedOverlay) {
      solvedOverlay.style.display = 'block';
    }
    if (window.markPuzzleComplete) {
      window.markPuzzleComplete();
    }
  }

  // ----- drag wiring -----

  pieces.forEach(piece => {
    piece.addEventListener('mousedown', e => {
      e.preventDefault();
      setSelected(piece);
      const rect = board.getBoundingClientRect();
      const state = pieceState.get(piece.dataset.id);
      dragging = true;
      dragOffsetX = e.clientX - (rect.left + state.x);
      dragOffsetY = e.clientY - (rect.top + state.y);
    });
  });

  board.addEventListener('mousemove', e => {
    if (!dragging || !selectedPiece) return;
    const rect = board.getBoundingClientRect();
    const id = selectedPiece.dataset.id;
    const state = pieceState.get(id);
    state.x = e.clientX - rect.left - dragOffsetX;
    state.y = e.clientY - rect.top - dragOffsetY;
    applyTransform(selectedPiece);
  });

board.addEventListener('mouseup', () => {
  if (!dragging || !selectedPiece) return;
  dragging = false;
  const id = selectedPiece.dataset.id;
  const state = pieceState.get(id);
  if (isSnapped(id, state)) {
    // snap position only; keep whatever angle the student set
    if (id === 'r1') {
      state.x = rectTarget.x;
      state.y = rectTarget.y;
      // state.angle stays as-is
    } else {
      let bestTarget = null;
      let bestDist = Infinity;
      for (const target of triangleTargets) {
        const dx = state.x - target.x;
        const dy = state.y - target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < bestDist) {
          bestDist = dist;
          bestTarget = target;
        }
      }
      if (bestTarget) {
        state.x = bestTarget.x;
        state.y = bestTarget.y;
        // state.angle stays as-is
      }
    }
    applyTransform(selectedPiece);
    checkSolved();
  }
});

  board.addEventListener('mouseleave', () => {
    dragging = false;
  });

  // ----- rotate wiring -----

  rotateBtn.addEventListener('mousedown', e => {
    e.preventDefault();
    if (!selectedPiece) return;
    rotating = true;
    dragging = false;

    const rect = selectedPiece.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    rotateStartAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
    const state = pieceState.get(selectedPiece.dataset.id);
    pieceStartAngle = state.angle * Math.PI / 180;
  });

document.addEventListener('mousemove', e => {
  if (!rotating || !selectedPiece) return;
  const rect = selectedPiece.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const currentAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
  const delta = currentAngle - rotateStartAngle;
  const state = pieceState.get(selectedPiece.dataset.id);
  state.angle = ((pieceStartAngle + delta) * 180 / Math.PI + 360) % 360;
  applyTransform(selectedPiece);
  // no reposition here; let it “ride along” with the piece
});

  document.addEventListener('mouseup', () => {
    if (rotating) {
      rotating = false;
      checkSolved();
    }
  });

  // ----- init -----
  initPositions();
}

// load first puzzle on page load
loadPuzzle(currentPuzzleIndex);

// called by each puzzle when it’s solved
window.markPuzzleComplete = function () {
  if (!nextPuzzleBtn) return;
  if (currentPuzzleIndex < puzzlePages.length - 1) {
    nextPuzzleBtn.disabled = false;
  } else {
    nextPuzzleBtn.disabled = true; // last puzzle; no next
  }
};
// clicking "Next puzzle" moves to the next page
if (nextPuzzleBtn) {
  nextPuzzleBtn.addEventListener('click', () => {
    if (currentPuzzleIndex < puzzlePages.length - 1) {
      loadPuzzle(currentPuzzleIndex + 1);
    }
  });
}
