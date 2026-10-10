import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { ThemeMode, ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  imports: [MatIconModule, RouterLink],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  private readonly themeService = inject(ThemeService);
  readonly theme = this.themeService.theme;

  setTheme(theme: ThemeMode): void {
    this.themeService.setTheme(theme);
  }
}
