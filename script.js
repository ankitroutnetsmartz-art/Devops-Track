/**
 * Nexus OS v3.0 - High-Logic Script
 * Features: Latency Simulator, Region Configurator, FinOps Engine
 */

"use strict";

const NEXUS = {
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

    log: function(msg, type = 'info') {
        const feed = document.getElementById('log-feed');
        if (!feed) return;
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        const ts = new Date().toLocaleTimeString('en-GB');
        
        // Color mapping for production UI
        const colors = { 
            info: '#888', 
            error: '#ff4d4d', 
            success: '#00ff9d' 
        };
        
        entry.innerHTML = `<span class="ts" style="color:#555">[${ts}]</span> <span style="color:${colors[type]}">${msg}</span>`;
        feed.prepend(entry);
    },

    writeShell: function(text, color = '#00e5ff') {
        const out = document.getElementById('bash-output');
        const line = document.createElement('div');
        line.style.color = color;
        line.style.marginBottom = '4px';
        line.style.fontFamily = 'JetBrains Mono, monospace';
        line.innerHTML = text;
        out.appendChild(line);
        out.scrollTop = out.scrollHeight;
    },

    updateCosts: function() {
        let total = 0;
        const activeProv = document.querySelector('.provider-btn.active');
        const prov = activeProv ? activeProv.dataset.id : 'AWS';
        
        total += this.config.pricing[prov] || 0;
        
        document.querySelectorAll('.stack-select:not(#region-selector)').forEach(sel => {
            total += this.config.pricing[sel.value] || 0;
        });
        
        const burnRateEl = document.getElementById('burn-rate');
        if (burnRateEl) burnRateEl.innerText = total.toFixed(2);
    },

    syncRegions: function(provider) {
        const selector = document.getElementById('region-selector');
        const nav = document.getElementById('current-region');
        const list = this.config.regions[provider];
        
        if (selector && list) {
            selector.innerHTML = list.map(r => `<option value="${r}">${r}</option>`).join('');
            nav.innerText = list[0].toUpperCase();
        }
    },

    init: function() {
        const self = this;

        // 1. Render Pillars
        const grid = document.getElementById('stack-grid');
        if (grid) {
            grid.innerHTML = this.config.pillars.map(p => `
                <div class="stack-card">
                    <div class="panel-header" style="color:#00e5ff; font-size: 0.7rem;">${p.id.toUpperCase()}</div>
                    <h3 style="margin: 10px 0; font-size: 1rem;">${p.name}</h3>
                    <select class="stack-select" data-pillar="${p.id}" style="width:100%; background:#111; color:#eee; border:1px solid #333; padding:5px;">
                        ${p.opts.map(o => `<option value="${o}">${o}</option>`).join('')}
                    </select>
                </div>
            `).join('');
        }

        // 2. Provider Listeners
        document.querySelectorAll('.provider-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.provider-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                self.syncRegions(btn.dataset.id);
                self.updateCosts();
                self.log(`Context switched: ${btn.dataset.id}`);
            });
        });

        // 3. Region Selector
        const regSel = document.getElementById('region-selector');
        if (regSel) {
            regSel.addEventListener('change', (e) => {
                document.getElementById('current-region').innerText = e.target.value.toUpperCase();
                self.log(`Region targeted: ${e.target.value}`, 'success');
            });
        }

        // 4. Deploy Logic
        const dBtn = document.getElementById('deploy-btn');
        if (dBtn) {
            dBtn.addEventListener('click', () => {
                dBtn.disabled = true;
                dBtn.innerText = "PROVISIONING...";
                self.log("Initializing Terraform provider...", "info");
                self.writeShell("> terraform init && terraform apply -auto-approve", "#00e5ff");
                
                setTimeout(() => {
                    self.writeShell("Success: 24 resources added, 0 changed, 0 destroyed.", "#00ff9d");
                    self.log("Cluster Deployment Success", "success");
                    dBtn.disabled = false;
                    dBtn.innerText = "DEPLOY STACK";
                }, 2500);
            });
        }

        // 5. Panic Logic
        const pBtn = document.getElementById('panic-btn');
        if (pBtn) {
            pBtn.addEventListener('click', () => {
                if(confirm("CRITICAL: Trigger Emergency Cluster Shutdown?")) {
                    self.log("EMERGENCY STOP INITIATED", "error");
                    self.writeShell("[FATAL] SIGKILL received. Halting all nodes.", "#ff4d4d");
                    document.querySelectorAll('.stack-card').forEach(c => c.style.opacity = "0.2");
                    setTimeout(() => {
                        document.querySelectorAll('.stack-card').forEach(c => c.style.opacity = "1");
                        self.log("System recovery complete.");
                    }, 3000);
                }
            });
        }

        // 6. Terminal Input
        const bInput = document.getElementById('bash-input');
        if (bInput) {
            bInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const cmd = e.target.value.trim().toLowerCase();
                    if (!cmd) return;
                    self.writeShell(`<span style="color:#00ff9d">➜ ~</span> ${cmd}`);
                    
                    const responses = {
                        'help': "Commands: status, deploy, clear, whoami",
                        'status': "All systems operational. Uptime: 99.99%",
                        'whoami': "ankit@ntz-linux-003 (Senior DevOps Engineer)",
                        'deploy': "Click the 'DEPLOY STACK' button for visual orchestration."
                    };

                    if (cmd === 'clear') {
                        document.getElementById('bash-output').innerHTML = '';
                    } else {
                        self.writeShell(responses[cmd] || `bash: command not found: ${cmd}`, cmd in responses ? "#eee" : "#ff4d4d");
                    }
                    e.target.value = '';
                }
            });
        }

        // 7. Telemetry Heartbeat
        setInterval(() => {
            const activeProv = document.querySelector('.provider-btn.active');
            const prov = activeProv ? activeProv.dataset.id : 'AWS';
            const base = prov === 'AWS' ? 20 : prov === 'GCP' ? 35 : 45;
            const lat = base + Math.floor(Math.random() * 10 - 5);
            
            const latEl = document.getElementById('latency-val');
            if (latEl) {
                latEl.innerText = `${lat} ms`;
                latEl.style.color = lat < 30 ? '#00ff9d' : (lat < 55 ? '#00e5ff' : '#ff9800');
            }

            const cpu = Math.floor(Math.random() * 20) + 10;
            const ram = Math.floor(Math.random() * 10) + 70;
            const cpuVal = document.getElementById('cpu-val');
            const ramVal = document.getElementById('ram-val');
            const cpuRing = document.getElementById('cpu-ring');
            const ramRing = document.getElementById('ram-ring');

            if (cpuVal) cpuVal.innerText = cpu + '%';
            if (ramVal) ramVal.innerText = ram + '%';
            
            // Formula: Circumference (138) - (percentage * 1.38)
            if (cpuRing) cpuRing.style.strokeDashoffset = 138 - (1.38 * cpu);
            if (ramRing) ramRing.style.strokeDashoffset = 138 - (1.38 * ram);
        }, 2000);

        // 8. Event Delegation for Cost Updates
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('stack-select')) self.updateCosts();
        });

        // Boot Sequence
        this.syncRegions('AWS');
        this.updateCosts();
        this.log("Nexus OS v3.0 Online.");
    }
};

document.addEventListener('DOMContentLoaded', () => NEXUS.init());