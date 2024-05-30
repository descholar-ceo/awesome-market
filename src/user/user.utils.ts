import { SellerAccountEmailBodyOptionsDto } from '@/mail/mail.dtos';

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
        The new seller ${sellerFName}, has completed the initial registration process and is now awaiting approval from an admin before they can start listing their products/services for sale. We kindly request your assistance in reviewing their account and approving it for selling on our platform.
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
      <p><a href="https://awesomity.rw/">Awesome Market Place</a></p>
    </div>
    `;
  const text = `Dear ${adminFName} ${adminLName},
    
        I hope this email finds you well.
      
        I'm reaching out to inform you about a recent registration on our marketplace platform. A new user has signed up as a seller and is eager to start selling their products on our platform.
      
        As part of our commitment to maintaining the highest standards of quality and trustworthiness, we have implemented a verification process for all new seller accounts. This process involves conducting background checks and reviewing the information provided by the seller to ensure compliance with our platform's policies and guidelines.
      
        The new seller ${sellerFName}, has completed the initial registration process and is now awaiting approval from an admin before they can start listing their products/services for sale. We kindly request your assistance in reviewing their account and approving it for selling on our platform.
      
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
      Best regards, <br>

      Awesome Market Engineering Team
      https://awesomity.rw/
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
      We wanted to inform you that your seller account registration on <strong>Awesome Market Place</strong> has been received. Thank you for choosing our platform to showcase your products/services.
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
    <p><a href="https://awesomity.rw/">Awesome Market Place</a></p>
  </div>
  `;
  const text = `Dear ${sellerFName} ${sellerLName},
  
      I hope this email finds you well.
    
      We wanted to inform you that your seller account registration on Awesome Market Place has been received. Thank you for choosing our platform to showcase your products/services.
    
      Please note that your account is currently pending verification and approval by our admin team. We are conducting background checks and reviewing the information provided to ensure compliance with our platform's policies and guidelines.
    
      We appreciate your patience during this process. Rest assured that we are working diligently to complete the verification and approval as soon as possible. Once your account is approved, you will receive a confirmation email with further instructions on how to start selling on our platform.

      If you have any questions or require further information about the seller's registration, please feel free to reply to this email.
    
      Thank you for your cooperation.
      Best regards,

    Awesome Market Engineering Team
    https://awesomity.rw/
  `;
  return { html, text };
};
