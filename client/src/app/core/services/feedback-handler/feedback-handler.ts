import { Injectable, signal, WritableSignal } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class FeedbackHandler {

  public status: WritableSignal<string | null> = signal(null);
  public message: WritableSignal<string> = signal('');

  public set(status: string | null, message: string): void {
    this.status.set(status);
    this.message.set(message);
  }

  public clear(): void {
    this.status.set(null);
    this.message.set('');
  }

  public checkFormErrors(form: FormGroup): void {
    for (const [fieldName, control] of Object.entries(form.controls)) {
      if (control.invalid) {
        const message = this.getError(form, fieldName);
        if (message) {
          this.set('error', message);
          return;
        }
      }
    }

    if (form.errors) {
      const errorKey = Object.keys(form.errors)[0];
      const formLevelErrors = this.errorMessages['form'];
      if (formLevelErrors && formLevelErrors[errorKey]) {
        this.set('error', formLevelErrors[errorKey](form.errors[errorKey]));
        return;
      }
    }

    this.set(null, '');
  }

  private getError(form: FormGroup, controlName: string): string {
    const control = form.get(controlName);
    if (control?.errors) {
      const errorKey = Object.keys(control.errors)[0];
      const fieldErrors = this.errorMessages[controlName];
      if (fieldErrors && fieldErrors[errorKey]) {
        return fieldErrors[errorKey](control.errors[errorKey]);
      }
    }
    return '';
  }

  private errorMessages: Record<string, Record<string, (error?: any) => string>> = {
    email: {
      required: () => 'L’email est obligatoire.',
      email: () => 'L’email n’est pas valide.',
    },
    password: {
      required: () => 'Le mot de passe est obligatoire.',
      minlength: (error) => `Le mot de passe doit contenir au moins ${error.requiredLength} caractères.`,
      maxlength: (error) => `Le mot de passe ne peut pas dépasser ${error.requiredLength} caractères.`,
      hasUppercase: () => 'Le mot de passe doit contenir une majuscule.',
      hasNumber: () => 'Le mot de passe doit contenir un chiffre.',
      hasSpecialCharacter: () => 'Le mot de passe doit contenir un caractère spécial.',
    },
    confirmPassword: {
      required: () => 'La confirmation du mot de passe est obligatoire.',
    },
    agreeTerms: {
      required: () => 'Vous devez accepter les conditions générales d\'utilisation.',
    },
    form: {
      passwordMismatch: () => 'Les mots de passe ne correspondent pas.',
    }
  };
}
