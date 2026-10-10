import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

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
  imports: [MatIconModule],
  templateUrl: './help-support.html',
  styleUrl: './help-support.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpSupportComponent {
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
