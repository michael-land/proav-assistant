#!/bin/bash
set -e

# 配置
REGISTRY="docker.io/xiaoyutamu"
VERSION=${1:-latest}
PLATFORM="linux/arm64"

echo "🏗️  构建镜像 (版本: ${VERSION})"

# 构建 API
echo "📦 构建 API..."
docker buildx build \
  --platform ${PLATFORM} \
  -f apps/api/Dockerfile \
  -t ${REGISTRY}/proav-assistant-api:${VERSION} \
  -t ${REGISTRY}/proav-assistant-api:latest \
  --push \
  .

# 构建 App
echo "📦 构建 App..."
docker buildx build \
  --platform ${PLATFORM} \
  -f apps/app/Dockerfile \
  -t ${REGISTRY}/proav-assistant-app:${VERSION} \
  -t ${REGISTRY}/proav-assistant-app:latest \
  --push \
  .

echo "✅ 镜像已推送到 ${REGISTRY}"
echo "   - ${REGISTRY}/proav-assistant-api:${VERSION}"
echo "   - ${REGISTRY}/proav-assistant-app:${VERSION}"