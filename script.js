/**
 * Nexus OS v2.2 - Master Integrated Engine
 * Environment: ankit@NTZ-LINUX-003
 * Features: FinOps, Cloud-Sync, Linux-Terminal Behavior (History/Focus)
 */

"use strict";

const CONFIG = {
    cloud: { 
        'AWS': ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-south-1'], 
        'Azure': ['East US', 'West US 2', 'North Europe', 'Central India'], 
        'GCP': ['us-central1', 'europe-west1', 'asia-east1', 'asia-south1'] 
    },
    pillars: [
        { id: "iac", name: "Infrastructure", tools: ["Terraform", "Pulumi", "Ansible"] },
        { id: "orch", name: "Orchestration", tools: ["Kubernetes", "Docker Swarm", "Nomad"] },
        { id: "db", name: "Database", tools: ["PostgreSQL", "MongoDB", "Redis", "MySQL"] },
        { id: "cicd", name: "CI/CD Pipeline", tools: ["GitHub Actions", "Jenkins", "ArgoCD"] },
        { id: "sec", name: "Security/Vault", tools: ["HashiCorp Vault", "Snyk", "Trivy"] }
    ],
    pricing: {
        base: { 'AWS': 450.00, 'Azure': 410.00, 'GCP': 380.00 },
        tools: {
            'Terraform': 50, 'Kubernetes': 200, 'PostgreSQL': 80, 
            'MongoDB': 95, 'HashiCorp Vault': 120, 'Jenkins': 40
        }
    }
};

const UI = {
    terminal: document.getElementById('terminal'),
    interTerm: document.getElementById('interactive-terminal'),
    termInput: document.getElementById('terminal-input'),
    regionSelect: document.getElementById('region-select'),
    stackGrid: document.getElementById('stack-grid'),
    progBar: document.getElementById('progress-bar'),
    progCont: document.getElementById('progress-container'),
    progPerc: document.getElementById('progress-percent'),
    cloudBtns: document.querySelectorAll('.provision-opt'),
    burnDisplay: document.getElementById('monthly-burn')
};

// --- Terminal State Variables ---
let commandHistory = [];
let historyIndex = -1;

// --- System Utility Functions ---
const addSystemLog = (msg) => {
    const entry = document.createElement('div');
    entry.innerHTML = `<span style="color: var(--accent)">[${new Date().toLocaleTimeString()}]</span> ${msg}`;
    UI.terminal.prepend(entry);
};

const writeToShell = (text, type = 'output') => {
    const line = document.createElement('div');
    line.className = `term-line ${type === 'success' ? 'term-success' : type === 'error' ? 'term-error' : ''}`;
    line.innerHTML = text;
    UI.interTerm.appendChild(line);
    UI.interTerm.scrollTop = UI.interTerm.scrollHeight;
};

// --- FinOps Calculation ---
const updateCost = () => {
    const activeBtn = document.querySelector('.provision-opt.active');
    if (!activeBtn) return;

    const activeProvider = activeBtn.getAttribute('data-value');
    let total = CONFIG.pricing.base[activeProvider] || 0;

    document.querySelectorAll('.module-select').forEach(select => {
        total += CONFIG.pricing.tools[select.value] || 30;
    });

    UI.burnDisplay.textContent = total.toFixed(2);
    UI.burnDisplay.style.color = total > 1000 ? 'var(--danger)' : '#fff';
};

// --- Core Initialization ---
const init = () => {
    // 1. Render 5-Pillar Stack
    UI.stackGrid.innerHTML = CONFIG.pillars.map(p => `
        <article class="glass-card stack-module">
            <small class="module-badge">${p.id.toUpperCase()}</small>
            <h3>${p.name}</h3>
            <select class="provision-select module-select" data-pillar="${p.id}">
                ${p.tools.map(tool => `<option value="${tool}">${tool}</option>`).join('')}
            </select>
            <span class="module-status" id="status-${p.id}">> Status: ACTIVE</span>
        </article>
    `).join('');

    // 2. Cloud Provider Interaction
    UI.cloudBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            UI.cloudBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const provider = btn.getAttribute('data-value');
            const regions = CONFIG.cloud[provider];
            UI.regionSelect.innerHTML = regions.map(r => `<option value="${r}">${r}</option>`).join('');

            addSystemLog(`INFRA: Context switched to ${provider}`);
            writeToShell(`SYSTEM_SYNC: context=${provider}`, 'success');
            updateCost();
        });
    });

    // 3. Linux Terminal Implementation
    UI.termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = UI.termInput.value.trim();
            if (cmd === '') return;

            writeToShell(`<span class="prompt">ankit@NTZ-LINUX-003:~$</span> ${cmd}`);
            
            // History Management
            commandHistory.push(cmd);
            historyIndex = commandHistory.length;

            const parts = cmd.toLowerCase().split(' ');
            const root = parts[0];

            switch(root) {
                case 'help':
                    writeToShell('Commands: ls, pwd, uname, clear, whoami, history, cost, status');
                    break;
                case 'ls':
                    writeToShell('<span style="color: #729fcf; font-weight: bold;">iac/  orch/  db/  cicd/  sec/  logs/</span>');
                    break;
                case 'pwd':
                    writeToShell('/home/ankit/git/Devops-Track');
                    break;
                case 'uname':
                    writeToShell('Linux NTZ-LINUX-003 6.8.0-generic #24-Ubuntu SMP');
                    break;
                case 'whoami':
                    writeToShell('ankit (Senior DevOps Engineer)');
                    break;
                case 'history':
                    commandHistory.forEach((c, i) => writeToShell(`  ${i + 1}  ${c}`));
                    break;
                case 'cost':
                    writeToShell(`FINOPS: Current monthly burn is $${UI.burnDisplay.textContent}`, 'success');
                    break;
                case 'status':
                    writeToShell('Checking systemd services...');
                    setTimeout(() => writeToShell('● nexus-engine.service - Active (running)', 'success'), 400);
                    break;
                case 'clear':
                    UI.interTerm.innerHTML = '';
                    break;
                default:
                    writeToShell(`bash: ${root}: command not found`, 'error');
            }
            UI.termInput.value = '';

        } else if (e.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                UI.termInput.value = commandHistory[historyIndex];
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                UI.termInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                UI.termInput.value = '';
            }
            e.preventDefault();
        }
    });

    // Auto-focus terminal on click
    UI.interTerm.addEventListener('click', () => UI.termInput.focus());

    // 4. Global Event Listeners
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('module-select')) {
            updateCost();
            addSystemLog(`CONFIG: Modified ${e.target.getAttribute('data-pillar')} stack.`);
        }
    });

    // 5. Telemetry & Deployment
    setInterval(() => {
        const cpu = Math.floor(Math.random() * 20) + 10;
        const ram = Math.floor(Math.random() * 10) + 65;
        document.getElementById('cpu-gauge').style.strokeDashoffset = 125 - (cpu / 100 * 125);
        document.getElementById('cpu-text').textContent = `${cpu}%`;
        document.getElementById('ram-gauge').style.strokeDashoffset = 125 - (ram / 100 * 125);
        document.getElementById('ram-text').textContent = `${ram}%`;
    }, 2000);

    document.getElementById('deploy-btn').addEventListener('click', () => {
        UI.progCont.hidden = false;
        let p = 0;
        const interval = setInterval(() => {
            p += 5;
            UI.progBar.style.width = `${p}%`;
            UI.progPerc.textContent = `${p}%`;
            if (p >= 100) {
                clearInterval(interval);
                addSystemLog("SYNC: Production rollout successful.");
                writeToShell("SUCCESS: Infrastructure Synchronized", "success");
                setTimeout(() => UI.progCont.hidden = true, 2000);
            }
        }, 100);
    });

    // Initial State Trigger
    document.querySelector('.provision-opt.active').click();
    writeToShell('Nexus OS v2.2 initialized. System ready.');
};

document.addEventListener('DOMContentLoaded', init);