#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/config.env"

echo "=== Exodus AWS Teardown ==="
echo "This will delete ALL Exodus resources."
read -p "Continue? (y/N) " confirm
[ "$confirm" = "y" ] || exit 0

echo "Deleting ECS services..."
SERVICES=$(aws ecs list-services --cluster "$ECS_CLUSTER" --query "serviceArns[]" --output text --region "$REGION" 2>/dev/null || echo "")
for SVC in $SERVICES; do
  aws ecs update-service --cluster "$ECS_CLUSTER" --service "$SVC" --desired-count 0 --region "$REGION" >/dev/null 2>&1 || true
  aws ecs delete-service --cluster "$ECS_CLUSTER" --service "$SVC" --force --region "$REGION" >/dev/null 2>&1 || true
  echo "  Deleted: $(basename "$SVC")"
done

echo "Deleting ECS cluster..."
aws ecs delete-cluster --cluster "$ECS_CLUSTER" --region "$REGION" >/dev/null 2>&1 || true

echo "Deleting API Gateway..."
aws apigatewayv2 delete-api --api-id "$API_ID" --region "$REGION" 2>/dev/null || true

echo "Deleting Lambda..."
aws lambda delete-function --function-name exodus-deploy --region "$REGION" 2>/dev/null || true

echo "Deleting IAM roles..."
for P in service-role/AmazonECSTaskExecutionRolePolicy CloudWatchLogsFullAccess; do
  aws iam detach-role-policy --role-name exodus-task-execution --policy-arn "arn:aws:iam::aws:policy/$P" 2>/dev/null || true
done
aws iam delete-role --role-name exodus-task-execution 2>/dev/null || true

for P in service-role/AWSLambdaBasicExecutionRole AmazonECS_FullAccess AmazonEC2ReadOnlyAccess; do
  aws iam detach-role-policy --role-name exodus-lambda --policy-arn "arn:aws:iam::aws:policy/$P" 2>/dev/null || true
done
aws iam delete-role --role-name exodus-lambda 2>/dev/null || true

echo "Deleting security group..."
aws ec2 delete-security-group --group-id "$SECURITY_GROUP" --region "$REGION" 2>/dev/null || true

rm -f "$SCRIPT_DIR/config.env"
echo "✅ Teardown complete"
