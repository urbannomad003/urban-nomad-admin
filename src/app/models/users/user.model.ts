import { Timestamp } from '@angular/fire/firestore';

export interface LoyaltyMemberDetails {
  emailAddress?: string;
  firstName?: string;
  lastName?: string;
  memberNo?: string;
  physicalAddress?: string | null;
  title?: string;
}

export interface AppUser {
  uid?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  title?: string;
  email?: string;
  emailAddress?: string;
  emailVerified?: boolean;
  dateOfBirth?: string;
  isLoyaltyMember?: boolean;
  loyaltyMemberDetails?: LoyaltyMemberDetails | null;
  provider?: string;
  createdAt?: string | Timestamp;
  updatedAt?: string | Timestamp;
  lastLoginAt?: Timestamp | string | null;
}