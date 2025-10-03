ARG PORT=3000
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
RUN turbo prune api --docker
 

####################################
# Install dependencies and build the project based on the pruned monorepo
####################################
FROM base AS installer

WORKDIR /program
# Install dependencies
COPY --from=builder /program/out/json/ .
COPY --from=builder /program/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /program/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile 
# Build the project
COPY --from=builder /program/out/full/ .
RUN pnpm turbo run build --filter=api
RUN pnpm deploy --filter=api --prod /prod/program --legacy

####################################
# Final stage - setup runtime image
####################################
FROM base AS runner
ARG PORT
ENV PORT=${PORT}
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

WORKDIR /program 
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

COPY --from=installer --chown=hono:nodejs /prod/program .

USER hono
EXPOSE ${PORT}

CMD ["node", "dist/index.js"]