import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FeedbackHandler } from '../../../services/feedback-handler/feedback-handler';
import { FeedbackDisplay } from '../../../components/feedback-display/feedback-display';
import { AuthGateway } from '../../auth-gateway';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    FeedbackDisplay,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {

  protected forgotPasswordForm: FormGroup;

  constructor(protected feedback: FeedbackHandler, private fb: FormBuilder, private authGateway: AuthGateway) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  protected onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.authGateway.requestResetPassword(this.forgotPasswordForm.value)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.feedback.set('success', 'Si un compte existe avec cet email, vous allez recevoir un lien.');
        },
        error: (response) => {
          console.log(response);
          this.feedback.set('error', 'Une erreur est survenue.');
        },
      });
    } else {
      this.feedback.checkFormErrors(this.forgotPasswordForm);
    }
  }

}