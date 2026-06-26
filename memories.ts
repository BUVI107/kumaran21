/**
 * MEMORY HALL DATA
 *
 * All photos are the original uploaded images (resized/compressed
 * for the web, never altered in content, never AI-generated).
 * They live in /public/images and are referenced here by path.
 */

export interface Memory {
  src: string;
  alt: string;
  name: string;
  caption: string;
}

export interface SimplePhoto {
  src: string;
  alt: string;
}

/**
 * The main Memory Hall story, in deliberate emotional order —
 * never randomized.
 */
export const MEMORIES: readonly Memory[] = [
  {
    src: "/images/dreamer.jpg",
    alt: "Kumaran flying a kite",
    name: "The Dreamer",
    caption: "Every journey begins with a dream.",
  },
  {
    src: "/images/explorer.jpg",
    alt: "Kumaran sitting by a river",
    name: "The Explorer",
    caption: "Some paths are meant to be discovered.",
  },
  {
    src: "/images/creator.jpg",
    alt: "Black and white mirror photo of Kumaran with a camera",
    name: "The Creator",
    caption: "Behind every lens is a story waiting to be told.",
  },
  {
    src: "/images/friend-selfie.jpg",
    alt: "Kumaran and Kasin selfie",
    name: "The Friendship Chapter",
    caption: "Some people become memories.\nSome become family.",
  },
  {
    src: "/images/friend-group.jpg",
    alt: "Kumaran and Kasin together outdoors",
    name: "Unforgettable Days",
    caption: "The best memories are never planned.",
  },
  {
    src: "/images/gentleman.jpg",
    alt: "Kumaran in a side pose on a balcony",
    name: "The Gentleman",
    caption: "Confidence is silent.\nCharacter speaks.",
  },
  {
    src: "/images/signature-smile.jpg",
    alt: "Kumaran smiling in a blue traditional shirt",
    name: "The Signature Smile",
    caption: "A simple smile can hold a thousand memories.",
  },
];

/**
 * "Moments Beyond Words" — deliberately caption-free. The photos
 * are meant to speak for themselves.
 */
export const CINEMATIC_MOMENTS: readonly SimplePhoto[] = [
  { src: "/images/sunglasses.jpg", alt: "Kumaran wearing sunglasses" },
  { src: "/images/redblack.jpg", alt: "Kumaran in a red and black shirt" },
  { src: "/images/rooftop.jpg", alt: "Kumaran on a rooftop at dusk" },
];

/**
 * "A Friendship Worth Keeping" — featured separately from the
 * main story, as its own framed section.
 */
export const FRIENDSHIP_PHOTOS: readonly SimplePhoto[] = [
  { src: "/images/friend-selfie.jpg", alt: "Kumaran and Kasin" },
  { src: "/images/friend-group.jpg", alt: "Kumaran and Kasin together" },
];

export const PORTRAIT_IMAGE: SimplePhoto = {
  src: "/images/portrait.jpg",
  alt: "Portrait of Kumaran",
};
