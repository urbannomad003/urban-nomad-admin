import { Timestamp } from '@angular/fire/firestore';
import { LoyaltyMemberDetails } from './loyalty-member-details.model';

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