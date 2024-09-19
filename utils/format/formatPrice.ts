export const formatPrice = (value: number) => {
  return (value / 100).toFixed(2);
};

export const formatRewardPoints = (value: number) => {
  return Math.round(value / 100).toFixed(0);
};
