FROM oven/bun

WORKDIR /app

COPY package.json ./

RUN bun install

COPY . .

EXPOSE 4000

CMD ["bun", "run", "src/index.ts"]
