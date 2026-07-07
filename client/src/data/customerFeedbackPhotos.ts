export const CUSTOMER_FEEDBACK_PHOTOS = [
  ...Array.from(
    { length: 24 },
    (_, i) => `/custom-bracelet/general/IMG_${4826 + i}.PNG`,
  ),
  ...Array.from(
    { length: 8 },
    (_, i) =>
      `/custom-bracelet/feedback/customer-feedback-${String(i + 1).padStart(2, '0')}.jpg`,
  ),
];
