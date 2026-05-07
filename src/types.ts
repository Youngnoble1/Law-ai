export type UserRole = 'client' | 'lawyer' | 'admin';

export interface User {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: any;
  isVerified: boolean;
  nbaEnrollmentNumber?: string;
  avatarUrl?: string;
}

export interface LawyerProfile {
  lawyerId: string;
  specialties: string[];
  subscriptionTier: 'basic' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'expired';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  averageRating: number;
  consultationFee: number;
  bio?: string;
}

export type CaseStatus = 'Diagnostic' | 'Drafting' | 'Awaiting Client Review' | 'Filing' | 'Completed';

export interface Case {
  caseId: string;
  clientId: string;
  lawyerId?: string;
  serviceType: string;
  tier: 'High' | 'Medium' | 'Low';
  status: CaseStatus;
  totalFee: number;
  createdAt: any;
  updatedAt: any;
  description?: string;
}

export interface Milestone {
  milestoneId: string;
  caseId: string;
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt?: any;
}

export interface Review {
  reviewId: string;
  lawyerId: string;
  clientId: string;
  reliability: number; // 1-5
  timeliness: number; // 1-5
  clarity: number; // 1-5
  comment: string;
  createdAt: any;
}
