import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

//recebe as requisições do webhooks
async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

//Desabilita o entendimento do next sobre como ele recebe as requisições, por causa do stream
export const config = {
  api: {
    bodyParser: false,
  },
};
const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const secret = req.headers["stripe-signature"];

    //recebe os eventos do webhook
    let event: Stripe.Event;
    try {
      //vai chegar a chave da API de assinatura
      event = stripe.webhooks.constructEvent(
        buf,
        secret,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      return res.status(400).send(`WEBHOOK ERROR: ${error.message}`);
    }

    const { type } = event;

    //Pegando determinado evento no webhook
    if (relevantEvents.has(type)) {
      try {
        switch (type) {
          case "customer.subscription.updated":
          case "customer.subscription.deleted":
            const subscription = event.data.object as Stripe.Subscription
            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              false
            );
            break;
          case "checkout.session.completed":
            //pega os dados do evento
            const checkoutSession = event.data
              .object as Stripe.Checkout.Session;

            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            );
            break;

          default:
            throw new Error("Unhandled event");
            break;
        }
      } catch (error) {
        return res.json({ error: "Webhook handler event" });
      }
    }

    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
};
