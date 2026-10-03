import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatExpansionModule
} from '@angular/material/expansion';

@Component({

  selector: 'app-faq',

  standalone: true,

  imports: [
    CommonModule,
    MatExpansionModule
  ],

  templateUrl: './faq.html',

  styleUrl: './faq.scss'

})

export class FaqComponent {

  faqs = [

    {

      question: 'How do I report a missing vehicle?',

      answer:
        'Create an account, log in, click "Report Vehicle", enter your vehicle details, upload supporting images and submit the report.'

    },

    {

      question: 'Can anyone search a vehicle?',

      answer:
        'Yes. Visitors can search using a vehicle registration number or browse recent reports without creating an account.'

    },

    {

      question: 'Is registration free?',

      answer:
        'Yes. Registration and searching vehicles are completely free for all users.'

    },

    {

      question: 'Can I update my report later?',

      answer:
        'Yes. After logging in, you can edit, update or mark your vehicle as recovered from your dashboard.'

    },

    {

      question: 'Is my personal information secure?',

      answer:
        'Yes. Sensitive information is protected and only necessary details are displayed publicly.'

    }

  ];

}