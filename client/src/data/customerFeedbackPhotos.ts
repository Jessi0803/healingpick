export type CustomerFeedbackPhoto = {
  original: string;
  full: string;
  thumb: string;
};

const optimizedBase = '/custom-bracelet/feedback-optimized';

export const CUSTOMER_FEEDBACK_PHOTO_ITEMS: CustomerFeedbackPhoto[] = [
  ...Array.from({ length: 8 }, (_, i) => {
    const name = `customer-feedback-${String(i + 1).padStart(2, '0')}`;

    return {
      original: `/custom-bracelet/feedback/${name}.jpg`,
      full: `${optimizedBase}/full/${name}.webp`,
      thumb: `${optimizedBase}/thumb/${name}.webp`,
    };
  }),
  ...Array.from({ length: 24 }, (_, i) => {
    const name = `IMG_${4826 + i}`;

    return {
      original: `/custom-bracelet/general/${name}.PNG`,
      full: `${optimizedBase}/full/${name}.webp`,
      thumb: `${optimizedBase}/thumb/${name}.webp`,
    };
  }),
];

export const CUSTOMER_FEEDBACK_PHOTOS = CUSTOMER_FEEDBACK_PHOTO_ITEMS.map(
  photo => photo.full,
);
