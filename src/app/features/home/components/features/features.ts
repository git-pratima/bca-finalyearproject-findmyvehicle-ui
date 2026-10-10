import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    TranslatePipe
  ],
  templateUrl: './features.html',
  styleUrl: './features.scss'
})
export class FeaturesComponent {

  private readonly languageService = inject(LanguageService);

  get features() {
    return [
      {
        icon: 'verified_user',
        title: this.languageService.text('Secure Reporting', 'सुरक्षित रिपोर्टिंग'),
        description: this.languageService.text(
          'Vehicle reports are securely managed with verified information.',
          'वाहन रिपोर्टों का सत्यापित जानकारी के साथ सुरक्षित प्रबंधन किया जाता है।'
        )
      },
      {
        icon: 'bolt',
        title: this.languageService.text('Fast Vehicle Search', 'वाहन की तेज़ खोज'),
        description: this.languageService.text(
          'Search vehicle information instantly using registration details.',
          'पंजीकरण विवरण का उपयोग करके वाहन की जानकारी तुरंत खोजें।'
        )
      },
      {
        icon: 'groups',
        title: this.languageService.text('Community Support', 'समुदाय का सहयोग'),
        description: this.languageService.text(
          'Citizens can help identify and report missing vehicles.',
          'नागरिक गुम वाहनों की पहचान करने और उनकी रिपोर्ट करने में मदद कर सकते हैं।'
        )
      },
      {
        icon: 'location_on',
        title: this.languageService.text('Location Ready', 'स्थान-आधारित सुविधाओं के लिए तैयार'),
        description: this.languageService.text(
          'Designed for future GPS and location-based recovery features.',
          'आगामी GPS और स्थान-आधारित बरामदगी सुविधाओं को ध्यान में रखकर बनाया गया।'
        )
      },
      {
        icon: 'local_police',
        title: this.languageService.text('Police Friendly', 'पुलिस के अनुकूल'),
        description: this.languageService.text(
          'Easy sharing of verified reports with law enforcement.',
          'सत्यापित रिपोर्ट कानून प्रवर्तन एजेंसियों के साथ आसानी से साझा करें।'
        )
      },
      {
        icon: 'devices',
        title: this.languageService.text('Responsive Design', 'हर स्क्रीन के अनुकूल डिज़ाइन'),
        description: this.languageService.text(
          'Works seamlessly across desktop, tablet and mobile devices.',
          'डेस्कटॉप, टैबलेट और मोबाइल उपकरणों पर सहजता से काम करता है।'
        )
      }
    ];
  }

}