export interface Donation {
  id: string;
  name: string;
  email: string;
  amount: number;
  timestamp: string;
  stripePaymentId?: string;
  fundraiserId?: string;
}

export interface DonationCard {
  id: string;
  name: string;
  description: string;
  emoji: string;
  price: number;
  slug: string;
  is_sponsored?: boolean;
  sponsored_label?: string;
  sponsor_name?: string;
}

export interface RaffleState {
  prizeAmount: number;
  goalAmount: number;
  drawingDate: string;
  isActive: boolean;
  winner?: {
    name: string;
    email: string;
    amount: number;
  } | null;
}

export interface SpinResult {
  amount: number;
}

export interface UserInfo {
  name: string;
  email: string;
}

export interface Fundraiser {
  id: string;
  name: string;
  slug: string;
  goal: number;
  totalRaised: number;
  totalDonations: number;
  createdAt: string;
}

export interface DonationStats {
  totalRaised: number;
  totalDonations: number;
  goal: number;
  recentDonations: Donation[];
  topDonors: { name: string; total: number }[];
  donatedPurposes: string[];
  purposeNotes: Record<string, string>;
  donationCards: DonationCard[];
}

export interface AdminStats {
  totalRaised: number;
  siteRaised: number;
  adminRaised: number;
  totalDonations: number;
  averageDonation: number;
  todayDonations: number;
  todayAmount: number;
  donations: Donation[];
  raffle: RaffleState;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  fundraisers: Fundraiser[];
  campaigns: {
    id: string;
    name: string;
    drawingDate: string;
    totalRaised: number;
    goalAmount: number;
    totalDonations: number;
    donors: {
      id: string;
      name: string;
      email: string;
      amount: number;
      timestamp: string;
    }[];
  }[];
}

export interface CampaignDonor {
  id: number;
  campaignId: number;
  donationId: string | null;
  name: string;
  email: string;
  amount: number;
  timestamp: string;
}

export interface CampaignSummary {
  id: number;
  name?: string;
  createdAt: string;
  prizeAmount: number;
  goalAmount: number;
  drawingDate: string;
  totalRaised: number;
  totalDonations: number;
  donors: CampaignDonor[];
}
