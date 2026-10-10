import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

type PublicInfoSection = {
  icon: string;
  title: string;
  body: string;
};

type PublicPageContent = {
  eyebrow: string;
  title: string;
  introduction: string;
  sections: PublicInfoSection[];
  actionLabel: string;
  actionRoute: string;
};

@Component({
  selector: 'app-public-info',
  standalone: true,
  imports: [MatIconModule, RouterLink, TranslatePipe],
  templateUrl: './public-info.html',
  styleUrl: './public-info.scss'
})
export class PublicInfoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly language = inject(LanguageService);
  private readonly hindiText: Record<string, string> = {
    'A clear path forward': 'आगे बढ़ने का स्पष्ट रास्ता',
    'How it works': 'यह कैसे काम करता है',
    'A missing vehicle is stressful. Find My Vehicle helps owners share the right information and makes it easier for the community to keep an eye out.': 'वाहन का गुम होना तनावपूर्ण होता है। Find My Vehicle वाहन मालिकों को सही जानकारी साझा करने में मदद करता है और समुदाय के लिए उस पर नज़र रखना आसान बनाता है।',
    'Create a report': 'रिपोर्ट बनाएँ',
    'Sign in and provide the vehicle details, last known location, and any helpful description. Clear, accurate information helps others recognize what to look for.': 'साइन इन करके वाहन का विवरण, अंतिम ज्ञात स्थान और उपयोगी जानकारी दें। स्पष्ट और सही जानकारी से दूसरों को वाहन पहचानने में मदद मिलती है।',
    'Help keep reports useful': 'रिपोर्ट को उपयोगी बनाए रखें',
    'Reports are presented with their vehicle and incident details together, so people can understand the alert and distinguish it from other listings.': 'रिपोर्ट में वाहन और घटना का विवरण साथ दिखाया जाता है, ताकि लोग सूचना समझ सकें और उसे अन्य सूचियों से अलग पहचान सकें।',
    'Build community visibility': 'समुदाय तक जानकारी पहुँचाएँ',
    'The report can be found by people browsing vehicle alerts. More visibility gives more people a chance to notice a relevant lead.': 'वाहन सूचनाएँ देखने वाले लोग रिपोर्ट ढूँढ़ सकते हैं। अधिक लोगों तक पहुँचने से उपयोगी जानकारी मिलने की संभावना बढ़ती है।',
    'Share a useful lead': 'उपयोगी जानकारी साझा करें',
    'If you recognize a vehicle, use the available vehicle details to contact its owner. Do not approach a vehicle or put yourself at risk.': 'यदि आप किसी वाहन को पहचानते हैं, तो उपलब्ध विवरण से उसके मालिक से संपर्क करें। वाहन के पास न जाएँ और स्वयं को जोखिम में न डालें।',
    'Sign in to report a vehicle': 'वाहन की रिपोर्ट करने के लिए साइन इन करें',
    'About Find My Vehicle': 'Find My Vehicle के बारे में',
    'Better visibility starts with community': 'समुदाय की भागीदारी से जानकारी अधिक लोगों तक पहुँचती है',
    'Find My Vehicle is a platform for sharing missing vehicle information and helping people act on useful sightings.': 'Find My Vehicle गुम वाहनों की जानकारी साझा करने और उपयोगी जानकारी मिलने पर लोगों को कार्रवाई करने में मदद करने वाला एक मंच है।',
    'A shared effort': 'साझा प्रयास',
    'Owners can publish the information people need to recognize a vehicle, while community members can stay aware of reports in their area.': 'मालिक वाहन पहचानने के लिए ज़रूरी जानकारी साझा कर सकते हैं और समुदाय के लोग अपने क्षेत्र की रिपोर्ट से अवगत रह सकते हैं।',
    'Information that is easy to find': 'आसानी से मिलने वाली जानकारी',
    'Vehicle and report details are organized together, making it simpler to search, review, and share relevant information.': 'वाहन और रिपोर्ट का विवरण एक साथ व्यवस्थित है, जिससे उपयोगी जानकारी खोजना, देखना और साझा करना आसान होता है।',
    'Recovery with care': 'सावधानी के साथ वाहन की बरामदगी',
    'We encourage responsible, safety-first participation. Share information with the owner and local authorities when appropriate; never put yourself in danger.': 'हम ज़िम्मेदारी और सुरक्षा को प्राथमिकता देने वाली भागीदारी को प्रोत्साहित करते हैं। उचित होने पर जानकारी मालिक और स्थानीय अधिकारियों से साझा करें; स्वयं को कभी खतरे में न डालें।',
    'Explore vehicle reports': 'वाहन रिपोर्ट देखें',
    'Contact and support': 'संपर्क और सहायता',
    'How can we help?': 'हम आपकी कैसे मदद कर सकते हैं?',
    'Choose the option that best matches what you need. Sign in to manage your reports, or open a vehicle listing to share a sighting with its owner.': 'अपनी ज़रूरत के अनुसार विकल्प चुनें। रिपोर्ट प्रबंधित करने के लिए साइन इन करें या वाहन की सूची खोलकर उसके मालिक के साथ देखे जाने की जानकारी साझा करें।',
    'Manage your report': 'अपनी रिपोर्ट प्रबंधित करें',
    'Sign in to review your vehicles and missing reports from your dashboard.': 'अपने डैशबोर्ड से वाहन और गुम होने की रिपोर्ट देखने के लिए साइन इन करें।',
    'Looking for a vehicle?': 'क्या आप किसी वाहन को खोज रहे हैं?',
    'Sign in to search the vehicle listings and review available report details.': 'वाहनों की सूची खोजने और उपलब्ध रिपोर्ट का विवरण देखने के लिए साइन इन करें।',
    'Share a sighting': 'देखे जाने की जानकारी साझा करें',
    'Open a vehicle details page and use Notify Owner to send a message with what you observed. If there is immediate danger, contact local emergency services.': 'वाहन का विवरण खोलें और Notify Owner का उपयोग करके जो आपने देखा उसका संदेश भेजें। तत्काल खतरा होने पर स्थानीय आपातकालीन सेवाओं से संपर्क करें।',
    'Go to login': 'लॉगिन पर जाएँ'
  };

  private translate(value: string): string {
    return this.language.text(value, this.hindiText[value] ?? value);
  }

  get content(): PublicPageContent {
    const content = this.route.snapshot.data['publicPage'] as PublicPageContent;
    return {
      ...content,
      eyebrow: this.translate(content.eyebrow),
      title: this.translate(content.title),
      introduction: this.translate(content.introduction),
      sections: content.sections.map(section => ({
        ...section,
        title: this.translate(section.title),
        body: this.translate(section.body)
      })),
      actionLabel: this.translate(content.actionLabel)
    };
  }
}
