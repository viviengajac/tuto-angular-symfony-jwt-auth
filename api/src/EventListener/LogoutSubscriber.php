<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Event\LogoutEvent;

class LogoutSubscriber implements EventSubscriberInterface
{
    public function __construct(private UrlGeneratorInterface $urlGenerator) {}

    public static function getSubscribedEvents(): array
    {
        return [LogoutEvent::class => 'onLogout'];
    }

    public function onLogout(LogoutEvent $event): void
    {
        // get the security token of the session that is about to be logged out
        // $token = $event->getToken();

        // get the current request
        // $request = $event->getRequest();

        // get the current response, if it is already set by another listener
        $response = $event->getResponse();

        // configure a custom logout response to the homepage
        // $response = new RedirectResponse(
        //     $this->urlGenerator->generate('homepage'),
        //     RedirectResponse::HTTP_SEE_OTHER
        // );

        // Suppression du cookie BEARER
        $response->headers->clearCookie(
            'BEARER',
            '/',
            null, // domaine, null = par défaut
            true, // secure
            true, // httpOnly
            'lax' // sameSite
        );

        // Suppression du cookie refresh_token
        $response->headers->clearCookie(
            'refresh_token',
            '/',
            null,
            true,
            true,
            'lax'
        );
        
        $event->setResponse($response);
    }
}