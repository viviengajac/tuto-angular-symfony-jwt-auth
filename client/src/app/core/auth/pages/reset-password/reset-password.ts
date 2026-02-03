import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FeedbackDisplay } from '../../../components/feedback-display/feedback-display';
import { FeedbackHandler } from '../../../services/feedback-handler/feedback-handler';
import { AuthGateway } from '../../auth-gateway';
import { AuthValidators } from '../../auth-validators';

@Component({
  selector: 'app-reset-password',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FeedbackDisplay,
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword implements OnInit {
  
  protected resetPasswordForm: FormGroup;
  protected loading: WritableSignal<boolean> = signal(false);
  protected token: string | null = null;

  constructor(
    protected feedback: FeedbackHandler,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authGateway: AuthGateway
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.resetPasswordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(32),
        AuthValidators.hasUppercase,
        AuthValidators.hasNumber,
        AuthValidators.hasSpecialCharacter,
      ]],
      confirmPassword: ['', [
        Validators.required,
      ]],
    },
    { validator: AuthValidators.passwordMatch } as AbstractControlOptions);
  }
  

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    console.log(this.token);
    if (!this.token) {
      this.feedback.set('error', 'Lien invalide.');
      this.loading.set(false);
      return;
    }

    this.authGateway.validateResetPasswordToken(this.token).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (!response.valid) {
          this.feedback.set('error', 'Lien expiré ou invalide.');
        }
      },
      error: () => {
        this.loading.set(false);
        this.feedback.set('error', 'Lien invalide.');
      }
    });
  }

  protected onSubmit(): void {
    if (this.resetPasswordForm.valid && this.token) {
      this.authGateway.resetPassword(this.token, this.resetPasswordForm.value).subscribe({
        next: () => {
          this.feedback.set('success', 'Mot de passe mis à jour. Vous pouvez maintenant vous connecter.');
        },
        error: () => {
          this.feedback.set('error', 'Erreur lors de la réinitialisation.');
        }
      });
    } else {
      this.feedback.checkFormErrors(this.resetPasswordForm);
    }
  }

}