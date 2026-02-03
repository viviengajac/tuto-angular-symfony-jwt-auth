import { Component, WritableSignal } from '@angular/core';
// import { AuthService } from '../../auth-service';
import { ApiAuthResponse, User } from '../../auth-models';
import { AbstractControlOptions, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { FeedbackDisplay } from '../../../components/feedback-display/feedback-display';
import { FeedbackHandler } from '../../../services/feedback-handler/feedback-handler';
import { ModalDisplay } from '../../../components/modal-display/modal-display';
import { ModalHandler } from '../../../services/modal-handler/modal-handler';
import { AuthValidators } from '../../auth-validators';
import { AuthState } from '../../auth-state';
import { AuthGateway } from '../../auth-gateway';

@Component({
  selector: 'app-user-profile',
  imports: [
    ReactiveFormsModule,
    ModalDisplay,
    // FeedbackDisplay,
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile {

  // protected currentUser: WritableSignal<User | null>;
  protected emailForm: FormGroup;
  protected passwordForm: FormGroup;
  
  constructor(
    // protected auth: AuthService,
    protected authGateway: AuthGateway,
    protected authState: AuthState,
    protected feedback: FeedbackHandler,
    protected modal: ModalHandler,
    private fb: FormBuilder,
  ) {

    // this.currentUser = this.auth.getCurrentUser();

    this.emailForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,  // pour vérifier l’identité
      ]],
      currentPassword: [
        '', [
          Validators.required,
      ]],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [
        Validators.required,
      ]],
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

  protected onSubmit<T>(
    form: FormGroup,
    actionFn: (payload: T) => Observable<ApiAuthResponse>
  ): void {
    if (form.valid) {
      const payload = form.value as T;
      actionFn(payload).subscribe({
        next: (response) => {
          console.log(response);
          this.feedback.set('success', response.message);
          // this.closeModal(form);
        },
        error: (err) => {
          console.log(err);
          this.feedback.set('error', err.error.message);
        }
      });
    } else {
      this.feedback.checkFormErrors(form);
    }
  }

  protected onEmailChange(): void {
    if (this.authState.currentUser()?.email == this.emailForm.controls['email'].value) {
      this.feedback.set('error', 'C\'est votre adresse email actuelle.');
    } else {
      this.feedback.clear();
    }
  }

}
