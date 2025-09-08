#!/bin/bash

# Skavtech Platform Automated Backup Script
# This script creates backups of the database and application data

set -e

# Configuration
BACKUP_DIR="/var/backups/skavtech"
RETENTION_DAYS=30
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="skavtech_backup_${TIMESTAMP}"

# Database configuration
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"skavtech_prod"}
DB_USER=${DB_USER:-"skavtech_user"}
DB_PASSWORD=${DB_PASSWORD}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting backup process at $(date)"

# Database backup
echo "Creating database backup..."
export PGPASSWORD="$DB_PASSWORD"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --format=custom \
  --compress=9 \
  --verbose \
  --file="$BACKUP_DIR/${BACKUP_NAME}_db.backup"

# Application data backup (logs, uploads, etc.)
echo "Creating application data backup..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_app.tar.gz" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='dist' \
  /opt/skavtech/

# Create backup manifest
cat > "$BACKUP_DIR/${BACKUP_NAME}_manifest.txt" << EOF
Backup Information
==================
Timestamp: $(date)
Backup Name: $BACKUP_NAME
Database: $DB_NAME
Host: $DB_HOST
Size: $(du -sh "$BACKUP_DIR/${BACKUP_NAME}_db.backup" | cut -f1)
App Size: $(du -sh "$BACKUP_DIR/${BACKUP_NAME}_app.tar.gz" | cut -f1)

Files:
- ${BACKUP_NAME}_db.backup (PostgreSQL dump)
- ${BACKUP_NAME}_app.tar.gz (Application data)
- ${BACKUP_NAME}_manifest.txt (This file)
EOF

# Encrypt sensitive backup files (optional)
if command -v gpg &> /dev/null; then
    echo "Encrypting backup files..."
    gpg --encrypt --recipient backup@skavtech.co.ke \
        "$BACKUP_DIR/${BACKUP_NAME}_db.backup" || true
    rm "$BACKUP_DIR/${BACKUP_NAME}_db.backup"
fi

# Clean up old backups
echo "Cleaning up old backups..."
find "$BACKUP_DIR" -name "skavtech_backup_*.backup" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "skavtech_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "skavtech_backup_*_manifest.txt" -mtime +$RETENTION_DAYS -delete

# Verify backup integrity
echo "Verifying backup integrity..."
if [ -f "$BACKUP_DIR/${BACKUP_NAME}_db.backup.gpg" ]; then
    gpg --decrypt "$BACKUP_DIR/${BACKUP_NAME}_db.backup.gpg" | pg_restore --list > /dev/null
    echo "Database backup integrity verified"
fi

# Send notification (optional)
if command -v curl &> /dev/null; then
    curl -X POST "https://api.skavtech.co.ke/notify" \
         -H "Content-Type: application/json" \
         -d "{\"message\": \"Backup completed successfully: $BACKUP_NAME\", \"status\": \"success\"}" || true
fi

echo "Backup completed successfully at $(date)"
echo "Backup location: $BACKUP_DIR"
echo "Backup size: $(du -sh "$BACKUP_DIR" | tail -1 | cut -f1)"