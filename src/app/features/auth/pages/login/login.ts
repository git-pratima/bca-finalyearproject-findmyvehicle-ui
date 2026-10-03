import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest } from '../../../../core/models/auth/login-request';
import { ConfigService } from '../../../../core/services/config.service';

@Component({
  selector: 'app-login',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink,

    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatDividerModule
  ],

  templateUrl: './login.html',

  styleUrl: './login.scss'
})
export class Login {

  private readonly configService = inject(ConfigService);

  private readonly authService = inject(AuthService);

private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  private readonly fb = inject(FormBuilder);

  private readonly snackBar = inject(MatSnackBar);

  readonly hidePassword = signal(true);

  readonly loading = signal(false);

  readonly loginForm = this.fb.group({

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(5)
      ]
    ],

    rememberMe: [false]

  });

  togglePassword(): void {

    this.hidePassword.update(value => !value);

  }

login(): void {

  if (this.loginForm.invalid) {

    this.loginForm.markAllAsTouched();

    return;

  }

  this.loading.set(true);

  this.authService
    .login(this.loginForm.getRawValue() as LoginRequest)
    .pipe(
      finalize(() => this.loading.set(false))
    )
    .subscribe({

      next: (response) => {

        console.log(response);

        if (response.status?.status < 200 || response.status?.status >= 300) {
          this.showError(response.status?.message ?? 'Invalid email or password.');
          return;
        }

        this.router.navigateByUrl(
          this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard'
        );

      },

      error: (error) => {

        console.error(error);

        this.showError(
          error?.error?.status?.message ??
          error?.error?.message ??
          'Invalid email or password.'
        );

      }

    });

}

private showError(message: string): void {
  this.snackBar.open(
    message,
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          }
        );
}

googleLogin(): void {
  window.location.href =
    `${this.configService.oauthUrl}/oauth2/authorization/google`;
}

  get email() {

    return this.loginForm.controls.email;

  }

  get password() {

    return this.loginForm.controls.password;

  }

}
