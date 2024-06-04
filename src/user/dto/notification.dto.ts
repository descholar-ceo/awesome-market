import { User } from '../entities/user.entity';

export class SellerAccountEmailBodyOptionsDto {
  admin: User;
  approvalUrl: string;
  seller: User;
}
