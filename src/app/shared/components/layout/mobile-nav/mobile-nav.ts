import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  computed
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

import { ThemeService } from '../../../../core/services/theme.service';
import { TokenService } from '../../../../core/services/token.service';
import { AuthService } from '../../../../core/services/auth.service';

import { PUBLIC_NAVIGATION } from '../../../../core/config/navigation.config';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatButtonModule
  ],
  templateUrl: './mobile-nav.html',
  styleUrl: './mobile-nav.scss'
})
export class MobileNavComponent {

  @Input()
  opened = false;

  @Output()
  closeMenu = new EventEmitter<void>();

  readonly themeService = inject(ThemeService);

  private readonly tokenService = inject(TokenService);

  private readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  readonly navigation = PUBLIC_NAVIGATION;

  readonly loggedIn = this.tokenService.hasToken;

  readonly userName = computed(() =>
    this.tokenService.currentUserName() ?? ''
  );

  logout(): void {

    this.authService.logout();

    this.closeMenu.emit();

    this.router.navigate(['/']);

  }

}
