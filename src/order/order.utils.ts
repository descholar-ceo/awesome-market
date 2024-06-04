import { PendingOrderNotificationEmailBodyOptionsDto } from './dto/notification.dto';

export const prepareOrderPendingNotificationEmailBody = (
  data: PendingOrderNotificationEmailBodyOptionsDto,
): { html: string; text: string } => {
  const {
    order: {
      buyer: {
        firstName: customerFName,
        lastName: customerLName,
        shippingAddress,
      },
      orderItems,
    },
  } = data;
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
                        <p><strong>Item Name: </strong> ${currItem.inventory.product.name} #${currItem.inventory.product.code}</p>
                        <p><strong>Unit Price: </strong> RWF ${currItem.inventory.product.unitPrice}</p>
                        <p><strong>Quantity: </strong>${currItem.quantity}</p>
                        <p><strong>Sub Total: </strong> RWF ${currItem.quantity * currItem.inventory.product.unitPrice}</p>
                        <p><strong>Seller Names: </strong>${currItem.inventory.owner?.firstName} ${currItem.inventory.owner?.lastName}</p>
                    </li>
                `,
              )
              .join('')}
        </ol>
        <p><strong>Total Amount to Pay: </strong> RWF ${orderItems.reduce(
          (accumulator, currItem) =>
            accumulator +
            currItem.inventory.product.unitPrice * currItem.quantity,
          0,
        )}</p>
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
          <li><strong>Payment: </strong>Please complete your payment</li>
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
            Unit Price:  RWF ${currItem.inventory.product.unitPrice}
            Quantity: ${currItem.quantity}
            Sub Total:  RWF ${currItem.quantity * currItem.inventory.product.unitPrice}
            Seller Names: ${currItem.inventory.owner?.firstName} ${currItem.inventory.owner?.lastName}
          `,
        )
        .join('')}

      Total Amount to Pay: ${orderItems.reduce(
        (accumulator, currItem) =>
          accumulator +
          currItem.inventory.product.unitPrice * currItem.quantity,
        0,
      )}

      ${!!shippingAddress ? 'Shipping Address:' + shippingAddress : ''}
    
      Next Steps:
      Payment: Please complete your payment</li>
      Processing: Once we receive your payment, your order will be processed by the respective sellers.</li>
      
      Contact the Seller: If you have any questions about your order, you can contact the sellers through our platform's messaging system
      If you need further assistance, feel free to reply to this email.
    
      Thank you for shopping with us!
    
      Best regards,

      Awesome Market Team
    
      https://awesome-market.com/
  `;
  return { html, text };
};
