/**
 *
 * @param {*} items
 * @returns  {monetarySubTotal: number, rewardPointsSpent: number}
 */
export function calculateSubTotal(items) {
  let monetarySubTotal = 0;
  let rewardPointsSpent = 0;
  items.forEach((item) => {
    // Check if the item is a reward
    if (item.isReward) {
      // Calculate reward points used (assuming 'price' represents the reward points for reward items)
      rewardPointsSpent += item.price * item.quantity;
    } else {
      // Calculate monetary subtotal for non-reward items
      monetarySubTotal += item.price * item.quantity;
    }
  });
  console.log("calculateSubTotal finished", {
    monetarySubTotal,
    rewardPointsSpent,
  });

  return {
    monetarySubTotal,
    rewardPointsSpent,
    // 1 points per dollar spent (1 to 1 ratio)
    rewardPointsEarned: monetarySubTotal,
  };
}
