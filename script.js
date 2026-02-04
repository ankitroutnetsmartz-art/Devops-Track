/**
 * Nexus OS v3.0 - Production Logic
 * Integrated: Region Sync, Latency Heartbeat, FinOps Engine
 */

"use strict";

const DB = {
    regions: {
        'AWS': ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-south-1'],
        'Azure': ['East US', 'West US 2', 'North Europe', 'Central India'],
        'GCP': ['us-central1', 'europe-west1', 'asia-east1', 'asia-south1']
    },
    pillars: [
        { id: 'iac', name: 'Infrastructure (IaC)', opts: ['Terraform', 'Pulumi', 'Ansible'] },
        { id: 'orch', name: 'Orchestration', opts: ['Kubernetes', 'Nomad', 'Swarm'] },
        { id: 'db', name: 'Database Cluster', opts: ['PostgreSQL', 'MongoDB', 'Redis'] },
        { id: 'ci', name: 'CI/CD Pipelines', opts: ['GitHub Actions', 'Jenkins', 'GitLab'] },
        { id: 'sec', name: 'Security & Vault', opts: ['HashiCorp Vault', 'Snyk', 'Trivy'] },
        { id: 'net', name: 'Network & CDN', opts: ['CloudFront', 'Nginx', 'Traefik'] }
    ],
    pricing: {
        'Terraform': 25, 'Kubernetes': 180, 'PostgreSQL': 95, 'GitHub Actions': 50,
        'HashiCorp Vault': 120, 'CloudFront': 70, 'AWS': 450, 'Azure': 420, 'GCP': 390
    }
};

const UI = {
    grid: document.getElementById('stack-grid'),
    burn: document.getElementById('burn-rate'),
    logs: document.getElementById('log-feed'),
    termBody: document.getElementById('bash-output'),
    termInput: document.getElementById('bash-input'),
    regionDrop: document.getElementById('region-selector'),
    regionNav: document.getElementById('current-region'),
    latency: document.getElementById('latency-val'),
    cpuRing: document.getElementById('cpu-ring'),
    ramRing: document.getElementById('ram-ring')
};

// --- 1. SYSTEM LOGGING ---
function log(msg, type = 'info') {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span class="ts">[${new Date().toLocaleTimeString()}]</span> ${msg}`;
    if (type === 'error') entry.style.color = 'var(--danger)';
    UI.logs.prepend(entry);
    if (UI.logs.children.length > 50) UI.logs.lastChild.remove();
}

// --- 2. LATENCY SIMULATOR ---
function simulateLatency() {
    const activeProv = document.querySelector('.provider-btn.active').dataset.id;
    const base = activeProv === 'AWS' ? 20 : activeProv === 'GCP' ? 32 : 45;
    const jitter = Math.floor(Math.random() * 8) - 4;
    const current = base + jitter;
    
    UI.latency.textContent = `${current} ms`;
    UI.latency.style.color = current < 35 ? 'var(--success)' : (current < 55 ? 'var(--accent)' : 'var(--warning)');
}

// --- 3. FINOPS ENGINE ---
function updateCosts() {
    let total = 0;
    const provider = document.querySelector('.provider-btn.active').dataset.id;
    total += DB.pricing[provider] || 0;
    
    document.querySelectorAll('.stack-select:not(#region-selector)').forEach(sel => {
        total += DB.pricing[sel.value] || 40;
    });
    
    UI.burn.textContent = total.toFixed(2);
}

// --- 4. REGION SYNC ---
function syncRegions(provider) {
    const list = DB.regions[provider];
    UI.regionDrop.innerHTML = list.map(r => `<option value="${r}">${r}</option>`).join('');
    UI.regionNav.textContent = list[0].toUpperCase();
}

// --- 5. INITIALIZATION ---
function init() {
    // Render Infrastructure Cards
    UI.grid.innerHTML = DB.pillars.map(p => `
        <div class="stack-card">
            <div class="panel-header" style="color:var(--accent)">${p.id.toUpperCase()}</div>
            <h3>${p.name}</h3>
            <select class="stack-select" data-pillar="${p.id}">
                ${p.opts.map(o => `<option value="${o}">${o}</option>`).join('')}
            </select>
        </div>
    `).join('');

    // Provider Switching Logic
    document.querySelectorAll('.provider-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.provider-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            syncRegions(btn.dataset.id);
            updateCosts();
            log(`Provider context: ${btn.dataset.id}`);
        });
    });

    // Manual Region Change
    UI.regionDrop.addEventListener('change', (e) => {
        UI.regionNav.textContent = e.target.value.toUpperCase();
        log(`Region migration: ${e.target.value}`, 'info');
    });

    // Terminal Input
    UI.termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = UI.termInput.value.trim();
            if (!cmd) return;
            
            const line = document.createElement('div');
            line.innerHTML = `<span class="prompt">➜ ~</span> ${cmd}`;
            UI.termBody.appendChild(line);
            
            if (cmd === 'help') {
                log("User accessed help manual");
                const out = document.createElement('div');
                out.innerHTML = "Available: terraform apply, status, clear";
                UI.termBody.appendChild(out);
            } else if (cmd === 'clear') {
                UI.termBody.innerHTML = '';
            } else {
                const err = document.createElement('div');
                err.style.color = 'var(--danger)';
                err.textContent = `bash: command not found: ${cmd}`;
                UI.termBody.appendChild(err);
            }
            
            UI.termBody.scrollTop = UI.termBody.scrollHeight;
            UI.termInput.value = '';
        }
    });

    // Telemetry and Latency Heartbeat
    setInterval(() => {
        simulateLatency();
        const cpu = Math.floor(Math.random() * 25) + 5;
        const ram = Math.floor(Math.random() * 10) + 70;
        
        document.getElementById('cpu-val').innerText = cpu + '%';
        document.getElementById('ram-val').innerText = ram + '%';
        UI.cpuRing.style.strokeDashoffset = 138 - (138 * cpu / 100);
        UI.ramRing.style.strokeDashoffset = 138 - (138 * ram / 100);
    }, 2000);

    // Initial Execution
    syncRegions('AWS');
    updateCosts();
    log("Nexus OS v3.0 Online");
}

document.addEventListener('DOMContentLoaded', init);
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('stack-select') && e.target.id !== 'region-selector') {
        updateCosts();
        log(`Config Change: ${e.target.dataset.pillar} -> ${e.target.value}`);
    }
});