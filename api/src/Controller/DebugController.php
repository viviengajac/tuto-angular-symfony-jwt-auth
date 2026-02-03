<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DebugController
{
    #[Route('/debug/scheme', name: 'debug_scheme')]
    public function scheme(Request $request): Response
    {
        return new Response(sprintf(
            'Scheme: %s | Host: %s | X-Forwarded-Proto: %s | Client IP: %s',
            $request->getScheme(),
            $request->getHost(),
            $request->headers->get('X-Forwarded-Proto', 'not set'),
            $request->getClientIp(),
        ));
    }
}
