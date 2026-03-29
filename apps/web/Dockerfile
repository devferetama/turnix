FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /workspace

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN yarn install --immutable

COPY . .

EXPOSE 3000

CMD ["yarn", "workspace", "web", "dev", "--hostname", "0.0.0.0", "--port", "3000"]
