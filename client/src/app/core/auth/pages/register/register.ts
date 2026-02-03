import { Component, signal, WritableSignal } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpStatusCode } from '@angular/common/http';
import { FeedbackDisplay } from '../../../components/feedback-display/feedback-display';
import { FeedbackHandler } from '../../../services/feedback-handler/feedback-handler';
import { AuthValidators } from '../../auth-validators';
import { AuthGateway } from '../../auth-gateway';

@Component({
  selector: 'app-register',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FeedbackDisplay,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  protected registerForm: FormGroup;
  protected loading: WritableSignal<boolean> = signal(false);

  constructor(protected feedback: FeedbackHandler, private fb: FormBuilder, private authGateway: AuthGateway) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
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
      agreeTerms: [false, Validators.requiredTrue],
    },
    { validator: AuthValidators.passwordMatch } as AbstractControlOptions);
  }

  protected onSubmit(): void {

    if (this.registerForm.valid && !this.loading()) {
      const payload = this.registerForm.value; // objet { email, plainPassword, confirmPassword, agreeTerms }
      this.authGateway.register(payload).subscribe({
        next: (response) => {
          if (response.status === HttpStatusCode.Created) {
              this.feedback.set(
                'success',
                'Un email de confirmation vous a été envoyé. Veuillez vérifier votre boîte de réception et vos courriers indésirables pour finaliser votre inscription.'
              );
          }
        },
        error: (err) => this.feedback.set('error', 'Une erreur est survenue.')
      });
    } else {
      this.feedback.checkFormErrors(this.registerForm);
    }
  }

}
