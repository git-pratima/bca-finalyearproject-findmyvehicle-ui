import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

type Contact = {
  label: string;
  number?: string;
  dialNumber?: string;
  description?: string;
};

type HelplineSection = {
  id: string;
  title: string;
  icon: string;
  contacts: Contact[];
};

@Component({
  selector: 'app-help-support',
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './help-support.html',
  styleUrl: './help-support.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpSupportComponent {
  private readonly language = inject(LanguageService);

  hindi(value: string): string {
    return this.language.text(value, HELPLINE_HINDI[value] ?? value);
  }

  readonly sections: HelplineSection[] = [
    {
      id: 'primary-emergency',
      title: 'Primary emergency numbers',
      icon: 'emergency',
      contacts: [
        { label: 'Unified emergency number', number: '112', description: 'Police, fire, and ambulance. Works even without SIM balance.' },
        { label: 'Police control room', number: '100', description: 'Police emergency assistance.' },
        { label: 'Fire brigade', number: '101' },
        { label: 'Basic ambulance service', number: '102', description: 'Pregnancy and maternity ambulance.' },
        { label: 'Advanced ambulance service', number: '108', description: 'Free government ambulance service (GVK EMRI).' }
      ]
    },
    {
      id: 'police',
      title: 'Police helplines',
      icon: 'local_police',
      contacts: [
        { label: 'Police emergency', number: '100', description: 'Contact the police control room.' },
        { label: 'Unified emergency', number: '112', description: 'Unified emergency response; routes to police when needed.' },
        { label: 'Women in distress', number: '1091' },
        { label: 'Cybercrime financial fraud', number: '1930' },
        { label: 'Delhi control room', number: '011-23490000' },
        { label: 'Maharashtra (Mumbai) control room', number: '022-22621855' },
        { label: 'Karnataka (Bengaluru) control room', number: '080-22942299' },
        { label: 'Tamil Nadu (Chennai) control room', number: '044-28592750' },
        { label: 'West Bengal (Kolkata) control room', number: '033-22143230' }
      ]
    },
    {
      id: 'ambulance-hospital',
      title: 'Ambulance & hospital helplines',
      icon: 'medical_services',
      contacts: [
        { label: 'Government ambulance (GVK EMRI)', number: '108', description: 'Free government ambulance service; coverage varies by state.' },
        { label: 'Maternal/pregnancy ambulance', number: '102' },
        { label: 'Disaster management ambulance', number: '1099' },
        { label: 'Red Cross ambulance (Delhi)', number: '011-23711551' },
        { label: 'StanPlus', description: 'App-based ambulance service.' },
        { label: 'Medulance', description: 'Ambulance aggregator with app/phone booking.' },
        { label: 'Blinkit Ambulance', description: 'Available in Delhi NCR, Mumbai, and Bengaluru.' }
      ]
    },
    {
      id: 'roadside',
      title: 'Vehicle breakdown & roadside assistance',
      icon: 'car_repair',
      contacts: [
        { label: 'NHAI highway helpline', number: '1033', description: 'Highway accidents, breakdowns, and hazards.' },
        { label: 'Road accident helpline', number: '1073', description: 'Available in some states.' },
        { label: 'Maruti Suzuki roadside assistance', number: '1800-102-1800', dialNumber: '18001021800', description: '24/7 RSA helpline.' },
        { label: 'Hyundai roadside assistance', number: '1800-11-4645', dialNumber: '1800114645', description: '24/7 RSA helpline.' },
        { label: 'Tata Motors roadside assistance', number: '1800-209-8282', dialNumber: '18002098282', description: '24/7 RSA helpline.' },
        { label: 'Automobile Association of India (AAI)', description: 'Membership-based roadside assistance.' }
      ]
    },
    {
      id: 'other',
      title: 'Other key helplines',
      icon: 'support_agent',
      contacts: [
        { label: 'Women’s helpline', number: '181' },
        { label: 'Childline', number: '1098', description: 'For children in distress.' },
        { label: 'Senior citizen helpline', number: '14567' },
        { label: 'Disaster management', number: '1077' },
        { label: 'Health helpline', number: '1075' },
        { label: 'LPG gas leakage emergency', number: '1906' }
      ]
    }
  ];
}

const HELPLINE_HINDI: Record<string, string> = {
  'Primary emergency numbers': 'प्रमुख आपातकालीन नंबर',
  'Unified emergency number': 'एकीकृत आपातकालीन नंबर',
  'Police, fire, and ambulance. Works even without SIM balance.': 'पुलिस, अग्निशमन और एम्बुलेंस। सिम बैलेंस न होने पर भी काम करता है।',
  'Police control room': 'पुलिस नियंत्रण कक्ष',
  'Police emergency assistance.': 'पुलिस आपातकालीन सहायता।',
  'Fire brigade': 'अग्निशमन सेवा',
  'Basic ambulance service': 'बेसिक एम्बुलेंस सेवा',
  'Pregnancy and maternity ambulance.': 'गर्भावस्था और प्रसूति के लिए एम्बुलेंस।',
  'Advanced ambulance service': 'एडवांस्ड एम्बुलेंस सेवा',
  'Free government ambulance service (GVK EMRI).': 'निःशुल्क सरकारी एम्बुलेंस सेवा (GVK EMRI)।',
  'Police helplines': 'पुलिस हेल्पलाइन',
  'Police emergency': 'पुलिस आपातकालीन सेवा',
  'Contact the police control room.': 'पुलिस नियंत्रण कक्ष से संपर्क करें।',
  'Unified emergency': 'एकीकृत आपातकालीन सेवा',
  'Unified emergency response; routes to police when needed.': 'एकीकृत आपातकालीन सहायता; आवश्यकता पड़ने पर पुलिस से संपर्क कराती है।',
  'Women in distress': 'संकट में महिलाओं के लिए हेल्पलाइन',
  'Cybercrime financial fraud': 'साइबर अपराध और वित्तीय धोखाधड़ी',
  'Delhi control room': 'दिल्ली नियंत्रण कक्ष',
  'Maharashtra (Mumbai) control room': 'महाराष्ट्र (मुंबई) नियंत्रण कक्ष',
  'Karnataka (Bengaluru) control room': 'कर्नाटक (बेंगलुरु) नियंत्रण कक्ष',
  'Tamil Nadu (Chennai) control room': 'तमिलनाडु (चेन्नई) नियंत्रण कक्ष',
  'West Bengal (Kolkata) control room': 'पश्चिम बंगाल (कोलकाता) नियंत्रण कक्ष',
  'Ambulance & hospital helplines': 'एम्बुलेंस और अस्पताल हेल्पलाइन',
  'Government ambulance (GVK EMRI)': 'सरकारी एम्बुलेंस (GVK EMRI)',
  'Free government ambulance service; coverage varies by state.': 'निःशुल्क सरकारी एम्बुलेंस सेवा; उपलब्धता राज्य के अनुसार अलग हो सकती है।',
  'Maternal/pregnancy ambulance': 'मातृत्व/गर्भावस्था एम्बुलेंस',
  'Disaster management ambulance': 'आपदा प्रबंधन एम्बुलेंस',
  'Red Cross ambulance (Delhi)': 'रेड क्रॉस एम्बुलेंस (दिल्ली)',
  'App-based ambulance service.': 'ऐप के माध्यम से एम्बुलेंस सेवा।',
  'Ambulance aggregator with app/phone booking.': 'ऐप या फोन से बुकिंग वाली एम्बुलेंस सेवा।',
  'Available in Delhi NCR, Mumbai, and Bengaluru.': 'दिल्ली NCR, मुंबई और बेंगलुरु में उपलब्ध।',
  'Vehicle breakdown & roadside assistance': 'वाहन खराब होने और सड़क सहायता',
  'NHAI highway helpline': 'NHAI हाईवे हेल्पलाइन',
  'Highway accidents, breakdowns, and hazards.': 'हाईवे दुर्घटनाएँ, वाहन खराबी और सड़क संबंधी खतरे।',
  'Road accident helpline': 'सड़क दुर्घटना हेल्पलाइन',
  'Available in some states.': 'कुछ राज्यों में उपलब्ध।',
  'Maruti Suzuki roadside assistance': 'मारुति सुज़ुकी सड़क सहायता',
  'Hyundai roadside assistance': 'हुंडई सड़क सहायता',
  'Tata Motors roadside assistance': 'टाटा मोटर्स सड़क सहायता',
  '24/7 RSA helpline.': '24/7 सड़क सहायता हेल्पलाइन।',
  'Automobile Association of India (AAI)': 'ऑटोमोबाइल एसोसिएशन ऑफ इंडिया (AAI)',
  'Membership-based roadside assistance.': 'सदस्यता-आधारित सड़क सहायता।',
  'Other key helplines': 'अन्य महत्वपूर्ण हेल्पलाइन',
  'Women’s helpline': 'महिला हेल्पलाइन',
  'Childline': 'चाइल्डलाइन',
  'For children in distress.': 'संकट में बच्चों के लिए।',
  'Senior citizen helpline': 'वरिष्ठ नागरिक हेल्पलाइन',
  'Disaster management': 'आपदा प्रबंधन',
  'Health helpline': 'स्वास्थ्य हेल्पलाइन',
  'LPG gas leakage emergency': 'LPG गैस रिसाव आपातकाल'
};
