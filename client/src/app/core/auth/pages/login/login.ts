import { Component, Injectable, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpStatusCode } from '@angular/common/http';
import { FeedbackDisplay } from '../../../components/feedback-display/feedback-display';
import { FeedbackHandler } from '../../../services/feedback-handler/feedback-handler';
import { AuthGateway } from '../../auth-gateway';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FeedbackDisplay,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})

@Injectable({providedIn: 'root'})
export class Login implements OnInit {

  protected loginForm: FormGroup;
  protected loading: WritableSignal<boolean> = signal(false);
  protected loadingResend: WritableSignal<boolean> = signal(false);

  constructor(protected feedback: FeedbackHandler, private router: Router, private fb: FormBuilder, private authGateway: AuthGateway) {
      this.loginForm = this.fb.group({
        email: ['', [
          Validators.required,
          Validators.email
        ]],
        password: ['', [
          Validators.required,
        ]]
      });
  }
  
  ngOnInit(): void {
    this.feedback.clear();
  }

  protected onSubmit(): void {
    if (this.loginForm.valid && !this.loading()) {
      this.loading.set(true);
      this.authGateway.login(this.loginForm.value).subscribe({
        next: () => {this.router.navigate([''])},
        error: (err) => {
          if (err.status === HttpStatusCode.Forbidden) {
            this.feedback.set('warning', 'Votre compte n’est pas encore activé. Vérifiez vos emails ou renvoyez le lien de confirmation.');
          } else {
            this.feedback.set('error', 'Identifiants incorrects.');
          }
          this.loading.set(false);
        },
      });
    } else {
        this.feedback.checkFormErrors(this.loginForm);
    }
  }

  protected resendEmail(): void{
    this.loadingResend.set(true);
    this.authGateway.resendVerificationEmail().subscribe({
      next: (res) => {
        console.log(res)
        this.feedback.set(
          'success',
          'Un nouvel email de confirmation a été envoyé. Veuillez vérifier votre boîte de réception et vos courriers indésirables pour finaliser votre inscription.',
        );
        this.loadingResend.set(false);
      },
      error: (err) => {
        console.log(err)
        this.feedback.set('error', 'Impossible de renvoyer l\'email pour le moment.');
        this.loadingResend.set(false);
      }
    });
  }
}