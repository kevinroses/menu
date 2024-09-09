export const formatPrice = (price) => {
  const formatter = new Intl.NumberFormat("en", {
    currency: "USD",
    maximumSignificantDigits: 4,
    style: "currency",
  });
  return formatter.format(+Number(price).toFixed(2));
};
