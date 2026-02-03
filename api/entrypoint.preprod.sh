#!/bin/bash
set -e

# Copier la clé depuis le volume dans le dossier attendu
if [ -f /app/config/secrets/preprod/decrypt/preprod.decrypt.private.php ]; then
    cp /app/config/secrets/preprod/decrypt/preprod.decrypt.private.php /app/config/secrets/preprod/
fi

# Lancer Composer + cache
composer install --no-dev --optimize-autoloader --no-interaction
APP_ENV=preprod APP_DEBUG=0 php bin/console cache:clear

MAX_RETRIES=3
RETRY_COUNT=0

# Migration Doctrine
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    sleep 5

    # Crée la base si nécessaire
    php bin/console doctrine:database:create --if-not-exists

    # Lancer les migrations
    php bin/console doctrine:migrations:migrate --no-interaction

    if [ $? -eq 0 ]; then
        echo "Migration Doctrine réussie"
        break
    else
        echo "Échec de la migration Doctrine (Tentative $RETRY_COUNT/$MAX_RETRIES)"
        RETRY_COUNT=$((RETRY_COUNT + 1))
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "Échec de la migration après $MAX_RETRIES tentatives"
    exit 1
fi

# Fix permissions
chown -R www-data:www-data /app

# Démarrer Apache
exec apache2-foreground
