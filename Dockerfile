FROM node:8-alpine

ENV APP_NAME kosmio-annotator

WORKDIR /var/www

COPY ./config /var/www/config
COPY ./src /var/www/src
COPY ./package.json /var/www/package.json

RUN npm install

CMD ["npm", "start"]
