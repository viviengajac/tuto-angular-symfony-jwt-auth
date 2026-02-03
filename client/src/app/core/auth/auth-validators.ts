import { AbstractControl, ValidationErrors, FormGroup } from "@angular/forms";

export class AuthValidators {
  
  static hasUppercase(control: AbstractControl): ValidationErrors | null {
    return /[A-Z]/.test(control.value || '') ? null : { hasUppercase: true };
  }

  static hasNumber(control: AbstractControl): ValidationErrors | null {
    return /\d/.test(control.value || '') ? null : { hasNumber: true };
  }

  static hasSpecialCharacter(control: AbstractControl): ValidationErrors | null {
    return /[!@#$%^&*(),.?":{}|<>]/.test(control.value || '') ? null : { hasSpecialCharacter: true };
  }

  static passwordMatch(form: FormGroup): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
  
}
