# Use the official PHP 8.3 image with Apache
FROM php:8.3-apache

# Allow Composer to run as root
ENV COMPOSER_ALLOW_SUPERUSER=1

# Expose port 8002
EXPOSE 8002

# Set the working directory
WORKDIR /app

# Install necessary packages and Composer
RUN apt-get update -qq && \
    apt-get install -qy git unzip zip && \
    curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Add and install PHP extensions
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions opcache intl pdo_mysql

# Copy and configure PHP settings
RUN cp /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini
COPY ./docker/preprod/api/config/php.ini /usr/local/etc/php/conf.d/php-overrides.ini

# Copy and configure Apache settings
COPY ./docker/preprod/api/config/vhost.conf /etc/apache2/sites-available/000-default.conf
COPY ./docker/preprod/api/config/apache.conf /etc/apache2/conf-available/z-apache.conf

# Enable Apache modules and configurations
RUN a2enmod rewrite && \
    a2enmod remoteip && \
    a2enconf z-apache

# Copy application code
COPY ./api .

# Set permissions for the var directory
# Ensure /app/var directory exists
RUN mkdir -p /app/var && \
    chown -R www-data:www-data /app/var && \
    chmod -R 777 /app/var

ENTRYPOINT ["bash", "./entrypoint.preprod.sh"]
