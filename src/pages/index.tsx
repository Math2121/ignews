import style from "./home.module.scss";

import Head from "next/head";
import { SubscribeButton } from "../components/SubscribeButton";
import { GetServerSideProps } from "next";
import { stripe } from "../services/stripe";

interface HomeProps {
  product:{
    priceId: string,
    amount:number
  }
}
export default function Home({product}:HomeProps) {

  return (
    <>
      <Head>
        <title>Home | Ig news</title>
      </Head>
      <main className={style.contentContainer}>
        <section className={style.hero}>
          <span>👏 Hey, Welcome</span>

          <h1>
            News about the <span>React</span> world.{" "}
          </h1>
          <p>
            Get access to all the publictions <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId}/>
        </section>

        <img src="/images/avatar.svg" alt=" Girl Coding" />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const price = await stripe.prices.retrieve("price_1IxdFZJCB9W3nhHIsl4nHIJ1", {
    expand: ["product"],
  });
  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US',{
      style:'currency',
      currency:'USD'
    }).format(price.unit_amount / 100),

  };
  return {
    props: {
     product
    },
  };
};