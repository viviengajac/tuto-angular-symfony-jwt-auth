<?php

namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Symfony\Component\Security\Core\User\UserInterface;

class AuthenticationSuccessListener
{
    public function __invoke(AuthenticationSuccessEvent $event): void
    {
        $data = $event->getData();

        /** @var \App\Entity\User $user */
        $user = $event->getUser();

        if (!$user instanceof UserInterface) {
            return;
        }

        $data['id']    = $user->getId();
        $data['email'] = $user->getUserIdentifier();
        $data['roles'] = $user->getRoles();

        $event->setData($data);
    }
}
