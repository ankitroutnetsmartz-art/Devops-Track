/**
 * Nexus v2.0 - Senior DevOps Partner Logic
 * Core: Event Delegation, Dynamic Pillar Modules, & Smoothed Telemetry.
 */

"use strict";

const CONFIG = {
    cloud: {
        'AWS': ['us-east-1', 'us-west-2', 'eu-central-1'],
        'Azure': ['East US', 'West US 2', 'North Europe'],
        'GCP': ['us-central1', 'europe-west1', 'asia-east1']
    },
    pillars: [
        { id: "IaC", name: "Infrastructure", tools: ["Terraform", "Pulumi", "CloudFormation", "OpenTofu"] },
        { id: "Orch", name: "Orchestration", tools: ["Kubernetes", "Docker Swarm", "Nomad", "OpenShift"] },
        { id: "CI-CD", name: "Pipeline", tools: ["GitHub Actions", "Jenkins", "GitLab CI", "ArgoCD"] },
        { id: "Sec", name: "Security", tools: ["Vault", "Snyk", "SonarQube", "Trivy"] }
    ],
    gaugeMax: 125
};

// --- DOM Cache ---
const UI = {
    terminal: document.getElementById('terminal'),
    regionSelect: document.getElementById('region-select'),
    hoverDesc: document.getElementById('hover-description'),
    progBar: document.getElementById('progress-bar'),
    progCont: document.getElementById('progress-container'),
    progStat: document.getElementById('progress-status'),
    progPerc: document.getElementById('progress-percent'),
    stackGrid: document.getElementById('stack-grid')
};

// --- Utilities ---
const addLog = (msg) => {
    const entry = document.createElement('div');
    entry.innerHTML = `<span style="color: var(--accent)">[${new Date().toLocaleTimeString()}]</span> ${msg}`;
    UI.terminal.prepend(entry);
    if (UI.terminal.children.length > 40) UI.terminal.lastChild.remove();
};

// --- Pillar Rendering Engine ---
const renderPillars = () => {
    UI.stackGrid.innerHTML = CONFIG.pillars.map(p => `
        <article class="glass-card stack-module" data-pillar="${p.id}">
            <small class="module-badge">${p.id}</small>
            <h3 class="module-title">${p.name}</h3>
            <select class="provision-select module-select" data-pillar="${p.id}">
                ${p.tools.map(tool => `<option value="${tool}">${tool}</option>`).join('')}
            </select>
            <span class="module-status" id="status-${p.id}">> Service: ${p.tools[0]}</span>
        </article>
    `).join('');
};

// --- Telemetry Perk: Smooth Glide ---
const updateTelemetry = () => {
    const run = (id, textId, min, max) => {
        const val = Math.floor(Math.random() * (max - min)) + min;
        const offset = CONFIG.gaugeMax - (val / 100 * CONFIG.gaugeMax);
        const path = document.getElementById(id);
        const label = document.getElementById(textId);

        if (path) {
            path.style.strokeDashoffset = offset;
            label.textContent = `${val}%`;
            path.style.stroke = val > 80 ? "var(--danger)" : (id.includes('cpu') ? "var(--accent)" : "var(--success)");
        }
    };
    run('cpu-gauge', 'cpu-text', 15, 42);
    run('ram-gauge', 'ram-text', 58, 80);
};

// --- Logic Handlers ---
const handleDeployment = async () => {
    const steps = ["Validating Manifests", "Building Artifacts", "Security Scan", "Traffic Shifting"];
    const btn = document.getElementById('deploy-btn');
    
    btn.disabled = true;
    UI.progCont.hidden = false;
    let progress = 0;

    const pipeline = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 2;
        if (progress >= 100) {
            progress = 100;
            clearInterval(pipeline);
            setTimeout(() => {
                UI.progCont.hidden = true;
                btn.disabled = false;
                addLog("DEPLOY: Production rollout successful.");
            }, 1000);
        }
        UI.progBar.style.width = `${progress}%`;
        UI.progPerc.textContent = `${progress}%`;
        UI.progStat.textContent = `Running: ${steps[Math.floor((progress / 101) * steps.length)]}`;
    }, 400);
};

// --- Event Initialization ---
const init = () => {
    renderPillars();

    // Global Click Delegation
    document.addEventListener('click', (e) => {
        const opt = e.target.closest('.provision-opt');
        if (opt) {
            const group = opt.parentElement;
            group.querySelector('.active').classList.remove('active');
            opt.classList.add('active');
            
            if (group.dataset.type === 'cloud') {
                const regions = CONFIG.cloud[opt.dataset.value];
                UI.regionSelect.replaceChildren(...regions.map(r => {
                    const o = document.createElement('option');
                    o.value = o.textContent = r;
                    return o;
                }));
            }
            addLog(`CONTEXT: Switched to ${opt.dataset.value}`);
        }

        if (e.target.id === 'deploy-btn') handleDeployment();
        if (e.target.id === 'panic-btn') {
            document.body.classList.add('panic-active');
            addLog("CRITICAL: LOCKDOWN INITIATED.");
            setTimeout(() => document.body.classList.remove('panic-active'), 3000);
        }
    });

    // Pillar Dropdown Delegation
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('module-select')) {
            const pillar = e.target.dataset.pillar;
            const tool = e.target.value;
            document.getElementById(`status-${pillar}`).textContent = `> Service: ${tool}`;
            addLog(`${pillar.toUpperCase()}_ENGINE: Context set to ${tool}`);
        }
    });

    // Nav Hover Delegation
    document.getElementById('nav-links-container').addEventListener('mouseover', (e) => {
        const item = e.target.closest('.nav-item');
        if (item) UI.hoverDesc.textContent = item.dataset.info || item.textContent;
    });

    // Start Loops
    updateTelemetry();
    setInterval(updateTelemetry, 1000);
    addLog("Nexus Core v2.0 Online.");
};

document.addEventListener('DOMContentLoaded', init);