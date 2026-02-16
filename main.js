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
        const afterStaticRotInv = rotatePoint(afterStaticTxInv.x, afterStaticTxInv.y, -staticAngleRad);
        return afterStaticRotInv;
      });

      liqC.setAttribute('points', polygonToPointsAttr(clippedLocalC));
      liqC.style.display = 'inline';
    }
  }
}

angleInput.addEventListener('input', update);
update();
