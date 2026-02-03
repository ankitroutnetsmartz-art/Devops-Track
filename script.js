/**
 * Nexus OS v2.0 - Final Consolidated Engine
 * Features: Terminal Command Mapping, Pillar Sync, and Telemetry Loops.
 */

"use strict";

const CONFIG = {
    cloud: {
        'AWS': ['us-east-1', 'us-west-2', 'eu-central-1'],
        'Azure': ['East US', 'West US 2', 'North Europe'],
        'GCP': ['us-central1', 'europe-west1', 'asia-east1']
    },
    pillars: [
        { id: "iac", name: "Infrastructure", tools: ["Terraform", "Pulumi", "CloudFormation", "OpenTofu"] },
        { id: "orch", name: "Orchestration", tools: ["Kubernetes", "Docker Swarm", "Nomad", "OpenShift"] },
        { id: "cicd", name: "Pipeline", tools: ["GitHub Actions", "Jenkins", "GitLab CI", "ArgoCD"] },
        { id: "sec", name: "Security", tools: ["Vault", "Snyk", "SonarQube", "Trivy"] }
    ],
    gaugeMax: 125
};

// --- DOM Cache ---
const UI = {
    terminal: document.getElementById('terminal'),
    interTerm: document.getElementById('interactive-terminal'),
    termInput: document.getElementById('terminal-input'),
    regionSelect: document.getElementById('region-select'),
    stackGrid: document.getElementById('stack-grid'),
    progBar: document.getElementById('progress-bar'),
    progCont: document.getElementById('progress-container'),
    progStat: document.getElementById('progress-status'),
    progPerc: document.getElementById('progress-percent'),
    hoverDesc: document.getElementById('hover-description')
};

// --- Logging & Terminal Outputs ---
const addSystemLog = (msg) => {
    const entry = document.createElement('div');
    entry.innerHTML = `<span style="color: var(--accent)">[${new Date().toLocaleTimeString()}]</span> ${msg}`;
    UI.terminal.prepend(entry);
    if (UI.terminal.children.length > 30) UI.terminal.lastChild.remove();
};

const writeToShell = (text, type = 'output') => {
    const line = document.createElement('div');
    line.className = `term-line term-${type}`;
    line.innerHTML = text;
    UI.interTerm.appendChild(line);
    UI.interTerm.scrollTop = UI.interTerm.scrollHeight;
};

// --- Pillar Management ---
const renderPillars = () => {
    UI.stackGrid.innerHTML = CONFIG.pillars.map(p => `
        <article class="glass-card stack-module" data-pillar="${p.id}">
            <small class="module-badge">${p.id.toUpperCase()}</small>
            <h3 class="module-title">${p.name}</h3>
            <select class="provision-select module-select" data-pillar="${p.id}">
                ${p.tools.map(tool => `<option value="${tool}">${tool}</option>`).join('')}
            </select>
            <span class="module-status" id="status-${p.id}">> Service: ${p.tools[0]}</span>
        </article>
    `).join('');
};

// --- Telemetry Loop ---
const updateTelemetry = () => {
    const refresh = (id, textId, min, max) => {
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
    refresh('cpu-gauge', 'cpu-text', 12, 38);
    refresh('ram-gauge', 'ram-text', 55, 78);
};

// --- Command Processor ---
const executeCommand = (raw) => {
    const args = raw.toLowerCase().trim().split(' ');
    const cmd = args[0];

    switch(cmd) {
        case 'help':
            writeToShell('Available: status, set [pillar] [tool], clear, provision');
            break;
        case 'status':
            writeToShell('Nodes: 24 | Pods: 112 | Status: OPTIMAL', 'success');
            break;
        case 'set':
            const [ , pillar, tool] = args;
            const select = document.querySelector(`.module-select[data-pillar="${pillar}"]`);
            if (select) {
                const opt = Array.from(select.options).find(o => o.value.toLowerCase() === tool);
                if (opt) {
                    select.value = opt.value;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    writeToShell(`SYNC: ${pillar.toUpperCase()} updated to ${opt.value}`, 'success');
                } else {
                    writeToShell(`ERR: Tool '${tool}' not found for ${pillar}`, 'error');
                }
            } else {
                writeToShell(`ERR: Pillar '${pillar}' not recognized`, 'error');
            }
            break;
        case 'clear':
            UI.interTerm.innerHTML = '';
            break;
        default:
            writeToShell(`Command not found: ${cmd}`, 'error');
    }
};

// --- Event Listeners ---
const init = () => {
    renderPillars();

    // Command Input
    UI.termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = UI.termInput.value;
            if (!val) return;
            writeToShell(`<span class="prompt">admin@nexus:~$</span> ${val}`);
            executeCommand(val);
            UI.termInput.value = '';
        }
    });

    // Pillar Dropdown Logic
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('module-select')) {
            const pillar = e.target.dataset.pillar;
            const val = e.target.value;
            document.getElementById(`status-${pillar}`).textContent = `> Service: ${val}`;
            addSystemLog(`${pillar.toUpperCase()}_ENG: Switched to ${val}`);
            writeToShell(`UI_SYNC: Pillar ${pillar} set to ${val}`, 'output');
        }
    });

    // Global Click Delegation
    document.addEventListener('click', (e) => {
        const opt = e.target.closest('.provision-opt');
        if (opt) {
            const group = opt.parentElement;
            group.querySelector('.active').classList.remove('active');
            opt.classList.add('active');
            if (group.dataset.type === 'cloud') {
                const regions = CONFIG.cloud[opt.dataset.value];
                UI.regionSelect.innerHTML = regions.map(r => `<option>${r}</option>`).join('');
            }
            addSystemLog(`REGION: Primary cloud set to ${opt.dataset.value}`);
        }

        if (e.target.id === 'deploy-btn') {
            UI.progCont.hidden = false;
            let p = 0;
            const interval = setInterval(() => {
                p += 5;
                UI.progBar.style.width = p + '%';
                UI.progPerc.textContent = p + '%';
                if (p >= 100) {
                    clearInterval(interval);
                    setTimeout(() => UI.progCont.hidden = true, 1000);
                    addSystemLog("DEPLOY: Rollout complete.");
                }
            }, 150);
        }

        if (e.target.id === 'panic-btn') {
            document.body.classList.add('panic-active');
            addSystemLog("ALARM: Emergency lockdown!");
            setTimeout(() => document.body.classList.remove('panic-active'), 3000);
        }
    });

    // Nav Hover
    document.getElementById('nav-links-container').addEventListener('mouseover', (e) => {
        const info = e.target.closest('.nav-item')?.dataset.info;
        if (info) UI.hoverDesc.textContent = info;
    });

    // Start Intervals
    updateTelemetry();
    setInterval(updateTelemetry, 1000);
    addSystemLog("NEXUS_OS: Systems initialized.");
};

document.addEventListener('DOMContentLoaded', init);