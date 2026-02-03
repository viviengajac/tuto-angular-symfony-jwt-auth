<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\ChangePasswordFormType;
use App\Form\ResetPasswordRequestFormType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use SymfonyCasts\Bundle\ResetPassword\Controller\ResetPasswordControllerTrait;
use SymfonyCasts\Bundle\ResetPassword\Exception\ResetPasswordExceptionInterface;
use SymfonyCasts\Bundle\ResetPassword\ResetPasswordHelperInterface;

#[Route('/forgot-password', name: 'forgot_password_')]
class ResetPasswordController extends AbstractController
{
    use ResetPasswordControllerTrait;

    public function __construct(private ResetPasswordHelperInterface $resetPasswordHelper, private EntityManagerInterface $entityManager) {}

    /**
     * 1) Request reset: client envoie { email }
     *    Toujours renvoyer 204 pour ne pas divulguer l'existence d'un user.
     */
    #[Route('/request', name: 'request')]
    public function request(Request $request, MailerInterface $mailer): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;

        // Toujours renvoyer 204 pour éviter de révéler si l'email existe
        if (!$email) {
            return $this->json(null, Response::HTTP_NO_CONTENT);
        }

        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) {
            // pas d'info retournée
            return $this->json(null, Response::HTTP_NO_CONTENT);
        }

        try {
            $resetToken = $this->resetPasswordHelper->generateResetToken($user);
        } catch (ResetPasswordExceptionInterface $e) {
            // Ne pas divulguer l'erreur : renvoyer 204
            return $this->json(null, Response::HTTP_NO_CONTENT);
        }

        // Construire URL du front (mettre FRONTEND_URL en .env)
        $frontendUrl = rtrim((string) $this->getParameter('CLIENT_URL'), '/');
        $resetUrl = $frontendUrl . '/reset-password?token=' . $resetToken->getToken();

        $emailMessage = (new TemplatedEmail())
            ->from(new Address($this->getParameter('MAILER_USER'), $this->getParameter('MAILER_NAME')))
            ->to($user->getEmail())
            ->subject('Réinitialisation de votre mot de passe')
            ->htmlTemplate('reset_password/email.html.twig')
            ->context([
                'resetToken' => $resetToken,
                'resetUrl' => $resetUrl,
            ]);

        try {
            $mailer->send($emailMessage);
        } catch (\Throwable $e) {
            return $this->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        // OK, on retourne 204
        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * 2) (optionnel) Valider un token sans le consommer
     *    GET /reset-password/validate?token=xxx
     */
    #[Route('/validate', name: 'validate', methods: ['GET'])]
    public function validate(Request $request): JsonResponse
    {
        $token = $request->query->get('token');
        if (!$token) {
            return $this->json(['valid' => false], Response::HTTP_BAD_REQUEST);
        }

        try {
            $this->resetPasswordHelper->validateTokenAndFetchUser($token);
            return $this->json(['valid' => true], Response::HTTP_OK);
        } catch (ResetPasswordExceptionInterface $e) {
            return $this->json(['valid' => false, 'reason' => $e->getReason()], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * 3) Reset : client envoie { token, password, confirmPassword }
     */
    #[Route('/reset', name: 'reset', methods: ['POST'])]
    public function reset(Request $request, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $token = $data['token'] ?? null;
        $payload = $data['payload'];
        $password = $payload['password'] ?? null;
        $confirmPassword = $payload['confirmPassword'] ?? null;

        if (!$token || !$password) {
            return $this->json(['error' => 'Missing parameters'], Response::HTTP_BAD_REQUEST);
        }

        if ($password !== $confirmPassword) {
            return $this->json(['error' => 'Passwords mismatch'], Response::HTTP_BAD_REQUEST);
        }

        try {
            /** @var User $user */
            $user = $this->resetPasswordHelper->validateTokenAndFetchUser($token);
        } catch (ResetPasswordExceptionInterface $e) {
            return $this->json(['error' => 'Invalid or expired token', 'reason' => $e->getReason()], Response::HTTP_BAD_REQUEST);
        }

        // Invalidate token (single-use)
        $this->resetPasswordHelper->removeResetRequest($token);

        // Hash and save new password
        $user->setPassword($passwordHasher->hashPassword($user, $password));
        $this->entityManager->flush();

        // Optionnel : log user in automatically, renvoyer un JWT, etc.
        return $this->json(['success' => true], Response::HTTP_OK);
    }

}
