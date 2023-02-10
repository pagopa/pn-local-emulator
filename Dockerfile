ARG NODE_VERSION=18.14.0
# Step 1 - Compile code
FROM node:${NODE_VERSION}-alpine as build

WORKDIR /app

COPY --chown=node:node . /app
RUN npm ci && npm run generate && npm run compile

# Step 2 - Prepare production image
FROM node:${NODE_VERSION}-alpine

RUN npm install -g pm2@5.2.2

RUN mkdir -p /app
RUN chown -Rh node:node /app

USER node
WORKDIR /app
COPY --chown=node:node --from=build /app/dist /app/package.json /app/package-lock.json /app/

ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Install just the production dependencies and avoid to execute the prepare script (which invoke husky, a dev dependency)
RUN npm install --ignore-scripts && npm cache clean --force

EXPOSE 3000
CMD ["pm2-runtime", "/app/main.js"]
