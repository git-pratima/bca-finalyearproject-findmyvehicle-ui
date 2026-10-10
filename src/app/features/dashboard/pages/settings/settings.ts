import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { AppLanguage, LanguageService } from '../../../../core/services/language.service';
import { ThemeMode, ThemeService } from '../../../../core/services/theme.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-settings',
  imports: [MatIconModule, RouterLink, TranslatePipe],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);
  readonly theme = this.themeService.theme;
  readonly language = this.languageService.language;

  setTheme(theme: ThemeMode): void {
    this.themeService.setTheme(theme);
  }

  setLanguage(language: AppLanguage): void {
    this.languageService.setLanguage(language);
  }
}
