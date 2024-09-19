import { SendEmailCommand } from "@aws-sdk/client-ses";
import { formatExtendedUSDate } from "./utils/formatDateTime.js";
import { formatPhoneNumber } from "./utils/formatPhoneNumber.js";
import { calculateSubTotal } from "./utils/calculator.js";

export async function constructEmailBody(Dispensary, Order, User, orderItems) {
  const shortOrderId = `${Order.id.slice(0, 6)}-${Order.id.slice(-6)}`;

  const { monetarySubTotal, rewardPointsSpent, rewardPointsEarned } =
    calculateSubTotal(orderItems); //returns value in cents
  const orderItemRows = orderItems.map((item) => {
    // Check if the item is a reward and format the price accordingly
    const priceDisplay = item.isReward
      ? `${((item.price * item.quantity) / 100).toFixed()} pts`
      : `$${((item.price * item.quantity) / 100).toFixed(2)}`;

    return `<tr>
        <td style="border-bottom: 1px solid #78cc75; padding: 10px;">
          <div style="display: flex; align-items: center;">
            <img src="${item.Product.imageUrl}" alt="${item.productName}" style="width: 64px; height: 64px; margin-right: 10px; border-radius: 6px;">
            <div>
              <strong>${item.productName}</strong>
              <p style="margin: 0;">${item.variantName}</p>
            </div>
          </div>
        </td>
        <td style="border-bottom: 1px solid #78cc75; padding: 10px;">${item.quantity}</td>
        <td style="border-bottom: 1px solid #78cc75; padding: 10px; text-align: right;">${priceDisplay}</td>
      </tr>`;
  });

  const addressDisplay = () => {
    switch (Order.type) {
      case "DELIVERY":
        return `<div>
          <strong>Delivery Address:</strong><br>
          ${User.firstName} ${User.lastName}<br>
          ${Order.deliveryAddress.streetAddress}, ${Order.deliveryAddress.city}<br>
          ${Order.deliveryAddress.state}, ${Order.deliveryAddress.country} ${Order.deliveryAddress.postalCode}
          </div>`;
      default:
        return `<div>
            <strong>Pickup Address:</strong><br>
            ${Dispensary.name}<br>
            ${Dispensary.address.streetAddress}, ${Dispensary.address.city}<br>
            ${Dispensary.address.state}, ${Dispensary.address.country} ${Dispensary.address.postalCode}
            </div>`;
    }
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${Dispensary.name} Order Confirmation Email</title>
</head>
<body style="font-family: Arial, sans-serif;">
  <div style="max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #dcdcdc;">
    <div style="text-align: center;">
    <img src="${Dispensary.imageUrl}" alt="${
    Dispensary.name
  } Logo" style="max-width: 200px; margin-bottom: 20px; justify-self:center;">
      <h2>Your order is on its way.</h2>
      <p>${
        Dispensary.name
      } will be reaching out soon to arrange fulfillment.</p>
    </div>
    <hr>
    <div>
      <div>
        <strong>Summary:</strong><br>
        Order #: ${shortOrderId}<br>
        Order Date: ${formatExtendedUSDate(Order.datePlaced)}<br>
        Order Total: $${(
          (monetarySubTotal +
            (Order.type === "DELIVERY" ? Dispensary.deliveryFee : 0)) /
          100
        ).toFixed(2)}<br>
      </div>
      <br>
     ${addressDisplay()}
    </div>
    <hr>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr>
          <th style="border-bottom: 1px solid #78cc75; text-align: left; padding: 10px;">Product</th>
          <th style="border-bottom: 1px solid #78cc75; text-align: left; padding: 10px;">QTY</th>
          <th style="border-bottom: 1px solid #78cc75; text-align: right; padding: 10px;">Price</th>
        </tr>
      </thead>
      <tbody>
       ${orderItemRows}
      </tbody>
    </table>
    <div style="display: block;">
    <p style="justify-content: space-between;">
    Pending Reward Points: ${(rewardPointsEarned / 100).toFixed()}
    </p>
    <p>
    Reward Points Spent: ${
      (rewardPointsSpent / 100).toFixed() ?? 0?.toFixed(2)
    }<br>
    </p>
    <p style="justify-content: space-between;">
      Subtotal: ${(monetarySubTotal / 100).toFixed(2)}<br>
      </p>
      ${
        Order.type === "DELIVERY"
          ? `<p style="justify-content: space-between;">
      Delivery Fee: $${(Dispensary.deliveryFee / 100).toFixed(2)}
      </p>`
          : ``
      }
      <strong style="justify-content: space-between;">Order Total: $${(
        (monetarySubTotal +
          (Order.type === "DELIVERY" ? Dispensary.deliveryFee : 0)) /
        100
      ).toFixed(2)}</strong>
    </div>
    <hr>
    <div style="text-align: center;">
      <strong>Customer Service:</strong>
      <p>Call us at ${formatPhoneNumber(
        Dispensary.phoneNumber
      )} or reply to this email</p>
      <div style="justify-content: center; gap: 20px;">
        <strong>Stay connected with us:</strong>
        <br/>
        ${
          Dispensary?.socialMedia?.facebook
            ? `<a href="${Dispensary.socialMedia.facebook}" target="_blank"><img src="${facebookIconUrl}" alt="Facebook" style="width: 20px; height: 20px;"/></a>`
            : ""
        }
      ${
        Dispensary?.socialMedia?.twitter
          ? `<a href="${Dispensary.socialMedia.twitter}" target="_blank"><img src="${twitterIconUrl}" alt="Twitter" style="width: 20px; height: 20px;"/></a>`
          : ""
      }
      ${
        Dispensary?.socialMedia?.instagram
          ? `<a href="${Dispensary.socialMedia.instagram}" target="_blank"><img src="${instagramIconUrl}" alt="Instagram" style="width: 20px; height: 20px;"/></a>`
          : ""
      }
      ${
        Dispensary.socialMedia?.linkedIn
          ? `<a href="${Dispensary.socialMedia.linkedIn}" target="_blank"><img src="${linkedinIconUrl}" alt="LinkedIn" style="width: 20px; height: 20px;"/></a>`
          : ""
      }
      </div>
    </div>

  </div>

</body>

</html>`;
}

export async function sendConfirmationEmail(sesClient, to, subject, body) {
  const params = {
    Destination: {
      ToAddresses: [to],
      bcc: "crishon@codehouse.solutions",
    },
    Message: {
      Body: {
        Html: { Data: body },
      },
      Subject: { Data: subject },
    },
    Source: "info@codehouse.solutions",
  };

  try {
    await sesClient.send(new SendEmailCommand(params));
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}`, error);
  }
}
