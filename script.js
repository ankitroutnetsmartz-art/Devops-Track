/**
 * Nexus OS v2.2 - Chaos & Connectivity Edition
 * Environment: ankit@NTZ-LINUX-003
 * Pillars: 6 (IaC, Orch, DB, CI/CD, SEC, NET)
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
        { id: "sec", name: "Security/Vault", tools: ["HashiCorp Vault", "Snyk", "Trivy"] },
        { id: "net", name: "Network/CDN", tools: ["CloudFront", "Cloudflare", "Akamai", "Route53"] }
    ],
    pricing: {
        base: { 'AWS': 450.00, 'Azure': 410.00, 'GCP': 380.00 },
        tools: {
            'Terraform': 50, 'Kubernetes': 200, 'PostgreSQL': 80, 
            'MongoDB': 95, 'HashiCorp Vault': 120, 'Jenkins': 40,
            'CloudFront': 65, 'Cloudflare': 45, 'Akamai': 150
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

let commandHistory = [];
let historyIndex = -1;
let deployInterval = null;

// --- Utility Functions ---
const addSystemLog = (msg) => {
    const entry = document.createElement('div');
    entry.style.transition = 'all 0.3s ease-out';
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

// --- Cost Engine ---
const updateCost = () => {
    const activeBtn = document.querySelector('.provision-opt.active');
    if (!activeBtn) return;
    const activeProvider = activeBtn.getAttribute('data-value');
    let total = CONFIG.pricing.base[activeProvider] || 0;
    document.querySelectorAll('.module-select').forEach(select => {
        total += CONFIG.pricing.tools[select.value] || 30;
    });
    UI.burnDisplay.textContent = total.toFixed(2);
    UI.burnDisplay.style.color = total > 1200 ? 'var(--danger)' : '#fff';
};

// --- Chaos Engineering: Drift Detection ---
const triggerDrift = () => {
    setInterval(() => {
        const randomPillar = CONFIG.pillars[Math.floor(Math.random() * CONFIG.pillars.length)];
        const statusElement = document.getElementById(`status-${randomPillar.id}`);
        const cardElement = document.getElementById(`module-${randomPillar.id}`);

        if (statusElement && cardElement && !statusElement.textContent.includes("DRIFT")) {
            statusElement.textContent = "> Status: DRIFT_DETECTED";
            statusElement.style.color = "var(--warning)";
            cardElement.style.borderColor = "var(--warning)";
            addSystemLog(`ALERT: Configuration drift in ${randomPillar.name}!`);
            writeToShell(`WARN: state_mismatch in ${randomPillar.id}. Run 'terraform apply' to fix.`, "error");
        }
    }, 30000); // Check every 30 seconds
};

// --- Core Initialization ---
const init = () => {
    // 1. Render 6-Pillar Grid
    UI.stackGrid.innerHTML = CONFIG.pillars.map(p => `
        <article class="glass-card stack-module" id="module-${p.id}" style="border-left: 3px solid var(--accent)">
            <small class="module-badge">${p.id.toUpperCase()}</small>
            <h3>${p.name}</h3>
            <select class="provision-select module-select" data-pillar="${p.id}">
                ${p.tools.map(tool => `<option value="${tool}">${tool}</option>`).join('')}
            </select>
            <span class="module-status" id="status-${p.id}" style="color: var(--success)">> Status: ACTIVE</span>
        </article>
    `).join('');

    // 2. Cloud Interaction
    UI.cloudBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            UI.cloudBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            UI.regionSelect.innerHTML = CONFIG.cloud[btn.getAttribute('data-value')].map(r => `<option value="${r}">${r}</option>`).join('');
            updateCost();
            addSystemLog(`INFRA: Provider set to ${btn.getAttribute('data-value')}`);
        });
    });

    // 3. Linux Terminal
    UI.termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = UI.termInput.value.trim();
            if (!cmd) return;
            writeToShell(`<span class="prompt">ankit@NTZ-LINUX-003:~$</span> ${cmd}`);
            commandHistory.push(cmd);
            historyIndex = commandHistory.length;

            const input = cmd.toLowerCase();
            if (input === 'terraform apply') {
                writeToShell("Refreshing state...", "success");
                setTimeout(() => {
                    document.querySelectorAll('.module-status').forEach(s => {
                        s.textContent = "> Status: ACTIVE";
                        s.style.color = "var(--success)";
                    });
                    document.querySelectorAll('.stack-module').forEach(m => m.style.borderColor = "var(--border)");
                    writeToShell("Apply complete! Resources: 1 added, 1 changed, 0 destroyed.", "success");
                    addSystemLog("SYNC: Infrastructure state restored.");
                }, 1500);
            } else if (input === 'ls') {
                writeToShell('iac/ orch/ db/ cicd/ sec/ net/');
            } else if (input === 'clear') {
                UI.interTerm.innerHTML = '';
            } else {
                writeToShell(`bash: ${cmd}: command not found`, "error");
            }
            UI.termInput.value = '';
        }
    });

    // 4. Panic & Deploy
    document.getElementById('panic-btn').addEventListener('click', () => {
        clearInterval(deployInterval);
        UI.progCont.hidden = true;
        addSystemLog("CRITICAL: Manual Emergency Halt!");
        document.querySelectorAll('.module-status').forEach(s => {
            s.textContent = "> Status: HALTED";
            s.style.color = "var(--danger)";
        });
    });

    document.getElementById('deploy-btn').addEventListener('click', () => {
        UI.progCont.hidden = false;
        let p = 0;
        deployInterval = setInterval(() => {
            p += 5;
            UI.progBar.style.width = `${p}%`;
            UI.progPerc.textContent = `${p}%`;
            if (p >= 100) { clearInterval(deployInterval); writeToShell("DEPLOY SUCCESS", "success"); }
        }, 100);
    });

    // 5. Hooks
    UI.interTerm.addEventListener('click', () => UI.termInput.focus());
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('module-select')) updateCost();
    });

    // Telemetry Loop
    setInterval(() => {
        const cpu = Math.floor(Math.random() * 20) + 15;
        const ram = Math.floor(Math.random() * 10) + 70;
        document.getElementById('cpu-gauge').style.strokeDashoffset = 125 - (cpu / 100 * 125);
        document.getElementById('cpu-text').textContent = `${cpu}%`;
        document.getElementById('ram-gauge').style.strokeDashoffset = 125 - (ram / 100 * 125);
        document.getElementById('ram-text').textContent = `${ram}%`;
    }, 1000);

    // Initial Trigger
    document.querySelector('.provision-opt.active').click();
    triggerDrift();
};

document.addEventListener('DOMContentLoaded', init);