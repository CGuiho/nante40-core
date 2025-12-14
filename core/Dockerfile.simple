# Copyright © 2025 GUIHO Technologies as represented by Cristóvão GUIHO
# All Rights Reserved.

FROM oven/bun:1.3.4

WORKDIR /guiho

COPY . .

RUN bun x google-artifactregistry-auth
RUN bun install

RUN bun typecheck
RUN bun test

CMD ["bun", "run", "start"]
