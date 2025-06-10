<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chakra Mesh Configurator - Editable Mesh Regions</title>
  <style>
    html, body { margin: 0; padding: 0; background: #111; overflow: scroll; font-family: sans-serif; }
    canvas { position: fixed; background-color: #000; }
    .panel {
      position: fixed; background: rgba(32,32,40,0.9); color: white;
      padding: 10px; border-radius: 6px; max-height: 90vh; overflow-y: auto;
      z-index: 100; resize: both; min-width: 180px; min-height: 40px;
    }
    .panel.collapsed { height: auto; overflow: hidden; }
    .panel h3 { margin: 0; font-size: 14px; display: flex; justify-content: space-between; align-items: center; }
    label, input, button, select { display: block; width: 100%; margin-bottom: 6px; }
    input[type="range"] { width: 100%; }
    .image-control { border-bottom: 1px solid #333; margin-bottom: 6px; }
  </style>
</head>
<body>
<canvas id="miraCanvas" width="3000" height="3000"></canvas>
<div class="panel" id="panelChakra" style="left:10px;top:10px;">
  <h3>🧠 Chakra Panel <button onclick="togglePanel('panelChakra')">[-]</button></h3>
  <div class="content">
    <input type="text" id="regionName" placeholder="Symbolic Name">
    <div id="chakraSliders"></div>
    <button onclick="saveRegion()">Save Region</button>
    <button onclick="exportRegions()">Export JSON</button>
  </div>
</div>
<script>
const canvas = document.getElementById("miraCanvas");
const ctx = canvas.getContext("2d");
let zoom = 1.0, pan = { x: 0, y: 0 };
let trianglePoints = [], allRegions = [], selectedRegion = null;
const chakraColors = {
  muladhara: "red", svadhisthana: "orange", manipura: "yellow",
  anahata: "green", vishuddha: "cyan", ajna: "indigo", sahasrara: "violet"
};
const chakraSlugs = Object.keys(chakraColors);
function createChakraSliders() {
  const slidersDiv = document.getElementById('chakraSliders');
  slidersDiv.innerHTML = '';
  chakraSlugs.forEach(slug => {
    const label = document.createElement('label');
    label.innerText = slug;
    const input = document.createElement('input');
    input.type = 'range'; input.min = 0; input.max = 100; input.value = 0;
    input.id = `chakra_${slug}`;
    input.style.background = `linear-gradient(to right, #222, ${chakraColors[slug]})`;
    label.appendChild(input); slidersDiv.appendChild(label);
  });
}
function getChakraValues() {
  let out = {};
  chakraSlugs.forEach(slug => {
    const val = parseInt(document.getElementById(`chakra_${slug}`).value);
    if (val > 0) out[slug] = val;
  }); return out;
}
function setChakraValues(vals) {
  chakraSlugs.forEach(slug => {
    document.getElementById(`chakra_${slug}`).value = vals[slug] || 0;
  });
}
createChakraSliders();
canvas.addEventListener('click', e => {
  const pos = toRealCoords({ x: e.offsetX, y: e.offsetY });
  selectedRegion = null;
  for (let region of allRegions) {
    if (isPointInTriangle(pos, region.triangle)) {
      selectedRegion = region;
      document.getElementById('regionName').value = region.name;
      setChakraValues(region.chakra);
      break;
    }
  }
  drawCanvas();
});
function saveRegion() {
  if (trianglePoints.length !== 3) return alert("3 points required");
  const name = document.getElementById('regionName').value.trim();
  const chakra = getChakraValues();
  allRegions.push({ name, chakra, triangle: [...trianglePoints] });
  trianglePoints = []; setChakraValues({}); drawCanvas();
}
function exportRegions() {
  const blob = new Blob([JSON.stringify(allRegions,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'regions.json'; a.click(); URL.revokeObjectURL(url);
}
function toRealCoords(view) {
  return { x: (view.x - pan.x) / zoom, y: (view.y - pan.y) / zoom };
}
function isPointInTriangle(p, [a, b, c]) {
  function area(p1, p2, p3) {
    return Math.abs((p1.x*(p2.y-p3.y)+p2.x*(p3.y-p1.y)+p3.x*(p1.y-p2.y))/2);
  }
  const A = area(a,b,c);
  const A1 = area(p,b,c), A2 = area(a,p,c), A3 = area(a,b,p);
  return Math.abs(A - (A1+A2+A3)) < 0.5;
}
canvas.addEventListener('contextmenu', e => {
  e.preventDefault();
  const p = toRealCoords({x: e.offsetX, y: e.offsetY});
  trianglePoints.push(p);
  if (trianglePoints.length > 3) trianglePoints.shift();
  drawCanvas();
});
function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  allRegions.forEach(region => {
    const color = Object.keys(region.chakra)[0];
    const hex = chakraColors[color] || "white";
    const [a,b,c] = region.triangle;
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.lineTo(c.x,c.y); ctx.closePath();
    ctx.fillStyle = hex + '40'; ctx.fill();
    ctx.strokeStyle = hex; ctx.lineWidth = 2; ctx.stroke();
  });
  if (trianglePoints.length > 0) {
    ctx.strokeStyle = 'yellow';
    ctx.beginPath(); ctx.moveTo(trianglePoints[0].x, trianglePoints[0].y);
    trianglePoints.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  }
}
drawCanvas();
function togglePanel(id){
  const p = document.getElementById(id);
  p.classList.toggle('collapsed');
  const c = p.querySelector('.content');
  c.style.display = p.classList.contains('collapsed') ? 'none' : '';
}
</script>
</body>
</html>