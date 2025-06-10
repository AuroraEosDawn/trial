<!-- Enhancement Phase 1: Snap-to-edge mesh editing -->
<script>
// Utility: Distance between two real coords
function distReal(a, b) {
  return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2);
}

// Snap settings
const SNAP_DISTANCE = 15; // in pixels (real space)

// Modify triangle placement logic to snap to nearby points
function findNearestSnapPoint(pos, exclude = []) {
  let allPoints = [];
  Object.values(allRegions).forEach(regionList => {
    regionList.forEach(region => {
      if (region.triangle) allPoints.push(...region.triangle);
    });
  });
  let nearest = null;
  let minDist = Infinity;
  allPoints.forEach(pt => {
    if (exclude.includes(pt)) return;
    let d = distReal(pos, pt);
    if (d < SNAP_DISTANCE && d < minDist) {
      nearest = pt;
      minDist = d;
    }
  });
  return nearest;
}

// During triangle placement or drag
canvas.addEventListener('mousedown', e => {
  let mouse = getMouseReal(e);
  if (e.altKey) {
    for (let i = 0; i < trianglePoints.length; ++i) {
      let d = dist(mouse, trianglePoints[i]);
      if (d < 12 / zoom) {
        draggingPoint = i;
        dragOffset = { x: trianglePoints[i].x_real - mouse.x, y: trianglePoints[i].y_real - mouse.y };
        return;
      }
    }
    if (trianglePoints.length < 3) {
      let snap = findNearestSnapPoint(mouse);
      trianglePoints.push(snap ? { ...snap } : { x_real: mouse.x, y_real: mouse.y });
    }
  } else {
    for (let i = imageLayers.length - 1; i >= 0; --i) {
      const layer = imageLayers[i];
      if (layer.lock) continue;
      if (isPointInLayer(mouse, layer)) {
        draggingLayerIdx = i;
        dragLayerOffset = {
          x: mouse.x - layer.x_real,
          y: mouse.y - layer.y_real
        };
        imageLayers.push(...imageLayers.splice(i, 1));
        saveLayersForView();
        drawCanvas();
        return;
      }
    }
    currentDrag = { x: e.clientX, y: e.clientY, origPan: { ...pan } };
  }
  drawCanvas();
});

canvas.addEventListener('mousemove', e => {
  let mouse = getMouseReal(e);
  if (draggingPoint !== null) {
    let newPos = { x: mouse.x + dragOffset.x, y: mouse.y + dragOffset.y };
    let snap = findNearestSnapPoint(newPos, trianglePoints);
    trianglePoints[draggingPoint] = snap ? { ...snap } : { x_real: newPos.x, y_real: newPos.y };
    drawCanvas();
  }
});
</script>
