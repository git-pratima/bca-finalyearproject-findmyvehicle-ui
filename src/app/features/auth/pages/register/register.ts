import {
  Component,
  inject,
  signal,
  computed
} from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';

import {
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

/* Angular Material */

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatCheckboxModule
} from '@angular/material/checkbox';

import {
  MatIconModule
} from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,

  imports: [

    CommonModule,
    ReactiveFormsModule,
    RouterLink,

    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule

  ],

  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  private readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  private readonly snackBar = inject(MatSnackBar);

  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);

  readonly hidePassword = signal(true);

  readonly hideConfirmPassword = signal(true);

  readonly registerForm: FormGroup = this.fb.group({

    name: [

      '',

      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]

    ],

    email: [

      '',

      [
        Validators.required,
        Validators.email
      ]

    ],

    phoneNumber: [

      '',

      [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/)
      ]

    ],

    password: [

      '',

      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/
        )
      ]

    ],

    confirmPassword: [

      '',

      [
        Validators.required
      ]

    ],

    terms: [

      false,

      Validators.requiredTrue

    ]

  },
  {
    validators: this.passwordMatchValidator
  });

  /* -------------------------------- */

  get name(): AbstractControl {

    return this.registerForm.get('name')!;

  }

  get email(): AbstractControl {

    return this.registerForm.get('email')!;

  }

  get phoneNumber(): AbstractControl {

    return this.registerForm.get('phoneNumber')!;

  }

  get password(): AbstractControl {

    return this.registerForm.get('password')!;

  }

  get confirmPassword(): AbstractControl {

    return this.registerForm.get('confirmPassword')!;

  }

  /* -------------------------------- */

  readonly passwordStrength = computed(() => {

    const value = this.password.value ?? '';

    let score = 0;

    if (value.length >= 8) score++;

    if (/[A-Z]/.test(value)) score++;

    if (/[a-z]/.test(value)) score++;

    if (/\d/.test(value)) score++;

    if (/[@$!%*?&]/.test(value)) score++;

    return score;

  });

  /* -------------------------------- */

  togglePassword(): void {

    this.hidePassword.update(v => !v);

  }

  toggleConfirmPassword(): void {

    this.hideConfirmPassword.update(v => !v);

  }

  /* -------------------------------- */

register(): void {

  if (this.registerForm.invalid) {

    this.registerForm.markAllAsTouched();

    return;

  }

  this.loading.set(true);

  this.authService.register({

    name: this.name.value!,

    email: this.email.value!,

    password: this.password.value!,

    phoneNumber: this.phoneNumber.value!,

    role: 'NORMAL'

  }).subscribe({

    next: response => {

      this.loading.set(false);

      const snackBarRef = this.snackBar.open(

        response.status.message,

        'OK',

        {

          duration: 3000,

          horizontalPosition: 'center',

          verticalPosition: 'bottom'

        }

      );

      this.registerForm.reset({

        terms: false

      });

      snackBarRef.afterDismissed().subscribe(() => {

        this.router.navigate(['/login']);

      });

    },

    error: error => {

      this.loading.set(false);

      this.snackBar.open(

        error?.error?.status?.message ?? 'Registration Failed',

        'Close',

        {

          duration: 4000,

          horizontalPosition: 'center',

          verticalPosition: 'bottom'

        }

      );

    }

  });

}

  /* -------------------------------- */

  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const password = control.get('password')?.value;

    const confirm = control.get('confirmPassword')?.value;

    if (password !== confirm) {

      return {

        passwordMismatch: true

      };

    }

    return null;

  }

}