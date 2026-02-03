#!/bin/bash

# Installer les dépendances
symfony composer install --no-interaction

MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    sleep 5

    # Crée la base si nécessaire
    php bin/console doctrine:database:create --if-not-exists

    # Lancer les migrations
    php bin/console doctrine:migrations:migrate

    # Exécute les fixtures
    php bin/console doctrine:fixtures:load --no-interaction

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

# Permissions pour Apache
chown -R www-data:www-data /app \
    && find /app/var -type d -exec chmod 775 {} \; \
    && chmod 755 /app

# Apache est déjà le processus principal du container, donc on ne fait rien d'autre
exec apache2-foreground
