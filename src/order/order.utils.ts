import { generateTokens } from '@/common/utils/token.utils';
import { PendingOrderNotificationEmailBodyOptionsDto } from './dto/notification.dto';
import {
  GENERAL_JWT_EXPIRES,
  dotenvConfig,
  getEnvironmentValue,
  validateEnvironment,
} from '@/config/config.utils';

export const prepareOrderPendingNotificationEmailBody = async (
  data: PendingOrderNotificationEmailBodyOptionsDto,
): Promise<{ html: string; text: string }> => {
  const {
    order: {
      id: orderId,
      buyer,
      buyer: {
        firstName: customerFName,
        lastName: customerLName,
        currency,
        shippingAddress,
      },
      orderItems,
    },
    apiUrl,
  } = data;
  const { otherToken: buyerToken } = await generateTokens(buyer, 'otherTokens');
  const linkExpirationTime = getEnvironmentValue<string>(
    validateEnvironment(dotenvConfig),
    GENERAL_JWT_EXPIRES,
  );
  const html = `<h4>Dear ${customerFName} ${customerLName},</h4>
      <div>
        <p>
            Thank you for your order! Here are the details of your recent purchase:
        </p>
        <h3>
          Order Summary:
        </h3>
        <ol>
            ${orderItems
              .map(
                (currItem) => `
                    <li>
                        <p>
                          <strong>Item Name: </strong> ${currItem.inventory.product.name} #${currItem.inventory.product.code}<br>
                          <strong>Unit Price: </strong> ${currency.toUpperCase()} ${currItem.inventory.product.unitPrice?.toLocaleString()}<br>
                          <strong>Quantity: </strong>${currItem.quantity?.toLocaleString()}<br>
                          <strong>Sub Total: </strong> ${currency.toUpperCase()} ${(currItem.quantity * currItem.inventory.product.unitPrice)?.toLocaleString()}<br>
                          <strong>Seller Names: </strong>${currItem.inventory.owner?.firstName} ${currItem.inventory.owner?.lastName}
                        </p>
                    </li>
                `,
              )
              .join('')}
        </ol>
        <p><strong>Total Amount to Pay: </strong> ${currency.toUpperCase()} ${orderItems
          .reduce(
            (accumulator, currItem) =>
              accumulator +
              currItem.inventory.product.unitPrice * currItem.quantity,
            0,
          )
          ?.toLocaleString()}</p>
        ${
          !!shippingAddress
            ? `<h3>
                  Shipping Address:
                </h3>
                <p>${shippingAddress}</p>
                <h3>Next Steps:</h4>`
            : ''
        }
        <ol>
          <li><strong>Payment: </strong>Please complete your payment by clicking on this <a href="${apiUrl}/orders/${orderId}/checkout?success-url=${apiUrl}/orders/${orderId}/success&cancel-url=${apiUrl}/orders/${orderId}/cancel&token=${buyerToken}">link</a><em style="text-decoration:underline;"> Please Note that the link will expire in ${linkExpirationTime}</em></li>
          <li><strong>Processing: </strong>Once we receive your payment, your order will be processed by the respective sellers.</li>
        </ol>
        <p>
          <strong>Contact the Seller:</strong> If you have any questions about your order, you can contact the sellers through our platform's messaging system
        </p>
        <p>
            If you need further assistance, feel free to reply to this email.
        </p>
        <p>
            Thank you for shopping with us!
        </p>

        <p>Best Regards,</p> <br>
  
        <p>
          Awesome Market Team
        </p>
        <p><a href="https://awesome-market.com/">Awesome Market Place</a></p>
      </div>
`;
  const text = `Dear ${customerFName} ${customerLName},
  
      Thank you for your order! Here are the details of your recent purchase:
    
      Order Summary:
      ${orderItems
        .map(
          (currItem) => `  
            Item Name:  ${currItem.inventory.product.name} #${currItem.inventory.product.code}
            Unit Price:  ${currency.toUpperCase()} ${currItem.inventory.product.unitPrice?.toLocaleString()}
            Quantity: ${currItem.quantity?.toLocaleString()}
            Sub Total:  ${currency.toUpperCase()} ${currItem.quantity * currItem.inventory.product.unitPrice}
            Seller Names: ${currItem.inventory.owner?.firstName} ${currItem.inventory.owner?.lastName}
          `,
        )
        .join('')}

      Total Amount to Pay: ${orderItems
        .reduce(
          (accumulator, currItem) =>
            accumulator +
            currItem.inventory.product.unitPrice * currItem.quantity,
          0,
        )
        ?.toLocaleString()}

      ${!!shippingAddress ? 'Shipping Address:' + shippingAddress : ''}
    
      Next Steps:
      Payment: Please complete your payment by clicking on this <a href="${apiUrl}/orders/${orderId}/checkout?success-url=${apiUrl}/orders/${orderId}/success&cancel-url=${apiUrl}/orders/${orderId}/cancel&token=${buyerToken}. Please Note that the link will expire in ${linkExpirationTime}
      Processing: Once we receive your payment, your order will be processed by the respective sellers.
      
      Contact the Seller: If you have any questions about your order, you can contact the sellers through our platform's messaging system
      If you need further assistance, feel free to reply to this email.
    
      Thank you for shopping with us!
    
      Best regards,

      Awesome Market Team
    
      https://awesome-market.com/
  `;
  return { html, text };
};
