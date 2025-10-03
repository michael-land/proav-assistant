ARG PORT=80
ARG NODE_VERSION=22
ARG NODE_ENV=production

FROM node:${NODE_VERSION}-alpine AS base
RUN corepack enable

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
ENV CI=true


####################################
# Build stage - install dependencies, build the project and prune the monorepo
####################################
FROM base AS builder

WORKDIR /program
RUN pnpm add -g turbo
COPY . .
RUN turbo prune app --docker
 
# 
####################################
# Install dependencies and build the project based on the pruned monorepo
####################################
FROM base AS installer
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

WORKDIR /program
# Install dependencies
COPY --from=builder /program/out/json/ .
COPY --from=builder /program/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /program/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile 
# Build the project
COPY --from=builder /program/out/full/ .
RUN pnpm turbo run build --filter=app


FROM nginx:alpine AS runner
ARG PORT
# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built app - 复制 dist 下的所有内容到 html 根目录
COPY --from=installer /program/apps/app/build/client /usr/share/nginx/html
# Copy nginx configuration
COPY apps/app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE ${PORT}

CMD ["nginx", "-g", "daemon off;"]
