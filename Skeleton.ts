// ========== Skeleton Overlay ==========
let showSkeleton = true;
const skeletonColor = "gold";
const jointColor = "lightgray";

const joints = {
  head: { x: 1500, y: 1000 },
  neck: { x: 1500, y: 1100 },
  shoulderL: { x: 1400, y: 1150 },
  shoulderR: { x: 1600, y: 1150 },
  elbowL: { x: 1350, y: 1250 },
  elbowR: { x: 1650, y: 1250 },
  handL: { x: 1300, y: 1350 },
  handR: { x: 1700, y: 1350 },
  spineTop: { x: 1500, y: 1200 },
  spineMid: { x: 1500, y: 1400 },
  spineBase: { x: 1500, y: 1600 },
  hipL: { x: 1400, y: 1650 },
  hipR: { x: 1600, y: 1650 },
  kneeL: { x: 1400, y: 1800 },
  kneeR: { x: 1600, y: 1800 },
  footL: { x: 1400, y: 1950 },
  footR: { x: 1600, y: 1950 }
};

const bones = [
  ["head", "neck"],
  ["neck", "shoulderL"],
  ["neck", "shoulderR"],
  ["shoulderL", "elbowL"],
  ["shoulderR", "elbowR"],
  ["elbowL", "handL"],
  ["elbowR", "handR"],
  ["neck", "spineTop"],
  ["spineTop", "spineMid"],
  ["spineMid", "spineBase"],
  ["spineBase", "hipL"],
  ["spineBase", "hipR"],
  ["hipL", "kneeL"],
  ["hipR", "kneeR"],
  ["kneeL", "footL"],
  ["kneeR", "footR"]
];

// UI checkbox for toggling
const skelPanel = document.getElementById("panelImages"); // Or any control panel
const toggleBox = document.createElement("label");
toggleBox.innerHTML = `<input type="checkbox" id="toggleSkeleton" checked> Show Skeleton`;
skelPanel.appendChild(toggleBox);
document.getElementById("toggleSkeleton").addEventListener("change", e => {
  showSkeleton = e.target.checked;
  drawCanvas();
});

// Add to drawCanvas()
function drawSkeleton(ctx) {
  if (!showSkeleton) return;
  ctx.save();
  ctx.strokeStyle = skeletonColor;
  ctx.fillStyle = jointColor;
  ctx.lineWidth = 3 / zoom;
  for (let [a, b] of bones) {
    ctx.beginPath();
    ctx.moveTo(joints[a].x, joints[a].y);
    ctx.lineTo(joints[b].x, joints[b].y);
    ctx.stroke();
  }
  for (let j of Object.values(joints)) {
    ctx.beginPath();
    ctx.arc(j.x, j.y, 6 / zoom, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Call drawSkeleton() from within drawCanvas()