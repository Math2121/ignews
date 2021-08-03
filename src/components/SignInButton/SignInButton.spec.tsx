import { screen, getByText, render } from "@testing-library/react";
import { SignInButton } from ".";
import { useSession } from "next-auth/client";
import {mocked} from 'ts-jest/utils'
jest.mock("next-auth/client");

describe("SignInButton component", () => {
  it(" renders correctly when user is not authenticated", () => {
    const userSessionMoked = mocked(useSession);
    userSessionMoked.mockReturnValueOnce([null, false]);
    render(<SignInButton />);
    expect(screen.getByText("Sign in with Github")).toBeInTheDocument();
  });

  it(" renders correctly when user is  authenticated", () => {
    const userSessionMoked = mocked(useSession);
    userSessionMoked.mockReturnValue([
      {
        user: {
          name: "John Doe",
          email: "john.doe@gmail.com",
        }, expires: "fake",
      },
      false,
    ]);
    render(<SignInButton />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
