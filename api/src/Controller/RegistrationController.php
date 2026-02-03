<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Security\EmailVerifier;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Psr\Log\LoggerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;

class RegistrationController extends AbstractController
{
    public function __construct(
        private EmailVerifier $emailVerifier,
        private MailerInterface $mailer,
        private LoggerInterface $logger
    ) {}

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $userPasswordHasher,
        EntityManagerInterface $entityManager,
    ): JsonResponse {
        // On décode le JSON envoyé par Angular
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Invalid JSON'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifie que les champs requis existent
        if (empty($data['email']) || empty($data['password'])) {
            return $this->json(['error' => 'Missing fields'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifie que les mots de passe sont similaires
        if ($data['password'] !== $data['confirmPassword']) {
            return $this->json(['error' => 'Passwords mismatch'], Response::HTTP_BAD_REQUEST);
        }

        if (null !== $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']])) {
            $this->handleEmailAlreadyUsed($data['email']);
            return $this->json(['success' => true, 'message' => 'User created, please verify your email.'], Response::HTTP_CREATED);
        }

        // Crée l'utilisateur
        $user = new User();
        $user->setEmail($data['email']);
        $user->setPassword(
            $userPasswordHasher->hashPassword($user, $data['password'])
        );
        $user->setRoles(['ROLE_USER']);

        try {
            $entityManager->persist($user);
            $entityManager->flush();
        } catch (Exception $e) {
            return $this->json(['error' => 'Something happened'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        // Envoi de l’email de confirmation
        $this->sendConfirmationLink($user);

        return $this->json(['success' => true, 'message' => 'User created, please verify your email.'], Response::HTTP_CREATED);
    }

    #[Route('/verify/email', name: 'verify_email', methods: ['GET'])]
    public function verifyUserEmail(Request $request, UserRepository $userRepository): JSONResponse | Response
    {
        $id = $request->query->get('id');

        if (null === $id) {
            return $this->json([
                'success' => false,
                'message' => 'Lien invalide.',
            ], Response::HTTP_BAD_REQUEST);
        }

        $user = $userRepository->find($id);

        if (null === $user) {
            return $this->json([
                'success' => false,
                'message' => 'Lien invalide.',
            ], Response::HTTP_BAD_REQUEST);
        }

        // validate email confirmation link, sets User::isVerified=true and persists
        try {
            $this->emailVerifier->handleEmailConfirmation($request, $user);
        } catch (VerifyEmailExceptionInterface $e) {
            return $this->json([
                'success' => false,
                'code' => match ($e->getReason()) {
                    'expired' => Response::HTTP_GONE,
                    'already_verified' => Response::HTTP_CONFLICT,
                    default => Response::HTTP_BAD_REQUEST,
                },
                'message' => 'Lien invalide ou expiré.',
            ], Response::HTTP_BAD_REQUEST);
        }

        return $this->redirect($this->getParameter('CLIENT_URL') . 'verify-email');
    }

    #[Route('/verify/resend', name: 'resend_verification', methods: ['POST'])]
    public function resendConfirmationLink(Request $request, UserRepository $userRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;

        if (!$email) {
            return new JsonResponse(['message' => 'Utilisateur non authentifié.'], Response::HTTP_UNAUTHORIZED);
        }

        $user = $userRepository->findOneBy(['email' => $email]);

        if (!$user || $user->isVerified()) {
            return new JsonResponse(['message' => 'Aucune action nécessaire.'], Response::HTTP_BAD_REQUEST);
        }

        $this->sendConfirmationLink($user);

        return $this->json([
            "Un nouvel email de confirmation a été envoyé. Veuillez vérifier votre boîte de réception et vos courriers indésirables pour finaliser votre inscription.",
            Response::HTTP_OK,
        ]);
    }

    private function sendConfirmationLink(User $user): void {
        $this->emailVerifier->sendEmailConfirmation(
            'api_verify_email',
            $user,
            (new TemplatedEmail())
                ->from(new Address($this->getParameter('MAILER_USER'), $this->getParameter('MAILER_NAME')))
                ->to($user->getEmail())
                ->subject('Confirmation de votre adresse email')
                ->htmlTemplate('registration/confirmation_email.html.twig')
        );
    }

    private function handleEmailAlreadyUsed(string $userEmail): void {

        $emailMessage = (new TemplatedEmail())
            ->from(new Address($this->getParameter('MAILER_USER'), $this->getParameter('MAILER_NAME')))
            ->to($userEmail)
            ->subject('Tentative de création de compte détectée')
            ->htmlTemplate('registration/email_already_used.html.twig')
            ->context([
                'userEmail' => $userEmail,
                'resetPasswordUrl' => $this->getParameter('CLIENT_URL') . 'forgot-password',
            ]);

        try {
            $this->mailer->send($emailMessage);
        } catch (\Throwable $e) {
            $this->logger->warning(
                sprintf(
                    'Impossible d’envoyer le mail "déjà utilisé" à %s : %s',
                    $userEmail,
                    $e->getMessage()
                )
            );
        }
    }

}
