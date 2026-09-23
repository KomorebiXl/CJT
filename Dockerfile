# ---------- 构建阶段：Node 22 + pnpm 11（与本地环境一致，lockfile v9） ----------
FROM node:22-alpine AS build
WORKDIR /app

# 容器内无 .git，跳过 package.json 的 prepare(husky) 钩子
ENV HUSKY=0

RUN npm install -g pnpm@11.20.0

# 先只拷依赖清单安装，命中 docker 层缓存
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# 再拷源码构建（vue-tsc -b && vite build），产物输出到 /app/risk_assess_web
COPY . .
RUN pnpm build

# ---------- 运行阶段：nginx 官方镜像，templates 目录 envsubst 渲染配置 ----------
FROM nginx:stable-alpine

COPY --from=build /app/risk_assess_web /usr/share/nginx/html/risk_assess_web
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# 后端完整基地址（运行时 -e 可覆盖，无需重新构建）：
#   现网网关（带前缀）：http://192.168.1.235/ras-prod-api
#   迁移测试裸后端：    http://192.168.1.71:8081
ENV BACKEND_ORIGIN=http://192.168.1.235/ras-prod-api

EXPOSE 80
