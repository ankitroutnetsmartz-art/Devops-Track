/**
 * Nexus OS v2.2 - Fluid Monitoring Edition
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

let commandHistory = [];
let historyIndex = -1;

// --- Fluid Utility: Smoothed Logging ---
const addSystemLog = (msg) => {
    const entry = document.createElement('div');
    entry.style.opacity = '0';
    entry.style.transform = 'translateX(-10px)';
    entry.style.transition = 'all 0.3s ease-out';
    entry.innerHTML = `<span style="color: var(--accent)">[${new Date().toLocaleTimeString()}]</span> ${msg}`;
    UI.terminal.prepend(entry);
    setTimeout(() => { entry.style.opacity = '1'; entry.style.transform = 'translateX(0)'; }, 10);
};

const writeToShell = (text, type = 'output') => {
    const line = document.createElement('div');
    line.className = `term-line ${type === 'success' ? 'term-success' : type === 'error' ? 'term-error' : ''}`;
    line.innerHTML = text;
    UI.interTerm.appendChild(line);
    UI.interTerm.scrollTop = UI.interTerm.scrollHeight;
};

// --- Fluid Logic: Counter Interpolation ---
const animateValue = (id, start, end, duration) => {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = (progress * (end - start) + start).toFixed(2);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

const updateCost = () => {
    const activeBtn = document.querySelector('.provision-opt.active');
    if (!activeBtn) return;
    const activeProvider = activeBtn.getAttribute('data-value');
    let total = CONFIG.pricing.base[activeProvider] || 0;
    document.querySelectorAll('.module-select').forEach(select => {
        total += CONFIG.pricing.tools[select.value] || 30;
    });

    const currentVal = parseFloat(UI.burnDisplay.textContent) || 0;
    animateValue("monthly-burn", currentVal, total, 400);
    UI.burnDisplay.style.color = total > 1000 ? 'var(--danger)' : '#fff';
};

const init = () => {
    // 1. Render Grid
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

    // 2. Interaction Handlers
    UI.cloudBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            UI.cloudBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            UI.regionSelect.innerHTML = CONFIG.cloud[btn.getAttribute('data-value')].map(r => `<option value="${r}">${r}</option>`).join('');
            updateCost();
        });
    });

    UI.termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = UI.termInput.value.trim();
            if (cmd) {
                writeToShell(`<span class="prompt">ankit@NTZ-LINUX-003:~$</span> ${cmd}`);
                commandHistory.push(cmd);
                historyIndex = commandHistory.length;
                if (cmd.toLowerCase() === 'clear') UI.interTerm.innerHTML = '';
                UI.termInput.value = '';
            }
        }
    });

    UI.interTerm.addEventListener('click', () => UI.termInput.focus());

    // 3. Fluid Telemetry (Increased frequency for "smooth" feel)
    setInterval(() => {
        const cpu = Math.floor(Math.random() * 15) + 20;
        const ram = Math.floor(Math.random() * 5) + 70;
        document.getElementById('cpu-gauge').style.strokeDashoffset = 125 - (cpu / 100 * 125);
        document.getElementById('cpu-text').textContent = `${cpu}%`;
        document.getElementById('ram-gauge').style.strokeDashoffset = 125 - (ram / 100 * 125);
        document.getElementById('ram-text').textContent = `${ram}%`;
    }, 800);

    // 4. Panic & Deploy (Fluid UI Reset)
    document.getElementById('panic-btn').addEventListener('click', () => {
        addSystemLog("CRITICAL: HALT SIGNAL SENT");
        document.querySelectorAll('.module-status').forEach(s => {
            s.style.transition = "color 0.5s ease";
            s.textContent = "> Status: HALTED";
            s.style.color = "var(--danger)";
        });
    });

    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('module-select')) updateCost();
    });

    document.querySelector('.provision-opt.active').click();
};

document.addEventListener('DOMContentLoaded', init);