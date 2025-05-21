FROM node:20-alpine

WORKDIR /usr/app/metaverse

# RUN npm install -g pnpm

COPY ./package*.json ./
COPY ./turbo.json ./
# COPY ./pnpm-*.yaml ./
COPY ./apps/ws ./apps/ws
COPY ./packages ./packages

RUN npm install -g nodemon

RUN npm install

EXPOSE 8080

CMD [ "npm", "run", "start:ws" ]