FROM php:8.3-apache

COPY ./api /app
WORKDIR /app

# Installation des dépendances nécessaires
RUN apt-get update && \
    apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    libicu-dev \
    libzip-dev \
    && rm -rf /var/lib/apt/lists/*

# Installation de Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Installation de Symfony CLI
RUN curl -sS https://get.symfony.com/cli/installer | bash
RUN mv /root/.symfony*/bin/symfony /usr/local/bin/symfony

# Download using curl
RUN curl -OL https://phars.phpcodesniffer.com/phpcs.phar
RUN curl -OL https://phars.phpcodesniffer.com/phpcbf.phar

# Configuration PHP
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
RUN docker-php-ext-install pdo pdo_mysql

# Configuration Apache
RUN a2enmod rewrite

# Copy and configure PHP settings
RUN cp /usr/local/etc/php/php.ini-development /usr/local/etc/php/php.ini
COPY ./docker/dev/api/config/php.ini /usr/local/etc/php/conf.d/php-overrides.ini
COPY ./docker/dev/api/config/000-default.conf /etc/apache2/sites-available/000-default.conf

# Exécuter l'entrypoint (gestion Doctrine)
RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["bash", "./entrypoint.sh"]