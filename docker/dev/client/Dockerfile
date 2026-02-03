FROM node:lts

WORKDIR /app

RUN npm install -g @angular/cli@20.1.0 --force

COPY client/package*.json .

RUN npm install

COPY client/* .

CMD ["ng", "serve", "--host", "0.0.0.0"]