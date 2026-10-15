#!/usr/bin/env bash
# ==============================================================================
# 卡车汇移动端 qp-app 官方上游 (feige996/unibest) 自动化安全同步与评估脚本
# 遵循《QP Architecture Constitution》原则 XVI - 优雅融合与基座守护范式
# ==============================================================================

set -e

echo "=== [1/5] 检查 Git 远程源配置 ==="
if ! git remote | grep -q "^upstream$"; then
  echo ">>> 添加 upstream 远程源: git@github.com:feige996/unibest.git"
  git remote add upstream git@github.com:feige996/unibest.git
fi

echo "=== [2/5] 获取官方最新提交与标签 ==="
git fetch upstream

echo "=== [3/5] 检查框架基座核心目录纯净度 ==="
# 守护底层框架目录：http、router，禁止侵入底层实现
if [ -n "$(git status --porcelain src/http src/router)" ]; then
  echo "⚠️ 错误: 框架底层核心目录 (src/http, src/router) 存在未提交或侵入性修改！"
  exit 1
fi
echo "✓ 框架底层核心目录纯净性校验通过！"

echo "=== [4/5] 评估分支合并演练 ==="
STAGING_BRANCH="chore/sync-upstream-eval-$(date +%Y%m%d%H%M%S)"
CURRENT_BRANCH=$(git branch --show-current)

echo ">>> 基于当前分支 [${CURRENT_BRANCH}] 创建临时评估分支 [${STAGING_BRANCH}]..."
git checkout -b "${STAGING_BRANCH}"

echo ">>> 模拟合并 upstream/base..."
if git merge upstream/base --no-commit --no-ff; then
  echo "✓ 官方上游基线合并成功（0 冲突）！"
  git merge --abort || true
else
  echo "⚠️ 发生冲突！请检查以下文件："
  git status --short
  git merge --abort || true
  git checkout "${CURRENT_BRANCH}"
  git branch -D "${STAGING_BRANCH}"
  exit 1
fi

git checkout "${CURRENT_BRANCH}"
git branch -D "${STAGING_BRANCH}"

echo "=== [5/5] 上游同步安全性预检全部通过！ ==="
echo "提示: 您可以随时放心执行真实合并: git merge upstream/base"
