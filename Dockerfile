FROM node:20.17.0-alpine3.20 AS build-env

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY public ./public
COPY astro.config.mjs tsconfig.json  ./

RUN npm run build

FROM nginx:1.29.1-alpine3.22

COPY --from=build-env /app/dist/ /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
