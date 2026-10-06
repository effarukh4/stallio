import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import App from "./App";
import Store from "./redux/store";

vi.mock("axios", () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        user: null,
        seller: null,
        products: [],
        events: [],
        stripeApikey: null,
      },
    }),
  },
}));

vi.mock("react-lottie", () => ({
  default: () => null,
}));

test("renders the Stallio homepage", () => {
  render(
    <Provider store={Store}>
      <App />
    </Provider>
  );

  expect(screen.getByText(/Stallio\. All rights reserved\./i)).toBeInTheDocument();
});
