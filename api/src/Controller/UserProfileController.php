<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Security\EmailVerifier;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mime\Address;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;

#[Route('/user/profile', name: 'user_profile_')]
#[IsGranted('ROLE_USER')]
final class UserProfileController extends AbstractController
{
    public function __construct(private EmailVerifier $emailVerifier) {}

    #[Route('/change/email', name: 'change_email', methods: ['POST'])]
    public function changeEmail(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $em,
        EmailVerifier $emailVerifier
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['success' => false, 'message' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        $newEmail = $data['email'] ?? null;

        if (!$newEmail || !filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['success' => false, 'message' => 'Adresse email invalide'], Response::HTTP_BAD_REQUEST);
        }

        // Vérification : si déjà le même email → feedback clair
        if ($newEmail === $user->getEmail()) {
            return $this->json(['success' => false, 'message' => 'C’est déjà votre adresse actuelle.'], Response::HTTP_CONFLICT);
        }

        // Vérification collision → mais sans divulguer l’existence
        if ($userRepository->findOneBy(['email' => $newEmail])) {
            // Réponse générique pour ne pas exposer que l'email existe déjà
            return $this->json(['success' => false, 'message' => 'Impossible de modifier l’email'], Response::HTTP_BAD_REQUEST);
        }

        // Stocker l’email en attente
        $user->setPendingEmail($newEmail);
        $user->setIsVerified(false); // tu forces une nouvelle vérif
        $em->flush();

        // Envoi du mail de vérification
        $this->sendConfirmationLink($user);

        $emailVerifier->sendEmailConfirmation(
            'verify_email_change', // tu peux créer une route dédiée
            $user,
            (new TemplatedEmail())
                ->from(new Address('noreply@tonapp.com', 'Ton App'))
                ->to($newEmail)
                ->subject('Confirmez votre nouvelle adresse email')
                ->htmlTemplate('emails/verify_email.html.twig')
        );

        return $this->json(['success' => true, 'message' => 'Un email de confirmation a été envoyé à la nouvelle adresse.'], Response::HTTP_OK);
    }

    #[Route('/verify/email-change', name: 'verify_email_change', methods: ['GET'])]
    public function verifyEmailChange(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $id = $request->query->get('id');
        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['success' => false, 'message' => 'Lien invalide'], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $this->emailVerifier->handleEmailConfirmation($request, $user);
        } catch (VerifyEmailExceptionInterface $e) {
            return $this->json(['success' => false, 'message' => 'Lien expiré ou invalide'], JsonResponse::HTTP_GONE);
        }

        // Bascule du pendingEmail → email réel
        if ($user->getPendingEmail()) {
            $user->setEmail($user->getPendingEmail());
            $user->setPendingEmail(null);
            $user->setIsVerified(true);
            $em->flush();
        }

        return $this->json(['success' => true, 'message' => 'Votre nouvelle adresse email est confirmée.'], Response::HTTP_OK);
    }

    private function sendConfirmationLink(User $user): void {
        $this->emailVerifier->sendEmailConfirmation(
            'api_verify_email',
            $user,
            (new TemplatedEmail())
                ->from(new Address($this->getParameter('MAILER_USER'), $this->getParameter('MAILER_NAME')))
                ->to($user->getEmail())
                ->subject('Demande de changement d\'adresse email')
                ->htmlTemplate('user_profile/confirmation_email.html.twig')
        );
    }

    #[Route('/change/password', name: 'change_password', methods: ['POST'])]
    public function changePassword(
        Request $request,
        UserPasswordHasherInterface $userPasswordHasher,
        EntityManagerInterface $em,
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['success' => false, 'message' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        $password = $data['password'] ?? null;
        $confirmPassword = $data['confirmPassword'] ?? null;

        if ($password !== $confirmPassword) {
            return $this->json(['success' => false, 'message' => 'Les mots de passe ne correspondent pas.'], Response::HTTP_BAD_REQUEST);
        }

        $user->setPassword(
            $userPasswordHasher->hashPassword($user, $password)
        );
        $em->flush();

        return $this->json(['success' => true, 'message' => 'Votre mot de passe a été changé avec succès.'], Response::HTTP_OK);
    }
}
