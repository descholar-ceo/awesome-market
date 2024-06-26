import { generateTokens } from '@/common/utils/token.utils';
import { OrderNotificationEmailBodyOptionsDto } from './dto/notification.dto';
import {
  GENERAL_JWT_EXPIRES,
  dotenvConfig,
  getEnvironmentValue,
  validateEnvironment,
} from '@/config/config.utils';

export const prepareOrderPendingNotificationEmailBody = async (
  data: OrderNotificationEmailBodyOptionsDto,
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
                <h3>Next Steps:</h3>`
            : ''
        }
        <ol>
          <li><strong>Payment: </strong>Please complete your payment by clicking on this <a href="${apiUrl}/orders/${orderId}/checkout?success-url=${apiUrl}/orders/${orderId}/success&cancel-url=${apiUrl}/orders/${orderId}/cancel&token=${buyerToken}">link</a><em> Please Note that the link will expire in ${linkExpirationTime}</em></li>
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

export const prepareOrderSuccessPaymentEmailBody = (
  data: OrderNotificationEmailBodyOptionsDto,
) => {
  const {
    order: {
      buyer: {
        firstName: customerFName,
        lastName: customerLName,
        currency,
        shippingAddress,
      },
      orderItems,
    },
  } = data;
  const html = `<h4>Dear ${customerFName} ${customerLName},</h4>
      <div>
          <p>
              We are pleased to inform you that your payment has been successfully received. Your order is now being processed by the respective sellers. Here are the details of your recent purchase:
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
          <p><strong>Total Amount Paid: </strong> ${currency.toUpperCase()} ${orderItems
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
                  <h3>Next Steps:</h3>`
              : ''
          }
          <ol>
            <li><strong>Processing: </strong>Your order is now being processed by the respective sellers. We will notify you once your order is ready for shipping.</li>
          </ol>
          <p>
            If you have any questions about your order, you can contact the sellers through our platform's messaging system.
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
        We are pleased to inform you that your payment has been successfully received. Your order is now being processed by the respective sellers. Here are the details of your recent purchase:
    
        Order Summary:
    
        ${orderItems
          .map(
            (currItem) => `
              Item Name:  ${currItem.inventory.product.name} #${currItem.inventory.product.code}
              Unit Price:  ${currency.toUpperCase()} ${currItem.inventory.product.unitPrice?.toLocaleString()}
              Quantity: ${currItem.quantity?.toLocaleString()}
              Sub Total:  ${currency.toUpperCase()} ${(currItem.quantity * currItem.inventory.product.unitPrice)?.toLocaleString()}
              Seller Names: ${currItem.inventory.owner?.firstName} ${currItem.inventory.owner?.lastName}
            `,
          )
          .join('')}
    
    Total Amount Paid:  ${currency.toUpperCase()} ${orderItems
      .reduce(
        (accumulator, currItem) =>
          accumulator +
          currItem.inventory.product.unitPrice * currItem.quantity,
        0,
      )
      ?.toLocaleString()}
    ${
      !!shippingAddress
        ? `
              Shipping Address:
            
            ${shippingAddress}
            Next Steps:`
        : ''
    }
      
    Processing: Your order is now being processed by the respective sellers. We will notify you once your order is ready for shipping.
    
    Contact the Seller: If you have any questions about your order, you can contact the sellers through our platform's messaging system.
    
    If you need further assistance, feel free to reply to this email.
    
    Thank you for shopping with us!
    
    Best Regards,

    Awesome Market Team
    
    Awesome Market Place: https://awesome-market.com/
`;
  return { html, text };
};

export const prepareOrderShippedEmailBody = (
  data: OrderNotificationEmailBodyOptionsDto,
) => {
  const {
    order: {
      code,
      buyer: {
        firstName: customerFName,
        lastName: customerLName,
        currency,
        shippingAddress,
      },
      orderItems,
    },
  } = data;

  const html = `<h4>Dear ${customerFName} ${customerLName},</h4>
      <div>
          <p>
              We are excited to inform you that your order has been processed and is now being shipped to your address. Here are the details of your order:
          </p>
          <h3>Order Summary:</h3>
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
          <p><strong>Total Amount Paid: </strong> ${currency.toUpperCase()} ${orderItems
            .reduce(
              (accumulator, currItem) =>
                accumulator +
                currItem.inventory.product.unitPrice * currItem.quantity,
              0,
            )
            ?.toLocaleString()}</p>
          ${
            !!shippingAddress
              ? `<h3>Shipping Address:</h3>
                  <p>${shippingAddress}</p>`
              : ''
          }
          <h3>Next Steps:</h3>
          <ol>
            <li><strong>Shipping: </strong>Your order is now on its way to you. You can track the shipment using this order code: #${code}.</li>
            <li><strong>Delivery: </strong>Once your order is out for delivery, you will receive another notification.</li>
          </ol>
          <p>If you have any questions about your order, you can contact the sellers through our platform's messaging system.</p>
          <p>If you need further assistance, feel free to reply to this email.</p>
          <p>Thank you for shopping with us!</p>

          <p>Best Regards,</p> <br>
          <p>Awesome Market Team</p>
          <p><a href="https://awesome-market.com/">Awesome Market Place</a></p>
      </div>`;

  const text = `Dear ${customerFName} ${customerLName},
        We are excited to inform you that your order has been processed and is now being shipped to your address. Here are the details of your order:
    
        Order Summary:
    
        ${orderItems
          .map(
            (currItem) => `
              Item Name: ${currItem.inventory.product.name} #${currItem.inventory.product.code}
              Unit Price: ${currency.toUpperCase()} ${currItem.inventory.product.unitPrice?.toLocaleString()}
              Quantity: ${currItem.quantity?.toLocaleString()}
              Sub Total: ${currency.toUpperCase()} ${(currItem.quantity * currItem.inventory.product.unitPrice)?.toLocaleString()}
              Seller Names: ${currItem.inventory.owner?.firstName} ${currItem.inventory.owner?.lastName}
            `,
          )
          .join('')}
    
    Total Amount Paid: ${currency.toUpperCase()} ${orderItems
      .reduce(
        (accumulator, currItem) =>
          accumulator +
          currItem.inventory.product.unitPrice * currItem.quantity,
        0,
      )
      ?.toLocaleString()}
    ${
      !!shippingAddress
        ? `
              Shipping Address:
            
            ${shippingAddress}`
        : ''
    }
    
    Next Steps:
    - Shipping: Your order is now on its way to you. You can track the shipment using this order code: #${code}.
    - Delivery: Once your order is out for delivery, you will receive another notification.
    
    If you have any questions about your order, you can contact the sellers through our platform's messaging system.
    
    If you need further assistance, feel free to reply to this email.
    
    Thank you for shopping with us!
    
    Best Regards,

    Awesome Market Team
    
    Awesome Market Place: https://awesome-market.com/
`;

  return { html, text };
};

export const prepareOrderDeliveredEmailBody = (
  data: OrderNotificationEmailBodyOptionsDto,
) => {
  const {
    order: {
      buyer: { firstName: customerFName, lastName: customerLName, currency },
      orderItems,
    },
  } = data;

  const html = `<h4>Dear ${customerFName} ${customerLName},</h4>
      <div>
          <p>
              We are thrilled to inform you that your order has been successfully delivered. We appreciate your trust in us and hope you enjoy your purchase. Here are the details of your order:
          </p>
          <h3>Order Summary:</h3>
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
          <p><strong>Total Amount Paid: </strong> ${currency.toUpperCase()} ${orderItems
            .reduce(
              (accumulator, currItem) =>
                accumulator +
                currItem.inventory.product.unitPrice * currItem.quantity,
              0,
            )
            ?.toLocaleString()}</p>
          <h3>Thank You for Shopping with Us!</h3>
          <p>
            We invite you to explore a wide range of products available on our marketplace. We are constantly updating our inventory to provide you with the best shopping experience.
          </p>
          <p>
              If you need further assistance, feel free to reply to this email.
          </p>
          <p>
              Thank you for shopping with us!
          </p>
          <p>Best Regards,</p> <br>
          <p>Awesome Market Team</p>
          <p><a href="https://awesome-market.com/">Awesome Market Place</a></p>
      </div>`;

  const text = `Dear ${customerFName} ${customerLName},
        We are thrilled to inform you that your order has been successfully delivered. We appreciate your trust in us and hope you enjoy your purchase. Here are the details of your order:
    
        Order Summary:
    
        ${orderItems
          .map(
            (currItem) => `
              Item Name: ${currItem.inventory.product.name} #${currItem.inventory.product.code}
              Unit Price: ${currency.toUpperCase()} ${currItem.inventory.product.unitPrice?.toLocaleString()}
              Quantity: ${currItem.quantity?.toLocaleString()}
              Sub Total: ${currency.toUpperCase()} ${(currItem.quantity * currItem.inventory.product.unitPrice)?.toLocaleString()}
              Seller Names: ${currItem.inventory.owner?.firstName} ${currItem.inventory.owner?.lastName}
            `,
          )
          .join('')}
    
    Total Amount Paid: ${currency.toUpperCase()} ${orderItems
      .reduce(
        (accumulator, currItem) =>
          accumulator +
          currItem.inventory.product.unitPrice * currItem.quantity,
        0,
      )
      ?.toLocaleString()}
    
    Thank You for Shopping with Us!
    
    We invite you to explore a wide range of products available on our marketplace. We are constantly updating our inventory to provide you with the best shopping experience.
    
    If you need further assistance, feel free to reply to this email.
    
    Thank you for shopping with us!
    
    Best Regards,

    Awesome Market Team
    
    Awesome Market Place: https://awesome-market.com/
`;

  return { html, text };
};
