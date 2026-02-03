/**
 * Nexus v2.0 - Senior DevOps Partner Logic
 * Strategy: Event Delegation, Smoothed Telemetry, & Async Pipeline Simulation.
 */

"use strict";

const CONFIG = {
    cloud: {
        'AWS': ['us-east-1 (Virginia)', 'us-west-2 (Oregon)', 'eu-central-1 (Frankfurt)'],
        'Azure': ['East US', 'West US 2', 'North Europe'],
        'GCP': ['us-central1 (Iowa)', 'europe-west1 (Belgium)', 'asia-east1 (Taiwan)']
    },
    stack: [
        { name: "Terraform", cat: "IaC", desc: "HCL Infrastructure Provisioning" },
        { name: "Kubernetes", cat: "Orch", desc: "Cloud Native Orchestration" },
        { name: "Actions", cat: "CI/CD", desc: "Automated Workflow Engine" },
        { name: "Vault", cat: "Sec", desc: "Identity-based Secrets Management" }
    ],
    gaugeMax: 125 // Matches SVG stroke-dasharray
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

// --- Utility Functions ---
const addLog = (msg) => {
    const line = document.createElement('div');
    line.innerHTML = `<span style="color: var(--accent)">[${new Date().toLocaleTimeString()}]</span> ${msg}`;
    UI.terminal.prepend(line);
    if (UI.terminal.children.length > 50) UI.terminal.lastChild.remove();
};

// --- Telemetry Perk: Smooth Gauges ---
const updateTelemetry = () => {
    const refreshGauge = (id, textId, min, max) => {
        const val = Math.floor(Math.random() * (max - min)) + min;
        const offset = CONFIG.gaugeMax - (val / 100 * CONFIG.gaugeMax);
        const path = document.getElementById(id);
        const label = document.getElementById(textId);

        if (path && label) {
            path.style.strokeDashoffset = offset;
            label.textContent = `${val}%`;
            
            // Critical Threshold Alerting
            if (val > 85) {
                path.style.stroke = "var(--danger)";
                label.style.color = "var(--danger)";
            } else {
                path.style.stroke = id.includes('cpu') ? "var(--accent)" : "var(--success)";
                label.style.color = "var(--text)";
            }
        }
    };

    refreshGauge('cpu-gauge', 'cpu-text', 15, 45); // Nominal CPU
    refreshGauge('ram-gauge', 'ram-text', 60, 82); // Nominal RAM
};

// --- Core Handlers ---
const updateRegionDropdown = (provider) => {
    const regions = CONFIG.cloud[provider] || [];
    UI.regionSelect.replaceChildren(...regions.map(r => {
        const opt = document.createElement('option');
        opt.value = opt.textContent = r;
        return opt;
    }));
    addLog(`NET_CONFIG: Populated regions for ${provider}`);
};

const runDeployment = async () => {
    const stages = ["Terraform Plan", "Security Audit", "Docker Build", "K8s Rollout"];
    const deployBtn = document.getElementById('deploy-btn');
    
    deployBtn.disabled = true;
    UI.progCont.hidden = false;
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 2;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                UI.progCont.hidden = true;
                deployBtn.disabled = false;
                addLog("DEPLOY: Production cluster synchronization complete.");
            }, 1000);
        }

        UI.progBar.style.width = `${progress}%`;
        UI.progPerc.textContent = `${progress}%`;
        UI.progStat.textContent = stages[Math.floor((progress / 101) * stages.length)];
    }, 350);
};

// --- Initialization ---
const init = () => {
    // 1. Build Tech Stack Cards
    UI.stackGrid.innerHTML = CONFIG.stack.map(item => `
        <article class="glass-card">
            <small style="color: var(--accent); font-weight: 800;">${item.cat}</small>
            <h3 style="margin: 5px 0;">${item.name}</h3>
            <p style="font-size: 0.7rem; color: var(--text-dim); line-height: 1.2;">${item.desc}</p>
        </article>
    `).join('');

    // 2. Global Event Delegation (Click)
    document.addEventListener('click', (e) => {
        // Provisioning Buttons
        const opt = e.target.closest('.provision-opt');
        if (opt) {
            const group = opt.parentElement;
            group.querySelector('.active').classList.remove('active');
            opt.classList.add('active');
            
            if (group.dataset.type === 'cloud') updateRegionDropdown(opt.dataset.value);
            addLog(`UI_EVENT: Context switched to ${opt.dataset.value}`);
        }

        // Action Buttons
        if (e.target.id === 'deploy-btn') runDeployment();
        if (e.target.id === 'panic-btn') {
            document.body.classList.add('panic-active');
            addLog("CRITICAL: LOCKDOWN INITIATED by system administrator.");
            setTimeout(() => document.body.classList.remove('panic-active'), 3000);
        }
    });

    // 3. Nav Hover Delegation
    document.getElementById('nav-links-container').addEventListener('mouseover', (e) => {
        const item = e.target.closest('.nav-item');
        if (item) UI.hoverDesc.textContent = item.dataset.info;
    });

    document.getElementById('nav-links-container').addEventListener('mouseout', () => {
        UI.hoverDesc.textContent = "System idle. Ready for input...";
    });

    // 4. Region Select Change
    UI.regionSelect.addEventListener('change', (e) => {
        addLog(`NET_CONFIG: Target region locked to ${e.target.value}`);
    });

    // Start Telemetry Cycles
    updateRegionDropdown('AWS');
    updateTelemetry();
    setInterval(updateTelemetry, 1000); // 1s loop for smooth glide
    
    addLog("Nexus OS v2.0 Core Online. Uptime: 0.01h");
};

// Safety check for DOM availability
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}