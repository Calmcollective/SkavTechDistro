#!/bin/bash

# AWS Deployment Script for Skavtech Platform
# This script deploys the application to AWS using CloudFormation

set -e

# Configuration
STACK_NAME="skavtech-platform"
ENVIRONMENT="production"
REGION=${AWS_REGION:-"us-east-1"}
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting AWS Deployment for Skavtech Platform${NC}"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install it first.${NC}"
    exit 1
fi

# Login to ECR
echo -e "${YELLOW}Logging into Amazon ECR...${NC}"
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Create ECR repositories if they don't exist
echo -e "${YELLOW}Creating ECR repositories...${NC}"
aws ecr describe-repositories --repository-names skavtech-frontend --region $REGION || \
aws ecr create-repository --repository-name skavtech-frontend --region $REGION

aws ecr describe-repositories --repository-names skavtech-backend --region $REGION || \
aws ecr create-repository --repository-name skavtech-backend --region $REGION

# Build and push Docker images
echo -e "${YELLOW}Building and pushing Docker images...${NC}"

# Build frontend image
echo -e "${YELLOW}Building frontend image...${NC}"
docker build -f client/Dockerfile -t skavtech-frontend:latest ./client
docker tag skavtech-frontend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/skavtech-frontend:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/skavtech-frontend:latest

# Build backend image
echo -e "${YELLOW}Building backend image...${NC}"
docker build -f server/Dockerfile -t skavtech-backend:latest ./server
docker tag skavtech-backend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/skavtech-backend:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/skavtech-backend:latest

# Store database password in SSM Parameter Store
echo -e "${YELLOW}Setting up database password in SSM...${NC}"
DB_PASSWORD=$(openssl rand -base64 32)
aws ssm put-parameter \
    --name "/skavtech/database/password" \
    --value "$DB_PASSWORD" \
    --type "SecureString" \
    --overwrite

# Deploy CloudFormation stack
echo -e "${YELLOW}Deploying CloudFormation stack...${NC}"
aws cloudformation deploy \
    --template-file deploy/aws/cloudformation.yaml \
    --stack-name $STACK_NAME \
    --parameter-overrides \
        Environment=$ENVIRONMENT \
    --capabilities CAPABILITY_IAM \
    --region $REGION

# Wait for stack creation to complete
echo -e "${YELLOW}Waiting for stack creation to complete...${NC}"
aws cloudformation wait stack-create-complete --stack-name $STACK_NAME --region $REGION

# Get stack outputs
echo -e "${YELLOW}Getting stack outputs...${NC}"
LOAD_BALANCER_DNS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' --output text)
DATABASE_ENDPOINT=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' --output text)

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
npm run db:migrate

# Setup monitoring and alerts
echo -e "${YELLOW}Setting up CloudWatch alarms...${NC}"

# Create CloudWatch alarm for high CPU usage
aws cloudwatch put-metric-alarm \
    --alarm-name "skavtech-high-cpu" \
    --alarm-description "Alarm when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=ClusterName,Value=skavtech-production \
    --evaluation-periods 2 \
    --alarm-actions arn:aws:sns:$REGION:$ACCOUNT_ID:skavtech-alerts

# Create CloudWatch alarm for high memory usage
aws cloudwatch put-metric-alarm \
    --alarm-name "skavtech-high-memory" \
    --alarm-description "Alarm when Memory exceeds 80%" \
    --metric-name MemoryUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=ClusterName,Value=skavtech-production \
    --evaluation-periods 2 \
    --alarm-actions arn:aws:sns:$REGION:$ACCOUNT_ID:skavtech-alerts

# Setup backup automation
echo -e "${YELLOW}Setting up automated backups...${NC}"
aws backup create-backup-plan \
    --backup-plan '{
        "BackupPlanName": "skavtech-daily-backup",
        "Rules": [{
            "RuleName": "daily-backups",
            "TargetBackupVaultName": "skavtech-backup-vault",
            "ScheduleExpression": "cron(0 2 ? * * *)",
            "Lifecycle": {
                "DeleteAfterDays": 30
            }
        }]
    }'

echo -e "${GREEN}✅ AWS Deployment completed successfully!${NC}"
echo -e "${GREEN}📊 Deployment Summary:${NC}"
echo -e "   🌐 Load Balancer: http://$LOAD_BALANCER_DNS"
echo -e "   🗄️  Database: $DATABASE_ENDPOINT"
echo -e "   📍 Region: $REGION"
echo -e "   🏗️  Stack: $STACK_NAME"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo -e "   1. Update your DNS to point to the load balancer"
echo -e "   2. Configure SSL certificate with AWS Certificate Manager"
echo -e "   3. Set up CloudFront CDN for static assets"
echo -e "   4. Configure monitoring dashboards in CloudWatch"
echo ""
echo -e "${GREEN}🎉 Your Skavtech Platform is now live on AWS!${NC}"