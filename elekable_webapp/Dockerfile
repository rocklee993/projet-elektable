FROM node:18

WORKDIR /app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application code
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_IGNORE_SWCRC 1

EXPOSE 3000
CMD ["pnpm", "dev"]
