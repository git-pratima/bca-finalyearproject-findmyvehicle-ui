export interface ApiEnvelope<T> {
  data: T;
}

export interface HomeHeaderData {
  eyebrow: string | null;
  title: string | null;
  highlightedWord: string | null;
  description: string | null;
  searchPlaceholder: string | null;
  reportMissingUrl: string | null;
  searchVehiclesUrl: string | null;
  communityProof: {
    count: string | null;
    label: string | null;
  } | null;
}

export interface HomeStatisticData {
  key: string;
  value: number;
  label: string;
  description: string;
  icon: string;
}

export interface VehicleLocationData {
  city: string | null;
  state: string | null;
  displayName: string | null;
}

export interface VehicleRewardData {
  amount: number | null;
  currency: string | null;
  displayName: string | null;
}

export interface MissingVehicleData {
  id: string | null;
  registrationNumber: string | null;
  brand: string | null;
  model: string | null;
  vehicleType: string | null;
  displayName: string | null;
  status: string | null;
  imageUrls: string[] | null;
  missingLocation: VehicleLocationData | null;
  missigngDateTime: string | null;
  detailUrl: string | null;
  reward: VehicleRewardData | null;
}

export interface RecentMissingVehiclesData {
  title: string | null;
  viewAllUrl: string | null;
  totalCount: number | null;
  items: MissingVehicleData[] | null;
}

export interface HomeDashboardData {
  header: HomeHeaderData;
  statisticsDtos: HomeStatisticData[];
  recentMissingVehicles: RecentMissingVehiclesData | null;
}