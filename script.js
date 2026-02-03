/**
 * Nexus v2.0 - Senior DevOps Command Center
 * Logic: Context-Aware Provisioning, Real-time Metrics, & Git Audit Feed.
 */

// --- 1. DATA MAPPINGS ---
const cloudRegions = {
    'AWS': ['us-east-1 (N. Virginia)', 'us-west-2 (Oregon)', 'eu-central-1 (Frankfurt)', 'ap-south-1 (Mumbai)'],
    'Azure': ['East US', 'West US 2', 'North Europe', 'Southeast Asia'],
    'GCP': ['us-central1 (Iowa)', 'europe-west1 (Belgium)', 'asia-east1 (Taiwan)', 'us-east4 (Virginia)']
};

const techStack = [
    { name: "Terraform", cat: "IaC", desc: "Infra Provisioning" },
    { name: "Kubernetes", cat: "Orch", desc: "Container Orchestration" },
    { name: "GitHub Actions", cat: "CI/CD", desc: "Pipeline Automation" },
    { name: "Vault", cat: "Sec", desc: "Secrets Management" }
];

// --- 2. DYNAMIC PROVISIONING LOGIC ---
function updateRegionDropdown(provider) {
    const regionSelect = document.getElementById('region-select');
    const regions = cloudRegions[provider];
    
    // Clear and Refill Dropdown
    regionSelect.innerHTML = '';
    regions.forEach(region => {
        const opt = document.createElement('option');
        opt.value = region;
        opt.textContent = region;
        regionSelect.appendChild(opt);
    });

    addLog(`SYSTEM: Dynamic regions loaded for ${provider}`);
}

function selectCloud(element, provider) {
    // UI Update
    document.querySelectorAll('#cloud-provider-row .provision-opt').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
    
    // Logic Update
    updateRegionDropdown(provider);
    addLog(`PROVISIONER: Provider context switched to ${provider}`);
}

function logRegionChange() {
    const val = document.getElementById('region-select').value;
    addLog(`NET_CONFIG: Target region locked to ${val}`);
}

function selectOS(element, os) {
    document.querySelectorAll('#os-row .provision-opt').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
    addLog(`OS_IMAGE: Selected ${os} for deployment`);
}

// --- 3. PIPELINE GLOSSARY (NAV HOVER) ---
function initGlossary() {
    const navItems = document.querySelectorAll('.nav-item');
    const descBox = document.getElementById('hover-description');
    const defaultText = "Hover over a component to view pipeline role...";

    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            descBox.innerText = item.getAttribute('data-info');
            descBox.style.color = "var(--text)";
        });
        item.addEventListener('mouseleave', () => {
            descBox.innerText = defaultText;
            descBox.style.color = "var(--accent)";
        });
    });
}

// --- 4. OBSERVABILITY METRICS (SVG) ---
function updateGauges() {
    const cpu = Math.floor(Math.random() * 30) + 10; // 10-40%
    const ram = Math.floor(Math.random() * 20) + 55; // 55-75%

    setGauge('cpu-gauge', 'cpu-text', cpu);
    setGauge('ram-gauge', 'ram-text', ram);
}

function setGauge(id, textId, value) {
    const path = document.getElementById(id);
    const text = document.getElementById(textId);
    // stroke-dasharray is 125. (125 - (value/100 * 125))
    const offset = 125 - (value / 100 * 125);
    path.style.strokeDashoffset = offset;
    text.innerText = `${value}%`;
}

// --- 5. DEPLOYMENT & PANIC ---
function startDeployment() {
    const btn = document.getElementById('deploy-btn');
    const container = document.getElementById('progress-container');
    const bar = document.getElementById('progress-bar');
    const status = document.getElementById('progress-status');

    const steps = ["Terraform Plan", "Security Scan", "Docker Build", "K8s Apply"];
    btn.disabled = true;
    container.style.display = 'block';
    let prog = 0;

    const pipeline = setInterval(() => {
        prog += Math.floor(Math.random() * 15) + 5;
        if (prog >= 100) {
            prog = 100;
            clearInterval(pipeline);
            setTimeout(() => {
                container.style.display = 'none';
                btn.disabled = false;
                addLog("DEPLOY: Production rollout complete.");
            }, 1000);
        }
        bar.style.width = prog + '%';
        status.innerText = steps[Math.floor((prog/101) * steps.length)];
    }, 600);
}

function triggerPanic() {
    document.body.classList.add('panic-active');
    addLog("!!! CRITICAL: LOCKDOWN INITIATED !!!");
    setTimeout(() => {
        document.body.classList.remove('panic-active');
        alert("SECURITY: Environment isolated. Keys revoked.");
    }, 3000);
}

// --- 6. UTILITIES ---
function addLog(msg) {
    const term = document.getElementById('terminal');
    const line = document.createElement('div');
    line.innerHTML = `> [${new Date().toLocaleTimeString()}] ${msg}`;
    term.prepend(line);
}

function renderStack() {
    const grid = document.getElementById('stack-grid');
    grid.innerHTML = techStack.map(i => `
        <div class="glass-card card">
            <small style="color:var(--accent)">${i.cat}</small>
            <h3>${i.name}</h3>
            <p style="font-size:0.75rem">${i.desc}</p>
        </div>
    `).join('');
}

// --- 7. INIT ---
document.addEventListener('DOMContentLoaded', () => {
    initGlossary();
    renderStack();
    updateRegionDropdown('AWS'); // Default start
    setInterval(updateGauges, 3000);
    addLog("Nexus Core Online. Monitoring Production...");
});