WordPress CI/CD via GitHub Actions
This repository contains a professional-grade CI/CD pipeline for automating WordPress deployments. By leveraging GitHub Actions, this workflow eliminates manual SFTP/SSH transfers, ensuring consistent, version-controlled updates to themes, plugins, or full site configurations.

🏗 System Architecture
The pipeline is designed for a Push-to-Deploy workflow:
Source: Code changes are pushed to the main branch.
Build: GitHub Actions runner initializes and prepares the workspace.
Security: SSH authentication is handled via encrypted GitHub Secrets.
Deploy: An optimized rsync operation synchronizes files to the Ubuntu/AWS production environment.

🚀 Key Features
Atomic Sync: Uses rsync with the --delete flag to ensure the remote directory exactly matches the repository (removes orphaned files).
Automated Testing: (Optional) Integrated linting for PHP and CSS before deployment.
Zero-Downtime: Fast file synchronization minimizes the window of service interruption.
Security First: No hardcoded credentials; uses SSH Private Keys stored in GitHub's encrypted vault.

🛠 Tech Stack
Platform: WordPress (PHP/MySQL)
Automation: GitHub Actions (YAML)
Infrastructure: Ubuntu LTS / AWS EC2
Transfer Protocol: SSH / RSYNC
