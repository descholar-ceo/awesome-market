import { ADMIN_ROLE_NAME } from '@/role/role.constants';
import { SellerAccountEmailBodyOptionsDto } from './dto/notification.dto';
import { User } from './entities/user.entity';
import {
  API_URL,
  dotenvConfig,
  getEnvironmentValue,
  validateEnvironment,
} from '@/config/config.utils';

export const prepareAccountApprovalEmailBody = (
  data: SellerAccountEmailBodyOptionsDto,
): { html: string; text: string } => {
  const {
    admin: { firstName: adminFName, lastName: adminLName },
    approvalUrl,
    seller: {
      firstName: sellerFName,
      lastName: sellerLName,
      phoneNumber: sellerPhoneNumber,
      email: sellerEmailAddress,
    },
  } = data;
  const html = `<h4>Dear ${adminFName} ${adminLName},</h4>
    
    <div>
      <p>
        I hope this email finds you well.
      </p>
      <p>
        I'm reaching out to inform you about a recent registration on our marketplace platform. A new user has signed up as a seller and is eager to start selling their products on our platform.
      </p>
      <p>
        As part of our commitment to maintaining the highest standards of quality and trustworthiness, we have implemented a verification process for all new seller accounts. This process involves conducting background checks and reviewing the information provided by the seller to ensure compliance with our platform's policies and guidelines.
      </p>
      <p>
        The new seller ${sellerFName}, has completed the initial registration process and is now awaiting approval from an admin before they can start listing their products for sale. We kindly request your assistance in reviewing their account and approving it for selling on our platform.
      </p>
      <h4>Here are some key details about the seller:</h4>
      <ul>
        <li><strong>First Name: </strong> ${sellerFName}</li>
        <li><strong>Last Name: </strong> ${sellerLName}</li>
        <li><strong>Contact Phone Number: </strong> ${sellerPhoneNumber}</li>
        <li><strong>Email: </strong> ${sellerEmailAddress}</li>
      </ul>
      <p>
        If you are done to do all the checking, you will have to click the link below, in order to approve the seller's account
      </p>
      <p>
        <a href=${approvalUrl}>Approve ${sellerFName} Account</a>
      </p>
      <p>
        We understand the importance of maintaining a safe and secure environment for both buyers and sellers on our platform. Therefore, we ask for your thorough review and consideration before approving this account.
      </p>
      <p>
        If you have any questions or require further information about the seller's registration, please feel free to reply to this email.
      </p>
      <p>
        Thank you for your attention to this matter. Your prompt action in approving the seller's account is greatly appreciated.
      </p>
      <p>Best regards,</p> <br>

      <p>
        Awesome Market Engineering Team
      </p>
      <p><a href="https://awesome-market.com/">Awesome Market Place</a></p>
    </div>
    `;
  const text = `Dear ${adminFName} ${adminLName},
    
        I hope this email finds you well.
      
        I'm reaching out to inform you about a recent registration on our marketplace platform. A new user has signed up as a seller and is eager to start selling their products on our platform.
      
        As part of our commitment to maintaining the highest standards of quality and trustworthiness, we have implemented a verification process for all new seller accounts. This process involves conducting background checks and reviewing the information provided by the seller to ensure compliance with our platform's policies and guidelines.
      
        The new seller ${sellerFName}, has completed the initial registration process and is now awaiting approval from an admin before they can start listing their products for sale. We kindly request your assistance in reviewing their account and approving it for selling on our platform.
      
        Here are some key details about the seller:
      
        First Name: ${sellerFName}
        Last Name: ${sellerLName}
        Contact Phone Number: ${sellerPhoneNumber}
        Email: ${sellerEmailAddress}
      
        If you are done to do all the checking, you will have to click the link below, in order to approve the seller's account
      
        ${approvalUrl}
      
        We understand the importance of maintaining a safe and secure environment for both buyers and sellers on our platform. Therefore, we ask for your thorough review and consideration before approving this account.
      
        If you have any questions or require further information about the seller's registration, please feel free to reply to this email.
      
        Thank you for your attention to this matter. Your prompt action in approving the seller's account is greatly appreciated.
      
        Best regards,

        Awesome Market Engineering Team
        https://awesome-market.com/
    `;
  return { html, text };
};

export const prepareAccountPendingNotifyBody = (
  data: SellerAccountEmailBodyOptionsDto,
): { html: string; text: string } => {
  const {
    seller: { firstName: sellerFName, lastName: sellerLName },
  } = data;
  const html = `<h4>Dear ${sellerFName} ${sellerLName},</h4>
    
  <div>
    <p>
      I hope this email finds you well.
    </p>
    <p>
      We wanted to inform you that your seller account registration on <strong>Awesome Market Place</strong> has been received. Thank you for choosing our platform to showcase your products.
    </p>
    <p>
      Please note that your account is currently pending verification and approval by our admin team. We are conducting background checks and reviewing the information provided to ensure compliance with our platform's policies and guidelines.
    </p>
    <p>
      We appreciate your patience during this process. Rest assured that we are working diligently to complete the verification and approval as soon as possible. Once your account is approved, you will receive a confirmation email with further instructions on how to start selling on our platform.
    </p>
    <p>
      If you have any questions or require further information about the seller's registration, please feel free to reply to this email.
    </p>
    <p>
      Thank you for your cooperation.
    </p>
    <p>Best regards,</p> <br>

    <p>
      Awesome Market Engineering Team
    </p>
    <p><a href="https://awesome-market.com/">Awesome Market Place</a></p>
  </div>
  `;
  const text = `Dear ${sellerFName} ${sellerLName},
  
      I hope this email finds you well.
    
      We wanted to inform you that your seller account registration on Awesome Market Place has been received. Thank you for choosing our platform to showcase your products.
    
      Please note that your account is currently pending verification and approval by our admin team. We are conducting background checks and reviewing the information provided to ensure compliance with our platform's policies and guidelines.
    
      We appreciate your patience during this process. Rest assured that we are working diligently to complete the verification and approval as soon as possible. Once your account is approved, you will receive a confirmation email with further instructions on how to start selling on our platform.

      If you have any questions or require further information about the seller's registration, please feel free to reply to this email.
    
      Thank you for your cooperation.
      Best regards,

      Awesome Market Engineering Team
    
      https://awesome-market.com/
  `;
  return { html, text };
};

export const prepareAccountApprovedMessageBody = (
  data: SellerAccountEmailBodyOptionsDto,
): { html: string; text: string } => {
  const {
    stripeAccountOnboardingUrl,
    getNewStripeAccountOnboardingUrl,
    seller: { firstName: sellerFName, lastName: sellerLName },
  } = data;

  const html = `<h4>Dear ${sellerFName} ${sellerLName},</h4>
    
  <div>
    <p>
      I hope this email finds you well.
    </p>
    <p>
      I'm delighted to inform you that your seller account on <strong>Awesome Market Place</strong> has been successfully approved! 🎉
    </p>
    <p>
      You can now log in to your account using the credentials you provided during registration and start creating products, adding inventories, and showcasing your offerings to our community of buyers.
    </p>
    <p>
      Here are a few key steps to get started:
    </p>
    <ol>
      <li><strong>Log In: </strong> Visit <a href="https://awesome-market.com/">Awesome Market</a> and enter your credentials to access your seller dashboard.</li>
      <li><strong>Create Products: </strong> Use the dashboard to create product listings, including detailed descriptions, images, and pricing information.</li>
      <li><strong>Manage Inventory: </strong> Keep track of your inventory levels and update them as needed to ensure accurate availability for buyers.</li>
    </ol>
    <p>
      <strong>Important:</strong> To start receiving payouts for your products, please complete your onboarding with Stripe. Click the link below to begin the onboarding process:
    </p>
    <p>
      <a href="${stripeAccountOnboardingUrl}">Complete Stripe Onboarding</a>
    </p>
    <p>
      This link will expire in 24 hours. If you do not complete the onboarding within this time frame, you will need to request a new onboarding link.
    </p>
    <p>
      If the link has expired, click <a href="${getNewStripeAccountOnboardingUrl}">here</a> to get a new Stripe onboarding link.
    </p>
    <p>
      We're thrilled to have you onboard and look forward to seeing your products on our platform. If you have any questions or need assistance, please don't hesitate to reply to this email.
    </p>
    <p>
      Thank you for choosing <strong>Awesome Market Place</strong>. We wish you every success in your selling journey!
    </p>
    <p>Best regards,</p> <br>

    <p>
      Awesome Market Engineering Team
    </p>
    <p><a href="https://awesome-market.com/">Awesome Market Place</a></p>
  </div>
  `;

  const text = `Dear ${sellerFName} ${sellerLName},
  
  I hope this email finds you well.
  
  I'm delighted to inform you that your seller account on Awesome Market Place has been successfully approved! 🎉
  
  You can now log in to your account using the credentials you provided during registration and start creating products, adding inventories, and showcasing your offerings to our community of buyers.
  
  Here are a few key steps to get started:

  1. Log In: Visit https://awesome-market.com/ and enter your credentials to access your seller dashboard.

  2. Create Products: Use the dashboard to create product listings, including detailed descriptions, images, and pricing information.

  3. Manage Inventory: Keep track of your inventory levels and update them as needed to ensure accurate availability for buyers.

  Important: To start receiving payouts for your products, please complete your onboarding with Stripe. Use the following link to begin the onboarding process:

  ${stripeAccountOnboardingUrl}

  This link will expire in 24 hours. If you do not complete the onboarding within this time frame, you will need to request a new onboarding link.

  If the link has expired, click the following link to get a new Stripe onboarding link: ${getNewStripeAccountOnboardingUrl}

  We're thrilled to have you onboard and look forward to seeing your products on our platform. If you have any questions or need assistance, please don't hesitate to reply to this email.

  Thank you for choosing Awesome Market Place. We wish you every success in your selling journey!
  
  Best regards,

  Awesome Market Engineering Team
  
  https://awesome-market.com/
  `;

  return { html, text };
};

export const prepareLoginToStripeExpressAccountMessageBody = (
  data: SellerAccountEmailBodyOptionsDto,
): { html: string; text: string } => {
  const {
    stripeExpressAccountLoginUrl,
    seller: { firstName: sellerFName, lastName: sellerLName },
  } = data;

  const html = `<h4>Dear ${sellerFName} ${sellerLName},</h4>
    
  <div>
    <p>
      I hope this email finds you well.
    </p>
    <p>
      We have received your request to access your Stripe Express account. Through your Stripe Express Dashboard, you can view all payment information and withdraw the paid amount to your bank account. Please use the link below to log in:
    </p>
    <p>
      <a href="${stripeExpressAccountLoginUrl}">Log In to Stripe Express</a>
    </p>
    <p>
      This link will expire in 24 hours. If you do not log in within this time frame, you will need to request a new login link.
    </p>
    <p>
      If the link has expired, please log in to your Awesome Market dashboard to request a new Stripe Express login link. This is a secured process to ensure your account's safety.
    </p>
    <p>
      We're excited to have you as part of our marketplace. If you have any questions or need assistance, please don't hesitate to reply to this email.
    </p>
    <p>
      Thank you for being a valued member of <strong>Awesome Market Place</strong>.
    </p>
    <p>Best regards,</p> <br>

    <p>
      Awesome Market Engineering Team
    </p>
    <p><a href="https://awesome-market.com/">Awesome Market Place</a></p>
  </div>
  `;

  const text = `Dear ${sellerFName} ${sellerLName},
  
  I hope this email finds you well.
  
  We have received your request to access your Stripe Express account. Through your Stripe Express Dashboard, you can view all payment information and withdraw the paid amount to your bank account. Please use the link below to log in:

  ${stripeExpressAccountLoginUrl}

  This link will expire in 24 hours. If you do not log in within this time frame, you will need to request a new login link.

  If the link has expired, please log in to your Awesome Market dashboard to request a new Stripe Express login link. This is a secured process to ensure your account's safety.

  We're excited to have you as part of our marketplace. If you have any questions or need assistance, please don't hesitate to reply to this email.

  Thank you for being a valued member of Awesome Market Place.
  
  Best regards,

  Awesome Market Engineering Team
  
  https://awesome-market.com/
  `;

  return { html, text };
};

export const isUserAdmin = (user: User): boolean => {
  return user.roles?.some((currRole) => {
    if (typeof currRole === 'string') {
      return currRole === ADMIN_ROLE_NAME;
    }
    return currRole.name === ADMIN_ROLE_NAME;
  });
};

const envConfigure = validateEnvironment(dotenvConfig);

export const getNewStripeAccountOnboardingUrl = (seller: User): string =>
  `${getEnvironmentValue<string>(envConfigure, API_URL)}/orders/users/${seller.id}/get-new-stripe-account-onboarding-url`;
