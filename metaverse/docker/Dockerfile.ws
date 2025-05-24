FROM node:20-alpine

WORKDIR /usr/app/metaverse

# RUN npm install -g pnpm

COPY ./package*.json ./
COPY ./packages ./packages

RUN npm install -g nodemon

RUN npm install
COPY ./turbo.json ./
# COPY ./pnpm-*.yaml ./
COPY ./apps/ws ./apps/ws

EXPOSE 8080

CMD [ "npm", "run", "start:ws" ]