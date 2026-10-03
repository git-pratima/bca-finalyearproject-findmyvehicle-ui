export interface MissingVehicleReport {
  color: string; ownerEmail: string; engineNumber: string; chassisNumber: string; vehicleCompany: string; owner: string; ownerMobile: string; type: string;
  missingDetails: { pinCode: string; city: string; district: string; reward: string; state: string; missingTime: string; missingDate: string; address: string; country: string; description: string; };
  regNumber: string; vehicleModel: string; vehicleStatus: 'MISSING';
}
