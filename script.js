/**
 * Nexus OS v2.2 - Master Engine
 * Target: ankit@NTZ-LINUX-003
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
    progPerc: document.getElementById('progress-percent'),
    cloudBtns: document.querySelectorAll('.provision-opt')
};

// --- Utility: System Logging ---
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

// --- Core Initialization ---
const init = () => {
    // 1. Render 5-Pillar Grid
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

    // 2. Cloud Provider Switching Logic
    UI.cloudBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Update: Active State
            UI.cloudBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Logic Update: Regions
            const provider = btn.getAttribute('data-value');
            const regions = CONFIG.cloud[provider];
            UI.regionSelect.innerHTML = regions.map(r => `<option value="${r}">${r}</option>`).join('');

            // Terminal Feedback
            addSystemLog(`INFRA: Switched to ${provider} context.`);
            writeToShell(`SYSTEM_SYNC: cloud_provider=${provider}`, 'success');
        });
    });

    // 3. Shell Command Handler
    UI.termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = UI.termInput.value.trim().toLowerCase();
            writeToShell(`<span class="prompt">ankit@NTZ-LINUX-003:~$</span> ${cmd}`);
            
            const parts = cmd.split(' ');
            switch(parts[0]) {
                case 'help':
                    writeToShell('Commands: ls, status, clear, whoami, set [pillar] [tool]');
                    break;
                case 'ls':
                    writeToShell('iac/  orch/  db/  cicd/  sec/  config.json');
                    break;
                case 'status':
                    writeToShell('NEXUS_CORE: OPTIMAL | ALL PILLARS NOMINAL', 'success');
                    break;
                case 'whoami':
                    writeToShell('ankit (Senior DevOps Engineer)');
                    break;
                case 'clear':
                    UI.interTerm.innerHTML = '';
                    break;
                case 'set':
                    writeToShell(`Updating ${parts[1]} to ${parts[2]}...`, 'success');
                    break;
                default:
                    writeToShell(`bash: ${cmd}: command not found`, 'error');
            }
            UI.termInput.value = '';
        }
    });

    // 4. Telemetry Loop
    setInterval(() => {
        const cpu = Math.floor(Math.random() * 30) + 15;
        const ram = Math.floor(Math.random() * 20) + 60;
        
        document.getElementById('cpu-gauge').style.strokeDashoffset = 125 - (cpu / 100 * 125);
        document.getElementById('cpu-text').textContent = `${cpu}%`;
        
        document.getElementById('ram-gauge').style.strokeDashoffset = 125 - (ram / 100 * 125);
        document.getElementById('ram-text').textContent = `${ram}%`;
    }, 1500);

    // 5. Deployment Simulation
    document.getElementById('deploy-btn').addEventListener('click', () => {
        UI.progCont.hidden = false;
        let p = 0;
        const interval = setInterval(() => {
            p += 4;
            UI.progBar.style.width = `${p}%`;
            UI.progPerc.textContent = `${p}%`;
            if (p >= 100) {
                clearInterval(interval);
                addSystemLog("SYNC: Production rollout successful.");
                writeToShell("SUCCESS: Environment Deployed", "success");
                setTimeout(() => UI.progCont.hidden = true, 2500);
            }
        }, 80);
    });

    // Initial Trigger for AWS Regions
    document.querySelector('.provision-opt.active').click();
    addSystemLog("Nexus Core v2.2 Initialized.");
};

document.addEventListener('DOMContentLoaded', init);