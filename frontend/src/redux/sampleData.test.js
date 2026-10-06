beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

test("new visitors start with sample cart and wishlist items", async () => {
  const [{ cartReducer }, { wishlistReducer }] = await Promise.all([
    import("./reducers/cart"),
    import("./reducers/wishlist"),
  ]);
  const cart = cartReducer(undefined, { type: "test/init" }).cart;
  const wishlist = wishlistReducer(undefined, { type: "test/init" }).wishlist;

  expect(cart).toHaveLength(1);
  expect(cart[0]).toMatchObject({
    name: "Everyday Ceramic Mug",
    qty: 1,
    discountPrice: 18,
  });
  expect(wishlist).toHaveLength(1);
  expect(wishlist[0]).toMatchObject({
    name: "Canvas Market Tote",
    discountPrice: 26,
  });
});

test("saved cart and wishlist take precedence over sample items", async () => {
  const savedCart = [{ _id: "saved-cart-item", qty: 2 }];
  const savedWishlist = [{ _id: "saved-wishlist-item" }];
  localStorage.setItem("cartItems", JSON.stringify(savedCart));
  localStorage.setItem("wishlistItems", JSON.stringify(savedWishlist));

  const [{ cartReducer }, { wishlistReducer }] = await Promise.all([
    import("./reducers/cart"),
    import("./reducers/wishlist"),
  ]);

  expect(cartReducer(undefined, { type: "test/init" }).cart).toEqual(savedCart);
  expect(wishlistReducer(undefined, { type: "test/init" }).wishlist).toEqual(
    savedWishlist
  );
});
