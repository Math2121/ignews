import { render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import Posts, { getStaticProps } from "../../pages/posts";
import { getPrismicClient } from "../../services/prismic";

jest.mock('next-auth/client')
jest.mock('../../services/prismic')

const posts = [
  {slug:'new-post',title:'New Post',excerpt:'Post excerpt',updatedAt:'10 de Abril'},

]
describe("Home page", () => {
  it("renders correctly", () => {
    render(<Posts posts={posts}/>);

    expect(screen.getByText("New Post")).toBeInTheDocument();
  });

  it("loads initial data", async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
     query:jest.fn().mockResolvedValueOnce({
       results:[
       {
         uid:'my-new',
         data:{
           title:[
             {type:'heading',text:'My new Post'}
           ],
           content:[
             {type:'paragraph',text:'Post excerpt'}
           ]
         },
         last_publication_date:'04-08-2021'
       }
       ]
     })
    } as any); //promise

    const response = await getStaticProps({})

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts:[{
            slug:'my-new',
            title:'My new Post',
            excerpt:'Post excerpt',
            updatedAt: '08 de abril de 2021'
          }]
        },
      })
    );
  });
});
