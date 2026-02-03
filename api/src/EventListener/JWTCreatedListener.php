<?php

namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class JWTCreatedListener
{
    public function __invoke(JWTCreatedEvent $event)
    {
        /** @var \App\Entity\User $user */
        $user = $event->getUser();

        if (!$user->isVerified()) {
            // Empêche la génération du token
            throw new AccessDeniedHttpException('Votre compte n’est pas encore activé. Vérifiez vos emails ou renvoyez le lien de confirmation.');
        }
    }
}
