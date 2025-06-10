<div id="constraintEditorPanel" style="margin-top: 10px;">
  <h4>🎯 Joint Constraint Editor</h4>
  <label>Joint:
    <select id="constraintJointSelect"></select>
  </label>
  <label>Min Angle:
    <input type="range" id="minAngleSlider" min="-180" max="180" value="0">
    <span id="minAngleValue">0</span>
  </label>
  <label>Max Angle:
    <input type="range" id="maxAngleSlider" min="-180" max="180" value="90">
    <span id="maxAngleValue">90</span>
  </label>
  <label>Arc Radius:
    <input type="number" id="arcRadiusInput" min="10" max="200" step="1" value="50">
  </label>
  <button onclick="applyConstraint()">Apply</button>
</div>


const jointConstraints = {
  shoulderL: { min: -60, max: 120, radius: 60 },
  shoulderR: { min: -120, max: 60, radius: 60 },
  elbowL: { min: 0, max: 150, radius: 40 },
  elbowR: { min: 0, max: 150, radius: 40 },
  hipL: { min: -90, max: 90, radius: 50 },
  hipR: { min: -90, max: 90, radius: 50 }
};

const jointSelect = document.getElementById("constraintJointSelect");
const minSlider = document.getElementById("minAngleSlider");
const maxSlider = document.getElementById("maxAngleSlider");
const radiusInput = document.getElementById("arcRadiusInput");
const minVal = document.getElementById("minAngleValue");
const maxVal = document.getElementById("maxAngleValue");

// Populate selector
function populateJointSelector() {
  jointSelect.innerHTML = "";
  Object.keys(joints).forEach(j => {
    const opt = document.createElement("option");
    opt.value = j;
    opt.innerText = j;
    jointSelect.appendChild(opt);
  });
}
populateJointSelector();

// Sync sliders on selection
jointSelect.addEventListener("change", () => {
  const j = jointSelect.value;
  const c = jointConstraints[j] || { min: 0, max: 90, radius: 50 };
  minSlider.value = c.min;
  maxSlider.value = c.max;
  radiusInput.value = c.radius;
  minVal.textContent = c.min;
  maxVal.textContent = c.max;
  drawCanvas();
});
[minSlider, maxSlider].forEach(sl => {
  sl.addEventListener("input", () => {
    minVal.textContent = minSlider.value;
    maxVal.textContent = maxSlider.value;
  });
});

function applyConstraint() {
  const j = jointSelect.value;
  jointConstraints[j] = {
    min: parseFloat(minSlider.value),
    max: parseFloat(maxSlider.value),
    radius: parseFloat(radiusInput.value)
  };
  drawCanvas();
}

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

  for (let [joint, constraint] of Object.entries(jointConstraints)) {
    const pos = joints[joint];
    if (!pos) continue;
    const radius = constraint.radius || 40;
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1 / zoom;
    ctx.arc(
      pos.x,
      pos.y,
      radius,
      (constraint.min * Math.PI) / 180,
      (constraint.max * Math.PI) / 180
    );
    ctx.stroke();
  }

  ctx.restore();
}

// UI: right-click to edit
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  const pos = toRealCoords({ x: e.offsetX, y: e.offsetY });
  for (let [name, joint] of Object.entries(joints)) {
    if (Math.hypot(pos.x - joint.x, pos.y - joint.y) < 10) {
      const angle = prompt(`Set angle range for ${name} (e.g. -45,90)`);
      if (angle) {
        const [min, max] = angle.split(",").map(v => parseFloat(v));
        jointConstraints[name] = {
          min,
          max,
          radius: jointConstraints[name]?.radius || 50
        };
        drawCanvas();
      }
      break;
    }
  }
});