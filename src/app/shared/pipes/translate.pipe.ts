import { ChangeDetectorRef, Pipe, PipeTransform, inject } from '@angular/core';

import { LanguageService } from '../../core/services/language.service';

@Pipe({
  name: 'translate',
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private readonly languageService = inject(LanguageService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private lastLanguage = this.languageService.language();

  constructor() {
    this.languageService.language();
  }

  transform(english: string, hindi: string): string {
    const language = this.languageService.language();
    if (language !== this.lastLanguage) {
      this.lastLanguage = language;
      this.changeDetectorRef.markForCheck();
    }
    return this.languageService.text(english, hindi);
  }
}
