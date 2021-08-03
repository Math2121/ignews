import { screen, render, fireEvent } from "@testing-library/react";
import { signIn, useSession } from "next-auth/client";
import { useRouter } from "next/router";
import { mocked } from "ts-jest/utils";
import { SubscribeButton } from ".";


jest.mock("next-auth/client");
jest.mock("next/router");

describe("SubscribeButton component", () => {
  it(" renders correctly ", () => {
    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);
    render(<SubscribeButton />);

    expect(screen.getByText("Subscribe now")).toBeInTheDocument();
  });

  it("redirects user to sign in when not authenticated", () => {
    const signInMocked = mocked(signIn);
    const useSessionMoked = mocked(useSession);
    useSessionMoked.mockReturnValueOnce([null, false]);
    render(<SubscribeButton />);
    const subscribeButton = screen.getByText("Subscribe now");

    fireEvent.click(subscribeButton);

    expect(signInMocked).toHaveBeenCalled();
  });

  it("redirects to posts when user already has a subscription", () => {
    const useRouterMocked = mocked(useRouter);
    const useSessionMoked = mocked(useSession);
 

    useSessionMoked.mockReturnValueOnce([
      {
        user: {
          name: "John Doe",
          email: "john.doe@gmail.com"
        },
        expires: "fake",
        activeSubscription:"fake-active"
      },
      false
    ]);
    const pushMock = jest.fn();
    useRouterMocked.mockReturnValueOnce({ push: pushMock } as any);

    render(<SubscribeButton />);
    const subscribeButton = screen.getByText("Subscribe now");

    fireEvent.click(subscribeButton);

    expect(pushMock).toHaveBeenCalledWith('/posts');
  });

});
