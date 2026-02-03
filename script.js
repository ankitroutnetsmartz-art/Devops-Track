const stack = [
    { name: "Terraform", cat: "IaC", desc: "Resource Orchestration" },
    { name: "Ansible", cat: "IaC", desc: "Configuration Management" },
    { name: "GitHub Actions", cat: "CI/CD", desc: "Pipeline Automation" },
    { name: "ArgoCD", cat: "CI/CD", desc: "GitOps Deployment" },
    { name: "Prometheus", cat: "OBS", desc: "Metric Collection" },
    { name: "Grafana", cat: "OBS", desc: "Data Visualization" }
];

function renderStack(filter = 'all') {
    const grid = document.getElementById('stack-grid');
    grid.innerHTML = '';
    const items = filter === 'all' ? stack : stack.filter(s => s.cat === filter);
    
    items.forEach(item => {
        grid.innerHTML += `
            <div class="card">
                <span class="tag">${item.cat}</span>
                <h3>${item.name}</h3>
                <p>${item.desc}</p>
            </div>`;
    });
}

function filterStack(cat) {
    renderStack(cat);
    addLog(`Filtered by: ${cat.toUpperCase()}`);
}

function addLog(msg) {
    const term = document.getElementById('terminal');
    const line = document.createElement('div');
    line.className = 'line';
    line.innerText = `> [${new Date().toLocaleTimeString()}] ${msg}`;
    term.prepend(line);
}

// Initialize
renderStack();
setInterval(() => addLog("Heartbeat: All systems nominal"), 5000);