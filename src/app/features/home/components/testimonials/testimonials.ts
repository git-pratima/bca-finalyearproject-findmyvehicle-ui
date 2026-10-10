import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    TranslatePipe
  ],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss'
})
export class TestimonialsComponent {

  private readonly languageService = inject(LanguageService);

  get testimonials() {
    return [
      {
        name: 'Rahul Sharma',
        city: 'Bengaluru',
        message: this.languageService.text(
          'My stolen bike was found within 48 hours thanks to this platform.',
          'इस मंच की मदद से मेरी चोरी हुई बाइक 48 घंटों के भीतर मिल गई।'
        )
      },
      {
        name: 'Priya Nair',
        city: 'Mysuru',
        message: this.languageService.text(
          'I received multiple genuine leads and recovered my car safely.',
          'मुझे कई भरोसेमंद सुराग मिले और मेरी कार सुरक्षित बरामद हो गई।'
        )
      },
      {
        name: 'Arjun Kumar',
        city: 'Chennai',
        message: this.languageService.text(
          'The police contacted me after someone recognized my vehicle online.',
          'ऑनलाइन किसी व्यक्ति द्वारा मेरा वाहन पहचानने के बाद पुलिस ने मुझसे संपर्क किया।'
        )
      }
    ];
  }

}