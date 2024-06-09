import { StripeService } from '@/stripe/stripe.service';
import { CommonResponseDto } from '@/common/common.dtos';
import { Roles } from '@/decorators/roles/roles.decorator';
import { AuthGuard } from '@/guards/auth/auth.guard';
import { RolesGuard } from '@/guards/roles/roles.guard';
import { ValidateIdFromParam } from '@/pipes/validate-uuid/validate-id-param';
import { ADMIN_ROLE_NAME, SELLER_ROLE_NAME } from '@/role/role.constants';
import { UserService } from '@/user/user.service';
import { Controller, Param, Post, UseGuards, UsePipes } from '@nestjs/common';

@UseGuards(AuthGuard, RolesGuard)
@Controller('stripe-secured')
export class StripeSecuredController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly userService: UserService,
  ) {}

  @Roles([ADMIN_ROLE_NAME, SELLER_ROLE_NAME])
  @Post('/users/:id/get-secured-login-to-stripe-express-account')
  @UsePipes(new ValidateIdFromParam())
  async generateStripeExpressLoginUrl(
    @Param('id') userId: string,
  ): Promise<CommonResponseDto> {
    return await this.userService.generateStripeExpressLoginUrl(
      userId,
      this.stripeService,
    );
  }
}
