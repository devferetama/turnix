FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /workspace

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN yarn install --immutable

COPY . .

RUN yarn workspace api prisma:generate \
  && yarn workspace api build

EXPOSE 3001

CMD ["sh", "apps/api/scripts/docker-entrypoint.sh"]
