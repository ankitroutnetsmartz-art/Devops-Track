/**
 * Nexus v2.0 - Senior DevOps Command Center Logic
 * Optimized for high-uptime production environments.
 */

"use strict";

const CONFIG = {
    cloudRegions: {
        'AWS': ['us-east-1 (N. Virginia)', 'us-west-2 (Oregon)', 'eu-central-1 (Frankfurt)', 'ap-south-1 (Mumbai)'],
        'Azure': ['East US', 'West US 2', 'North Europe', 'Southeast Asia'],
        'GCP': ['us-central1 (Iowa)', 'europe-west1 (Belgium)', 'asia-east1 (Taiwan)', 'us-east4 (Virginia)']
    },
    techStack: [
        { name: "Terraform", cat: "IaC", desc: "Infra Provisioning" },
        { name: "Kubernetes", cat: "Orch", desc: "Container Orchestration" },
        { name: "GitHub Actions", cat: "CI/CD", desc: "Pipeline Automation" },
        { name: "Vault", cat: "Sec", desc: "Secrets Management" }
    ],
    gaugeMaxOffset: 125
};

// --- DOM CACHE ---
const dom = {
    regionSelect: document.getElementById('region-select'),
    terminal: document.getElementById('terminal'),
    hoverDesc: document.getElementById('hover-description'),
    progressBar: document.getElementById('progress-bar'),
    progressStatus: document.getElementById('progress-status'),
    progressContainer: document.getElementById('progress-container'),
    deployBtn: document.getElementById('deploy-btn'),
    stackGrid: document.getElementById('stack-grid')
};

// --- CORE UTILITIES ---
const addLog = (msg) => {
    const line = document.createElement('div');
    line.textContent = `> [${new Date().toLocaleTimeString()}] ${msg}`;
    dom.terminal.prepend(line);
    if (dom.terminal.children.length > 50) dom.terminal.lastChild.remove(); // Buffer management
};

// --- UI HANDLERS ---
const updateRegionDropdown = (provider) => {
    const regions = CONFIG.cloudRegions[provider] || [];
    dom.regionSelect.replaceChildren(...regions.map(region => {
        const opt = document.createElement('option');
        opt.value = opt.textContent = region;
        return opt;
    }));
    addLog(`SYSTEM: Regions updated for ${provider}`);
};

const handleSelection = (e) => {
    const target = e.target.closest('.provision-opt');
    if (!target) return;

    const parent = target.parentElement;
    const type = parent.dataset.type; // cloud or os
    const value = target.dataset.value;

    parent.querySelector('.active')?.classList.remove('active');
    target.classList.add('active');

    if (type === 'cloud') updateRegionDropdown(value);
    addLog(`${type.toUpperCase()}_CONTEXT: Switched to ${value}`);
};

const updateGauges = () => {
    const update = (id, textId, value) => {
        const offset = CONFIG.gaugeMaxOffset - (value / 100 * CONFIG.gaugeMaxOffset);
        document.getElementById(id).style.strokeDashoffset = offset;
        document.getElementById(textId).textContent = `${value}%`;
    };

    update('cpu-gauge', 'cpu-text', Math.floor(Math.random() * 30) + 10);
    update('ram-gauge', 'ram-text', Math.floor(Math.random() * 20) + 55);
};

// --- PIPELINE LOGIC ---
const startDeployment = async () => {
    const steps = ["Terraform Plan", "Security Scan", "Docker Build", "K8s Apply"];
    dom.deployBtn.disabled = true;
    dom.progressContainer.hidden = false;
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                dom.progressContainer.hidden = true;
                dom.deployBtn.disabled = false;
                addLog("DEPLOY: Production rollout complete.");
            }, 800);
        }

        dom.progressBar.style.width = `${progress}%`;
        dom.progressStatus.textContent = steps[Math.floor((progress / 101) * steps.length)];
    }, 500);
};

const triggerPanic = () => {
    document.body.classList.add('panic-active');
    addLog("!!! CRITICAL: LOCKDOWN INITIATED !!!");
    setTimeout(() => {
        document.body.classList.remove('panic-active');
        alert("SECURITY: Environment isolated. Keys revoked.");
    }, 3000);
};

// --- INITIALIZATION ---
const init = () => {
    // Render Stack
    dom.stackGrid.innerHTML = CONFIG.techStack.map(i => `
        <div class="glass-card">
            <small style="color:var(--accent)">${i.cat}</small>
            <h3>${i.name}</h3>
            <p style="font-size:0.75rem">${i.desc}</p>
        </div>
    `).join('');

    // Event Delegation: Nav Hovers
    document.getElementById('nav-links-container').addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('nav-item')) {
            dom.hoverDesc.textContent = e.target.dataset.info;
            dom.hoverDesc.style.color = "var(--text)";
        }
    });

    document.getElementById('nav-links-container').addEventListener('mouseout', () => {
        dom.hoverDesc.textContent = "Hover over a component...";
        dom.hoverDesc.style.color = "var(--accent)";
    });

    // Event Delegation: Provisioning Buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.provision-opt')) handleSelection(e);
        if (e.target.id === 'deploy-btn') startDeployment();
        if (e.target.id === 'panic-btn') triggerPanic();
    });

    // Region Select Listener
    dom.regionSelect.addEventListener('change', () => addLog(`NET_CONFIG: Region locked to ${dom.regionSelect.value}`));

    // Cycles
    updateRegionDropdown('AWS');
    setInterval(updateGauges, 3000);
    addLog("Nexus Core Online. Monitoring Production...");
};

document.addEventListener('DOMContentLoaded', init);