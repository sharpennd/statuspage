async function loadData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (e) {
    console.error(e);
    return { incidents: [], maintenance: [] };
  }
}

function fetchWithTimeout(resource, options = {}) {
  const { timeout = 5000 } = options;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timeout")), timeout);
    fetch(resource, { method: 'HEAD', mode: 'no-cors' }).then(response => {
      clearTimeout(timer);
      resolve(response);
    }).catch(err => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function checkServiceStatus() {
  const elWeb = document.getElementById('webStatus');
  try {
    await fetchWithTimeout('https://www.sharpennd.xyz');
    elWeb.innerHTML = `<span class="green">Online</span>`;
  } catch (err) {
    elWeb.innerHTML = err.message === "Timeout"
      ? `<span class="orange">Timeout / Unknown</span>`
      : `<span class="red">Offline</span>`;
  }

  const elMC = document.getElementById('mcStatus1');
  try {
    const res = await fetch(`https://api.mcsrvstat.us/2/mc.sharpennd.xyz`);
    const data = await res.json();
    elMC.innerHTML = data.online
      ? `<span class="green">Online</span>`
      : `<span class="red">Offline</span>`;
  } catch {
    elMC.innerHTML = `<span class="orange">Status Unknown</span>`;
  }
}

function buildUptimeBar(serviceId, incidents) {
  const bar = document.getElementById(serviceId);
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const isoDay = day.toISOString().split("T")[0];

    let isDown = false;
    for (const incident of incidents) {
      const start = new Date(incident.start);
      const end = new Date(incident.end);
      if (day >= start && day <= end) {
        isDown = true;
        break;
      }
    }

    const div = document.createElement("div");
    div.className = isDown ? "bar-red" : "bar-green";
    bar.appendChild(div);
  }
}

function loadIncidents(incidents) {
  const container = document.getElementById("incidentContainer");
  container.innerHTML = "";
  if (!incidents.length) {
    container.innerHTML = "<p>No incidents reported.</p>";
    return;
  }
  for (const incident of incidents) {
    const div = document.createElement("div");
    div.className = "incident";
    div.innerHTML = `
      <div class="entry-title">${incident.title}</div>
      <div class="entry-time">Start: ${incident.start} | End: ${incident.end}</div>
      <div class="entry-description">${incident.description}</div>
    `;
    container.appendChild(div);
  }
}

function loadMaintenance(maintenance) {
  const container = document.getElementById("maintenanceContainer");
  container.innerHTML = "";
  if (!maintenance.length) {
    container.innerHTML = "<p>No upcoming maintenance.</p>";
    return;
  }
  for (const item of maintenance) {
    const div = document.createElement("div");
    div.className = "maintenance";
    div.innerHTML = `
      <div class="entry-title">${item.title}</div>
      <div class="entry-time">Start: ${item.start} | End: ${item.end}</div>
      <div class="entry-description">${item.description}</div>
    `;
    container.appendChild(div);
  }
}

async function initialize() {
  const data = await loadData();
  loadIncidents(data.incidents || []);
  loadMaintenance(data.maintenance || []);
  checkServiceStatus();
  buildUptimeBar("mcUptimeBar", data.incidents);
  buildUptimeBar("webUptimeBar", data.incidents);
}

initialize();
