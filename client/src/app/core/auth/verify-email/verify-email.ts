import { Component, OnInit, signal, WritableSignal } from '@angular/core'
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpStatusCode } from '@angular/common/http';
import { AuthGateway } from '../auth-gateway';

@Component({
  selector: 'app-verify-email',
  imports: [
    RouterLink,
  ],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss'
})
export class VerifyEmail implements OnInit {

  private verifiedEmail: WritableSignal<boolean> = signal(false);
  private error: WritableSignal<string | null> = signal(null);

  constructor(private route: ActivatedRoute, private router: Router, private authGateway: AuthGateway) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.authGateway.verifyEmail(params).subscribe({
        next: (response) => {
          if (!response.code) {
            this.verifiedEmail.set(true);
          } else {
            switch (response.code) {
              case HttpStatusCode.BadRequest:
                this.error.set("Lien invalide ou corrompu. Veuillez vérifier l’email reçu.");
                break;
              case HttpStatusCode.Gone:
                this.error.set("Ce lien de confirmation a expiré. Veuillez demander un nouvel email.");
                break;
              case HttpStatusCode.Conflict:
                this.error.set("Cette adresse email est déjà confirmée. Vous pouvez vous connecter.");
                break;
              default:
                this.error.set("Une erreur est survenue. Veuillez réessayer plus tard.");
                break;
            }
          }
        },
        error: () => {
          this.error.set('Une erreur est survenue. Veuillez réessayer plus tard.');
        }
      });
    });

    // Nettoie l’URL → redirige sans paramètre
    this.router.navigate(['/verify-email'], { replaceUrl: true });

  }

  protected isVerifiedEmail(): WritableSignal<boolean> {
    return this.verifiedEmail;
  }

  protected getError(): WritableSignal<string | null> {
    return this.error;
  }
}