import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../../core/services/language.service';

import {
  MatExpansionModule
} from '@angular/material/expansion';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({

  selector: 'app-faq',

  standalone: true,

  imports: [
    CommonModule,
    MatExpansionModule,
    TranslatePipe
  ],

  templateUrl: './faq.html',

  styleUrl: './faq.scss'

})

export class FaqComponent {

  private readonly languageService = inject(LanguageService);

  get faqs() {
    return [
      {
        question: this.languageService.text('How do I report a missing vehicle?', 'मैं गुम वाहन की रिपोर्ट कैसे करूँ?'),
        answer: this.languageService.text(
          'Create an account, log in, click "Report Vehicle", enter your vehicle details, upload supporting images and submit the report.',
          'खाता बनाएँ, लॉग इन करें, "वाहन की रिपोर्ट करें" पर क्लिक करें, वाहन का विवरण दर्ज करें, सहायक तस्वीरें अपलोड करें और रिपोर्ट जमा करें।'
        )
      },
      {
        question: this.languageService.text('Can anyone search a vehicle?', 'क्या कोई भी वाहन खोज सकता है?'),
        answer: this.languageService.text(
          'Yes. Visitors can search using a vehicle registration number or browse recent reports without creating an account.',
          'हाँ। आगंतुक खाता बनाए बिना वाहन पंजीकरण संख्या से खोज सकते हैं या हाल की रिपोर्ट देख सकते हैं।'
        )
      },
      {
        question: this.languageService.text('Is registration free?', 'क्या पंजीकरण मुफ़्त है?'),
        answer: this.languageService.text(
          'Yes. Registration and searching vehicles are completely free for all users.',
          'हाँ। सभी उपयोगकर्ताओं के लिए पंजीकरण और वाहन खोजना पूरी तरह मुफ़्त है।'
        )
      },
      {
        question: this.languageService.text('Can I update my report later?', 'क्या मैं बाद में अपनी रिपोर्ट अपडेट कर सकता हूँ?'),
        answer: this.languageService.text(
          'Yes. After logging in, you can edit, update or mark your vehicle as recovered from your dashboard.',
          'हाँ। लॉग इन करने के बाद, आप डैशबोर्ड से अपनी रिपोर्ट संपादित या अपडेट कर सकते हैं, या वाहन को बरामद चिह्नित कर सकते हैं।'
        )
      },
      {
        question: this.languageService.text('Is my personal information secure?', 'क्या मेरी व्यक्तिगत जानकारी सुरक्षित है?'),
        answer: this.languageService.text(
          'Yes. Sensitive information is protected and only necessary details are displayed publicly.',
          'हाँ। संवेदनशील जानकारी सुरक्षित रखी जाती है और केवल आवश्यक विवरण सार्वजनिक रूप से दिखाए जाते हैं।'
        )
      }
    ];
  }

}