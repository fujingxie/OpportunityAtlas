FROM node:20-alpine

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG DATABASE_URL="postgresql://opportunity_atlas:opportunity_atlas@postgres:5432/opportunity_atlas?schema=public"
ENV DATABASE_URL=$DATABASE_URL

RUN npm run db:generate
RUN npm run build

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]
