const tools = [
    { name: "Terraform", desc: "Infrastructure as Code" },
    { name: "Kubernetes", desc: "Container Orchestration" },
    { name: "Prometheus", desc: "Monitoring & Alerting" }
];

const container = document.getElementById('stack-container');
tools.forEach(tool => {
    const div = document.createElement('div');
    div.className = 'tool-card';
    div.innerHTML = `<strong>${tool.name}</strong>: ${tool.desc}`;
    container.appendChild(div);
});

document.getElementById('health-check-btn').addEventListener('click', () => {
    document.getElementById('status-display').innerText = "Status: All Systems Operational (" + new Date().toLocaleTimeString() + ")";
});