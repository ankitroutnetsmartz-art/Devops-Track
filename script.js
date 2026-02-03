/**
 * Nexus OS v2.2 - Ubuntu Terminal Edition Engine
 * Integrated: Database Pillar, Command History, & UI Synchronization.
 */

"use strict";

const CONFIG = {
    cloud: { 
        'AWS': ['us-east-1', 'us-west-2', 'eu-central-1'], 
        'Azure': ['East US', 'West US 2', 'North Europe'], 
        'GCP': ['us-central1', 'europe-west1', 'asia-east1'] 
    },
    pillars: [
        { id: "iac", name: "Infrastructure", tools: ["Terraform", "Pulumi", "OpenTofu"] },
        { id: "orch", name: "Orchestration", tools: ["Kubernetes", "Nomad", "OpenShift"] },
        { id: "db", name: "Database", tools: ["PostgreSQL", "MongoDB", "Redis", "DynamoDB", "MySQL"] },
        { id: "cicd", name: "Pipeline", tools: ["GitHub Actions", "Jenkins", "ArgoCD"] },
        { id: "sec", name: "Security", tools: ["Vault", "Snyk", "Trivy"] }
    ],
    gaugeMax: 125
};

const UI = {
    terminal: document.getElementById('terminal'),
    interTerm: document.getElementById('interactive-terminal'),
    termInput: document.getElementById('terminal-input'),
    regionSelect: document.getElementById('region-select'),
    stackGrid: document.getElementById('stack-grid'),
    progBar: document.getElementById('progress-bar'),
    progCont: document.getElementById('progress-container'),
    progStat: document.getElementById('progress-status'),
    progPerc: document.getElementById('progress-percent')
};

// --- Shell State ---
let cmdHistory = [];
let historyIndex = -1;

// --- System Logging ---
const addSystemLog = (msg) => {
    const entry = document.createElement('div');
    entry.innerHTML = `<span style="color: var(--accent)">[${new Date().toLocaleTimeString()}]</span> ${msg}`;
    UI.terminal.prepend(entry);
    if (UI.terminal.children.length > 30) UI.terminal.lastChild.remove();
};

const writeToShell = (text, type = 'output') => {
    const line = document.createElement('div');
    line.className = `term-line term-${type}`;
    line.style.whiteSpace = 'pre-wrap';
    line.innerHTML = text;
    UI.interTerm.appendChild(line);
    UI.interTerm.scrollTop = UI.interTerm.scrollHeight;
};

// --- Pillar Engine ---
const renderPillars = () => {
    UI.stackGrid.innerHTML = CONFIG.pillars.map(p => `
        <article class="glass-card stack-module">
            <small class="module-badge">${p.id.toUpperCase()}</small>
            <h3>${p.name}</h3>
            <select class="provision-select module-select" data-pillar="${p.id}">
                ${p.tools.map(tool => `<option value="${tool}">${tool}</option>`).join('')}
            </select>
            <span class="module-status" id="status-${p.id}">> Service: ${p.tools[0]}</span>
        </article>
    `).join('');
};

// --- Telemetry Simulation ---
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
    refresh('cpu-gauge', 'cpu-text', 15, 45);
    refresh('ram-gauge', 'ram-text', 60, 82);
};

// --- Bash Logic Switchboard ---
const executeCommand = (raw) => {
    const parts = raw.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();

    switch(cmd) {
        case 'help':
        case 'git-log':
            writeToShell('commit 4f2a1b - Merge branch feat/db-pillar\ncommit 9d8e7f - Initial Nexus release', 'success');
            break;
            writeToShell('Commands: ls, status, set [pillar] [tool], clear, uname -a, db-info');
            break;
        case 'ls':
            writeToShell('iac/  orch/  db/  cicd/  sec/  scripts/  config.json');
            break;
        case 'uname':
            writeToShell(parts[1] === '-a' ? 'Linux nexus-ubuntu-pro 6.8.0-40-generic #40-Ubuntu SMP x86_64' : 'Linux');
            break;
        case 'db-info':
            writeToShell('DB_STATUS: Active\nConnections: 128\nEngine: Managed Cluster\nHealth: 100%', 'success');
            break;
        case 'status':
            writeToShell('System: OPTIMAL\nUptime: 112:45:02\nAll 5 pillars reporting green.', 'success');
            break;
        case 'set':
            const [ , pillar, tool] = parts;
            const selectEl = document.querySelector(`.module-select[data-pillar="${pillar?.toLowerCase()}"]`);
            if (selectEl) {
                const option = Array.from(selectEl.options).find(opt => opt.value.toLowerCase() === tool?.toLowerCase());
                if (option) {
                    selectEl.value = option.value;
                    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                    writeToShell(`OK: ${pillar.toUpperCase()} context synchronized to ${option.value}`, 'success');
                } else {
                    writeToShell(`ERR: '${tool}' not found in ${pillar} repository.`, 'error');
                }
            } else {
                writeToShell(`ERR: Pillar '${pillar}' not found in local architecture.`, 'error');
            }
            break;
        case 'clear':
            UI.interTerm.innerHTML = '';
            break;
        default:
            writeToShell(`-bash: ${cmd}: command not found`, 'error');
    }
};

// --- Core Initialization ---
const init = () => {
    renderPillars();

    // MOTD
    writeToShell(`Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-generic)\n * Management: Nexus OS v2.2\n * Pillars: 05 Active\n\nSystem info: ${new Date().toLocaleString()}\n`);

    // Input & History Handlers
    UI.termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = UI.termInput.value;
            if (val) {
                cmdHistory.push(val);
                historyIndex = cmdHistory.length;
                writeToShell(`<span class="prompt">admin@nexus:~$</span> ${val}`);
                executeCommand(val);
            }
            UI.termInput.value = '';
        } else if (e.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                UI.termInput.value = cmdHistory[historyIndex];
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (historyIndex < cmdHistory.length - 1) {
                historyIndex++;
                UI.termInput.value = cmdHistory[historyIndex];
            } else {
                historyIndex = cmdHistory.length;
                UI.termInput.value = '';
            }
            e.preventDefault();
        }
    });

    // Sync Dropdowns to Logs/Shell
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('module-select')) {
            const p = e.target.dataset.pillar;
            document.getElementById(`status-${p}`).textContent = `> Service: ${e.target.value}`;
            addSystemLog(`${p.toUpperCase()}_MGR: Resource updated to ${e.target.value}`);
            writeToShell(`SYS_SYNC: ${p.toUpperCase()} changed -> ${e.target.value}`);
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
                addSystemLog(`CORE: Provider switched to ${opt.dataset.value}`);
            }
        }

        if (e.target.id === 'deploy-btn') {
            UI.progCont.hidden = false;
            let p = 0;
            const interval = setInterval(() => {
                p += Math.floor(Math.random() * 12) + 2;
                if (p >= 100) {
                    p = 100;
                    clearInterval(interval);
                    setTimeout(() => UI.progCont.hidden = true, 1000);
                    addSystemLog("SYNC: Production environment rollout successful.");
                    writeToShell("ROLLOUT COMPLETED SUCCESSFULLY", "success");
                }
                UI.progBar.style.width = p + '%';
                UI.progPerc.textContent = p + '%';
            }, 180);
        }

        if (e.target.id === 'panic-btn') {
            document.body.classList.add('panic-active');
            writeToShell("!! ALERT: EMERGENCY SHUTDOWN COMMAND SENT !!", "error");
            setTimeout(() => document.body.classList.remove('panic-active'), 3000);
        }
    });

    updateTelemetry();
    setInterval(updateTelemetry, 1500);
    addSystemLog("Nexus Core v2.2 Online.");
};

document.addEventListener('DOMContentLoaded', init);