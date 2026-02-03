FROM node:lts AS builder

WORKDIR /app
RUN npm install -g @angular/cli@latest
COPY client/. .
RUN npm install
RUN ng build --configuration=pre-production


FROM ubuntu/apache2:latest

COPY --from=builder app/dist/client/browser/ /var/www/html/
RUN chmod -R 755 /var/www/html/

# Dockerfile Angular - après avoir copié les fichiers et avant de démarrer Apache
RUN a2enmod proxy proxy_http rewrite headers

# Copie du vhost
COPY ./docker/preprod/client/config/angular.conf /etc/apache2/sites-available/000-default.conf

# Redémarrage d'Apache
RUN apachectl restart