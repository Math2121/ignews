import { screen, render } from "@testing-library/react";
import { ActiveLink } from ".";
jest.mock("next/router", () => {
  return {
    useRouter() {
      return {
        asPath: "/",
      };
    },
  };
});

describe("ActiveLink component", () => {
  it(" renders correctly", () => {
   render(
      <ActiveLink href="/" activeClassNAme="active">
        <a>Home</a>
      </ActiveLink>
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("is receiving active class", () => {
   render(
      <ActiveLink href="/" activeClassNAme="active">
        <a>Home</a>
      </ActiveLink>
    );
    expect(screen.getByText("Home")).toHaveClass("active");
  });
});
