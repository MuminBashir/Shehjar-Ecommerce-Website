export const formatPrice = (number) => {
  const newNumber = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(number);
  return newNumber;
};

export const getUniqueValues = (data, type) => {
  let dataMap = data.map((item) => item[type]);
  if (type === "colors") {
    dataMap = dataMap.flat();
  }
  return ["all", ...new Set(dataMap)];
};

export const trackGAEvent = ({ event, ecommerce }) => {
  if (typeof window !== undefined) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      ecommerce,
    });
  }
};
