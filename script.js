/**
 * Nexus OS v3.0 - High-Logic Script
 * Features: Latency Simulator, Region Configurator, FinOps Engine
 */

"use strict";

const NEXUS = {
    // 1. Data Definitions
    config: {
        regions: {
            'AWS': ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-south-1'],
            'Azure': ['East US', 'West US 2', 'North Europe', 'UK South'],
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
    },

    // 2. Logging & Terminal Output
    log: function(msg, type = 'info') {
        const feed = document.getElementById('log-feed');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        const ts = new Date().toLocaleTimeString('en-GB');
        entry.innerHTML = `<span class="ts">[${ts}]</span> ${msg}`;
        if (type === 'error') entry.style.color = 'var(--danger)';
        if (type === 'success') entry.style.color = 'var(--success)';
        feed.prepend(entry);
    },

    writeShell: function(text, color = 'white') {
        const out = document.getElementById('bash-output');
        const line = document.createElement('div');
        line.style.color = color;
        line.style.marginBottom = '4px';
        line.innerHTML = text;
        out.appendChild(line);
        out.scrollTop = out.scrollHeight;
    },

    // 3. Core Functionality
    updateCosts: function() {
        let total = 0;
        const prov = document.querySelector('.provider-btn.active').dataset.id;
        total += this.config.pricing[prov] || 0;
        
        document.querySelectorAll('.stack-select:not(#region-selector)').forEach(sel => {
            total += this.config.pricing[sel.value] || 30;
        });
        document.getElementById('burn-rate').innerText = total.toFixed(2);
    },

    syncRegions: function(provider) {
        const selector = document.getElementById('region-selector');
        const nav = document.getElementById('current-region');
        const list = this.config.regions[provider];
        
        selector.innerHTML = list.map(r => `<option value="${r}">${r}</option>`).join('');
        nav.innerText = list[0].toUpperCase();
    },

    // 4. Initialization
    init: function() {
        const self = this;

        // Render Pillars
        const grid = document.getElementById('stack-grid');
        grid.innerHTML = this.config.pillars.map(p => `
            <div class="stack-card">
                <div class="panel-header" style="color:var(--accent)">${p.id.toUpperCase()}</div>
                <h3>${p.name}</h3>
                <select class="stack-select" data-pillar="${p.id}">
                    ${p.opts.map(o => `<option value="${o}">${o}</option>`).join('')}
                </select>
            </div>
        `).join('');

        // Provider Listeners
        document.querySelectorAll('.provider-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.provider-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                self.syncRegions(btn.dataset.id);
                self.updateCosts();
                self.log(`Switched context to ${btn.dataset.id}`);
            });
        });

        // Region Dropdown Listener
        document.getElementById('region-selector').addEventListener('change', (e) => {
            document.getElementById('current-region').innerText = e.target.value.toUpperCase();
            self.log(`Region changed to ${e.target.value}`, 'success');
        });

        // Deploy Button Logic
        const dBtn = document.getElementById('deploy-btn');
        dBtn.addEventListener('click', () => {
            dBtn.disabled = true;
            dBtn.innerText = "PROVISIONING...";
            self.log("Starting infrastructure deployment...", "info");
            self.writeShell("> terraform init && terraform apply -auto-approve", "var(--accent)");
            
            setTimeout(() => {
                self.writeShell("Deployment Complete. Infrastructure is Live.", "var(--success)");
                self.log("Cluster Deployment Success", "success");
                dBtn.disabled = false;
                dBtn.innerText = "DEPLOY STACK";
            }, 2500);
        });

        // Panic Button Logic
        document.getElementById('panic-btn').addEventListener('click', () => {
            if(confirm("Trigger Emergency Cluster Shutdown?")) {
                self.log("EMERGENCY STOP INITIATED", "error");
                self.writeShell("[FATAL] SIGKILL received. Halting all nodes.", "var(--danger)");
                document.querySelectorAll('.stack-card').forEach(c => c.style.opacity = "0.4");
                setTimeout(() => {
                    document.querySelectorAll('.stack-card').forEach(c => c.style.opacity = "1");
                    self.log("System recovery complete.");
                }, 3000);
            }
        });

        // Bash Input Logic
        document.getElementById('bash-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = e.target.value.trim();
                if (!cmd) return;
                self.writeShell(`<span style="color:var(--success)">➜ ~</span> ${cmd}`);
                if (cmd === 'help') self.writeShell("Commands: status, deploy, clear, whoami");
                else if (cmd === 'clear') document.getElementById('bash-output').innerHTML = '';
                else self.writeShell(`bash: command not found: ${cmd}`, "var(--danger)");
                e.target.value = '';
            }
        });

        // Telemetry & Latency Heartbeat
        setInterval(() => {
            // Latency Logic
            const prov = document.querySelector('.provider-btn.active').dataset.id;
            const base = prov === 'AWS' ? 20 : prov === 'GCP' ? 35 : 45;
            const lat = base + Math.floor(Math.random() * 10 - 5);
            const latEl = document.getElementById('latency-val');
            latEl.innerText = `${lat} ms`;
            latEl.style.color = lat < 30 ? 'var(--success)' : (lat < 55 ? 'var(--accent)' : 'var(--warning)');

            // System Load Rings
            const cpu = Math.floor(Math.random() * 20) + 10;
            const ram = Math.floor(Math.random() * 10) + 70;
            document.getElementById('cpu-val').innerText = cpu + '%';
            document.getElementById('ram-val').innerText = ram + '%';
            document.getElementById('cpu-ring').style.strokeDashoffset = 138 - (138 * cpu / 100);
            document.getElementById('ram-ring').style.strokeDashoffset = 138 - (138 * ram / 100);
        }, 2000);

        // Global Selector Watcher
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('stack-select')) self.updateCosts();
        });

        // Boot
        this.syncRegions('AWS');
        this.updateCosts();
        this.log("Nexus OS v3.0 Online.");
    }
};

// Start Environment
document.addEventListener('DOMContentLoaded', () => NEXUS.init());