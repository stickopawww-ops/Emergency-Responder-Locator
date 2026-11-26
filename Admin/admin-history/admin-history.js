const incidents = [
  { title: "Kitchen Fire", place: "Brgy. Mabolo - 13:20 - Fire Truck 1", status: "Resolved", priority: "High Priority", type: "available" },
  { title: "Kitchen Fire", place: "Brgy. Mabolo - 13:20 - Fire Truck 1", status: "Resolved", priority: "Med Priority", type: "available" },
  { title: "Kitchen Fire", place: "Brgy. Mabolo - 13:20 - Fire Truck 1", status: "Resolved", priority: "Med Priority", type: "available" },
  { title: "Prank call", place: "Brgy. Mabolo - 12:30 - Fire Truck 1", status: "False Alarm", priority: "Med Priority", type: "busy" },
];

const activities = [
  { text: "SOS Received: chest pain, adult male", time: "12:20 Rosa Villanueva" },
  { text: "Rosa sign in", time: "12:20 Rosa Villanueva" },
  { text: "Unit dispatched: Fire Truck 1 to Brgy. Mabolo", time: "12:25 Admin" },
];

let currentFilter = "all";
let currentTab = "incident";

function render() {
  const q = document.getElementById("searchInput").value.toLowerCase();
  const incidentView = document.getElementById("incidentView");
  const activityView = document.getElementById("activityView");

  incidentView.innerHTML = incidents
    .filter(i => currentFilter === "all" || i.type === currentFilter)
    .filter(i => (i.title + i.place).toLowerCase().includes(q))
    .map(i => `
      <div class="card">
        <h3>${i.title}</h3>
        <p>${i.place}</p>
        <span class="badge ${i.status === 'Resolved' ? 'resolved' : 'false'}">${i.status}</span>
        <span class="badge ${i.priority.includes('High') ? 'high' : 'med'}">${i.priority}</span>
      </div>`).join("");

  activityView.innerHTML = activities
    .filter(a => a.text.toLowerCase().includes(q))
    .map(a => `<div class="activity-item"><b>${a.text}</b><span>${a.time}</span></div>`).join("");
}

document.querySelectorAll(".tab").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentTab = btn.dataset.tab;
    document.getElementById("incidentView").classList.toggle("hidden", currentTab !== "incident");
    document.getElementById("activityView").classList.toggle("hidden", currentTab !== "activity");
    document.getElementById("filters").style.display = currentTab === "incident" ? "flex" : "none";
  };
});

document.querySelectorAll(".filter").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  };
});

document.getElementById("searchInput").oninput = render;

document.getElementById("exportBtn").onclick = () => {
  let csv = "Title,Place,Status,Priority\n";
  incidents.forEach(i => csv += `"${i.title}","${i.place}","${i.status}","${i.priority}"\n`);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "history-report.csv";
  a.click();
};

render();