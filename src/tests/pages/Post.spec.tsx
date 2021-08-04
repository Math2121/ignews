import { render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import Post, { getServerSideProps } from "../../pages/posts/[slug]";
import { getPrismicClient } from "../../services/prismic";
import { getSession } from "next-auth/client";
jest.mock("next-auth/client");
jest.mock("../../services/prismic");

const posts = {
  slug: "new-post",
  title: "New Post",
  content: "Post excerpt",
  updatedAt: "10 de Abril",
};

describe("Home page", () => {
  it("renders correctly", () => {
    render(<Post post={posts} />);

    expect(screen.getByText("New Post")).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
  });

  it("redirects user if no subscription is found", async () => {
    const getSessionMocked = mocked(getSession);
    getSessionMocked.mockResolvedValueOnce(null);
    const response = await getServerSideProps({
      params: { slug: "my-new" },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: "/",
        }),
      })
    );
  });
  it("loads initial data", async () => {
    const getSessionMocked = mocked(getSession);
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

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription:'fake-new'
    } as any)
    const response = await getServerSideProps({
      params: { slug: "my-new" },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props:{
          post:{
            slug:'my-new',
            title:'My new post',
            content:'<p>Post content</p>',
            updatedAt:'08 de abril de 2021'
          }
        }
      })
    );
  });
});
