FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# --include=dev: o TypeScript e os @types vivem em devDependencies, e um
# NODE_ENV=production no ambiente faria o npm ci pulá-los.
RUN npm ci --include=dev
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 4000
CMD ["node", "dist/server.js"]
