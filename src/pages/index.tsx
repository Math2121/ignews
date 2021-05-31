import style from "./home.module.scss";

import Head from "next/head";
import { SubscribeButton } from "../components/SubscribeButton";
export default function Home() {
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
            <span>for $9.90 month</span>
          </p>
          <SubscribeButton/>
        </section>

        <img src="/images/avatar.svg" alt=" Girl Coding" />
      </main>
    </>
  );
}
