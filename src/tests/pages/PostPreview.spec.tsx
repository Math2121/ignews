import { render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import Post, { getStaticProps } from "../../pages/posts/preview/[slug]";
import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
import { getPrismicClient } from "../../services/prismic";
jest.mock("next-auth/client");
jest.mock("next/router");
jest.mock("../../services/prismic");

const posts = {
  slug: "new-post",
  title: "New Post",
  content: "<p>Post excerpt</p>",
  updatedAt: "10 de Abril",
};

describe("post preview page", () => {
  it("renders correctly", () => {
    const useSessionMoked = mocked(useSession);
    useSessionMoked.mockReturnValueOnce([null, false]);
    render(<Post post={posts} />);

    expect(screen.getByText("New Post")).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
    expect(screen.getByText("Wanna continue reading ?")).toBeInTheDocument();
  });

  it("redirects user to full when user is subscribed", async () => {
    const useSessionMoked = mocked(useSession);
    const userRouterMocked = mocked(useRouter);
    useSessionMoked.mockReturnValueOnce([
      { activeSubscription: "fake-new" },
    ] as any);
    const pushMock = jest.fn();
    userRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<Post post={posts} />);

    expect(pushMock).toHaveBeenCalledWith("/posts/new-post");
  });
  it("loads initial data", async () => {
 
    const getPrismicClientMocked = mocked(getPrismicClient)
    getPrismicClientMocked.mockReturnValueOnce({
      getByUID:jest.fn().mockResolvedValueOnce({
        data:{

            title:[
              {type:'heading',text:'My new post'}
            ],
            content:[
              {type:'paragraph',text:'Post content'}
            ]
        },
          last_publication_date:'04-08-2021'

      })
    } as any )


    const response = await getStaticProps({params:{slug:'new-post'}} );

    expect(response).toEqual(
      expect.objectContaining({
        props:{
          post:{
            slug:'new-post',
            title:'My new post',
            content:'<p>Post content</p>',
            updatedAt:'08 de abril de 2021'
          }
        }
      })
    );
  });
});
