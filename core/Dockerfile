# Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO
# All Rights Reserved.

FROM oven/bun:1.3.4 AS build

WORKDIR /guiho

# First stage: build the TypeScript project
COPY package.json package.json
COPY bun.lock bun.lock
COPY .npmrc .npmrc
COPY tsconfig.json tsconfig.json

ENV NODE_ENV=production

COPY . .

RUN bun x google-artifactregistry-auth
RUN bun install

RUN bun typecheck
RUN bun test

RUN bun run compile-linux-x64

#  Second stage: create a minimal runtime image
FROM gcr.io/distroless/base

WORKDIR /guiho

COPY --from=build /guiho/guiho-nante40-core guiho-nante40-core

ENV NODE_ENV=production

CMD ["./guiho-nante40-core"]
