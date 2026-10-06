const sampleProducts = [
  {
    _id: "64a000000000000000000001",
    name: "Everyday Ceramic Mug",
    description: "A sample marketplace item for exploring the cart.",
    category: "Home & Living",
    originalPrice: 24,
    discountPrice: 18,
    stock: 12,
    shopId: "64a000000000000000000010",
    shop: { _id: "64a000000000000000000010", name: "Sample Home Studio" },
    images: [{ public_id: "", url: "/logo.svg" }],
    qty: 1,
  },
  {
    _id: "64a000000000000000000002",
    name: "Canvas Market Tote",
    description: "A sample marketplace item for exploring the wishlist.",
    category: "Accessories",
    originalPrice: 32,
    discountPrice: 26,
    stock: 8,
    shopId: "64a000000000000000000011",
    shop: { _id: "64a000000000000000000011", name: "Sample Goods Co." },
    images: [{ public_id: "", url: "/logo.svg" }],
    qty: 1,
  },
];

export const sampleCartItems = [sampleProducts[0]];
export const sampleWishlistItems = [sampleProducts[1]];
