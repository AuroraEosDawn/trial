<!-- === Vector Connector Panel === -->
<div class="panel" id="vectorConnectorPanel" style="left:1100px;top:10px;">
  <h3>🔗 Vector Connectors <button onclick="togglePanel('vectorConnectorPanel')">[-]</button></h3>
  <div class="content">
    <label>From Vector ID
      <select id="conn_from"></select>
    </label>
    <label>To Vector ID
      <select id="conn_to"></select>
    </label>
    <label>Transmission Type
      <select id="conn_type">
        <option value="push">Push</option>
        <option value="pull">Pull</option>
        <option value="mirror">Mirror</option>
      </select>
    </label>
    <label>Influence (%) <input type="range" id="conn_strength" min="0" max="100" value="50"></label>
    <button onclick="addConnector()">+ Add Connector</button>
    <div id="connectorList"></div>
  </div>
</div>

<style>
#vectorConnectorPanel {
  position: fixed;
  background: rgba(30, 30, 40, 0.95);
  color: white;
  padding: 10px;
  z-index: 1000;
  width: 240px;
  border-radius: 6px;
  font-size: 12px;
}
#vectorConnectorPanel input[type="range"],
#vectorConnectorPanel select {
  width: 100%;
}
#vectorConnectorPanel .connectorEntry {
  background: #444;
  margin: 3px 0;
  padding: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}
</style>

<script>
let vectorRegistry = {}; // Fill this with { id: { ...vectorData } }
let vectorConnectors = [];

function refreshVectorDropdowns() {
  const fromSel = document.getElementById('conn_from');
  const toSel = document.getElementById('conn_to');
  fromSel.innerHTML = '';
  toSel.innerHTML = '';
  Object.keys(vectorRegistry).forEach(id => {
    const opt1 = document.createElement('option');
    opt1.value = id;
    opt1.text = id;
    fromSel.appendChild(opt1);
    const opt2 = opt1.cloneNode(true);
    toSel.appendChild(opt2);
  });
}

function addConnector() {
  const from = document.getElementById('conn_from').value;
  const to = document.getElementById('conn_to').value;
  const type = document.getElementById('conn_type').value;
  const strength = parseInt(document.getElementById('conn_strength').value);
  if (!from || !to || from === to) return alert("Choose valid distinct vectors");
  vectorConnectors.push({ from, to, type, strength });
  renderConnectorList();
}

function removeConnector(index) {
  vectorConnectors.splice(index, 1);
  renderConnectorList();
}

function renderConnectorList() {
  const div = document.getElementById('connectorList');
  div.innerHTML = '';
  vectorConnectors.forEach((conn, i) => {
    const row = document.createElement('div');
    row.className = 'connectorEntry';
    row.innerHTML = `
      <span>🧬 ${conn.from} → ${conn.to} (${conn.type}, ${conn.strength}%)</span>
      <button onclick="removeConnector(${i})">❌</button>
    `;
    div.appendChild(row);
  });
}

// Call this once vectorRegistry is populated
window.addEventListener("DOMContentLoaded", () => {
  refreshVectorDropdowns();
  renderConnectorList();
});
</script>


vectorRegistry = {
  "hipLeft": currentVector,
  "breastRight": { ... },
  ...
};


### this is for animation or movement script integration

vectorConnectors.forEach(conn => {
  let fromVec = vectorRegistry[conn.from];
  let toVec = vectorRegistry[conn.to];
  if (fromVec && toVec) {
    let delta = fromVec.amplitude * (conn.strength / 100);
    if (conn.type === "push") toVec.amplitude += delta;
    else if (conn.type === "pull") toVec.amplitude -= delta;
    else if (conn.type === "mirror") toVec.angle = 360 - fromVec.angle;
  }
});

🔁 Call drawVectorConnectors(ctx); at the end of drawCanvas() after your vectors are drawn.
function drawVectorConnectors(ctx) {
  ctx.save();
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  vectorConnectors.forEach(conn => {
    const fromVec = vectorRegistry[conn.from];
    const toVec = vectorRegistry[conn.to];
    if (!fromVec || !toVec) return;

    ctx.beginPath();
    ctx.strokeStyle = conn.type === "push" ? "lime" :
                      conn.type === "pull" ? "red" : "aqua";
    ctx.moveTo(fromVec.x, fromVec.y);
    ctx.lineTo(toVec.x, toVec.y);
    ctx.stroke();

    // Draw strength label
    const midX = (fromVec.x + toVec.x) / 2;
    const midY = (fromVec.y + toVec.y) / 2;
    ctx.fillStyle = "white";
    ctx.font = "10px sans-serif";
    ctx.fillText(`${conn.strength}%`, midX + 5, midY - 5);
  });
  ctx.restore();
}