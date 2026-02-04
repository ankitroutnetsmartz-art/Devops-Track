/**
 * Nexus OS v2.2 - Master Integrated Engine
 * Target Infrastructure: ankit@NTZ-LINUX-003
 * Modules: FinOps, Cloud-Sync, Telemetry, Terminal
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

// --- System Utility: Logging ---
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

// --- Core Logic: FinOps Cost Calculation ---
const updateCost = () => {
    const activeBtn = document.querySelector('.provision-opt.active');
    if (!activeBtn) return;

    const activeProvider = activeBtn.getAttribute('data-value');
    let total = CONFIG.pricing.base[activeProvider] || 0;

    // Add cost of selected tools
    document.querySelectorAll('.module-select').forEach(select => {
        total += CONFIG.pricing.tools[select.value] || 30;
    });

    // Update Display with simple counting effect
    UI.burnDisplay.textContent = total.toFixed(2);
    
    // Budget Alert Logic (UI Feedback)
    if (total > 1000) {
        UI.burnDisplay.style.color = 'var(--danger)';
        addSystemLog("WARN: Monthly burn rate exceeds $1,000 budget threshold!");
    } else {
        UI.burnDisplay.style.color = '#fff';
    }
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

    // 2. Cloud Provider Interaction
    UI.cloudBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            UI.cloudBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const provider = btn.getAttribute('data-value');
            const regions = CONFIG.cloud[provider];
            UI.regionSelect.innerHTML = regions.map(r => `<option value="${r}">${r}</option>`).join('');

            addSystemLog(`INFRA: Context switched to ${provider}`);
            writeToShell(`SYSTEM_SYNC: cloud_provider=${provider}`, 'success');
            updateCost();
        });
    });

    // 3. Tool Change Listener (FinOps Hook)
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('module-select')) {
            updateCost();
            addSystemLog(`CONFIG: Modified ${e.target.getAttribute('data-pillar')} stack.`);
        }
    });

    // 4. Shell Command Handler
    UI.termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = UI.termInput.value.trim().toLowerCase();
            writeToShell(`<span class="prompt">ankit@NTZ-LINUX-003:~$</span> ${cmd}`);
            
            const parts = cmd.split(' ');
            switch(parts[0]) {
                case 'help':
                    writeToShell('Commands: ls, status, clear, whoami, cost');
                    break;
                case 'ls':
                    writeToShell('iac/  orch/  db/  cicd/  sec/  finops_report.csv');
                    break;
                case 'status':
                    writeToShell('SYSTEM: OPTIMAL | ALL PILLARS NOMINAL', 'success');
                    break;
                case 'cost':
                    writeToShell(`CURRENT BURN RATE: $${UI.burnDisplay.textContent}/mo`, 'success');
                    break;
                case 'whoami':
                    writeToShell('ankit (Senior DevOps Engineer)');
                    break;
                case 'clear':
                    UI.interTerm.innerHTML = '';
                    break;
                default:
                    writeToShell(`bash: ${cmd}: command not found`, 'error');
            }
            UI.termInput.value = '';
        }
    });

    // 5. Hardware Telemetry Loop
    setInterval(() => {
        const cpu = Math.floor(Math.random() * 25) + 10;
        const ram = Math.floor(Math.random() * 15) + 55;
        
        document.getElementById('cpu-gauge').style.strokeDashoffset = 125 - (cpu / 100 * 125);
        document.getElementById('cpu-text').textContent = `${cpu}%`;
        
        document.getElementById('ram-gauge').style.strokeDashoffset = 125 - (ram / 100 * 125);
        document.getElementById('ram-text').textContent = `${ram}%`;
    }, 2000);

    // 6. Deployment Logic
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

    // Initial Trigger
    document.querySelector('.provision-opt.active').click();
    addSystemLog("Nexus OS v2.2 - Security and FinOps Modules Ready.");
};

document.addEventListener('DOMContentLoaded', init); 