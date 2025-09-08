#!/bin/bash

# Setup automated backup cron jobs for Skavtech Platform

# Create backup log directory
mkdir -p /var/log/skavtech

# Add backup cron jobs
(crontab -l ; echo "# Skavtech Platform Automated Backups") || true
(crontab -l ; echo "0 2 * * * /opt/skavtech/scripts/backup.sh >> /var/log/skavtech/backup.log 2>&1") || true
(crontab -l ; echo "# Daily backup at 2 AM") || true

# Create logrotate configuration for backup logs
cat > /etc/logrotate.d/skavtech-backup << EOF
/var/log/skavtech/backup.log {
    daily
    rotate 30
    compress
    missingok
    notifempty
    create 644 root root
    postrotate
        systemctl reload rsyslog > /dev/null 2>&1 || true
    endscript
}
EOF

# Set proper permissions
chmod +x /opt/skavtech/scripts/backup.sh
chmod +x /opt/skavtech/scripts/setup-backup-cron.sh

echo "Automated backup setup completed!"
echo "Backup schedule: Daily at 2:00 AM"
echo "Backup location: /var/backups/skavtech/"
echo "Logs: /var/log/skavtech/backup.log"