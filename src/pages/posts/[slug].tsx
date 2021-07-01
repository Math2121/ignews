import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import Head from "next/head";
import { RichText } from "prismic-dom";
import styles from "./post.module.scss";
import { getPrismicClient } from "../../services/prismic";
interface PropsPost {
  post: {
    slug: string;
    title: string;
    updatedAt: string;
    content: string;
  };
}

export default function Post({ post }: PropsPost) {
  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>

          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  //verfica se o suárioestá logado através dos cookis da req
  const session = await getSession({ req });

  if(!session?.activeSubscription){
    return {
      redirect:{
        destination:'/',
        permanent:false
      }
    }
  }
  // recebe o slug que vem pela rota
  const { slug } = params;

  const prismic = getPrismicClient(req);
  //dados do post
  const response = await prismic.getByUID("post", String(slug), {});

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ),
  };

  return {
    props: {
      post,
    },
  };
};
