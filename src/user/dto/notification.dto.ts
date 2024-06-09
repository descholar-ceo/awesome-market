import { User } from '../entities/user.entity';

export class SellerAccountEmailBodyOptionsDto {
  admin?: User = null;
  approvalUrl?: string = null;
  stripeAccountOnboardingUrl?: string = null;
  getNewStripeAccountOnboardingUrl?: string = null;
  seller?: User = null;
}
