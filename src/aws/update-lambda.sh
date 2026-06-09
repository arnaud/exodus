#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REGION="${AWS_DEFAULT_REGION:-us-west-2}"

cd "$SCRIPT_DIR/lambda"
zip -qr /tmp/exodus-lambda.zip .
cd "$SCRIPT_DIR"

aws lambda update-function-code \
  --function-name exodus-deploy \
  --zip-file fileb:///tmp/exodus-lambda.zip \
  --region "$REGION" --output text --query "FunctionArn"

aws lambda wait function-updated-v2 --function-name exodus-deploy --region "$REGION"
rm -f /tmp/exodus-lambda.zip
echo "✅ Lambda updated"
