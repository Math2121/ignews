import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import { fauna } from "../../services/fauna";
import { query as q } from "faunadb";
import { stripe } from "../../services/stripe";
type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    //Pega informações do usuário logado
    const session = await getSession({ req });

    //PEga os dados do usuário cadastrado no banco
    const user = await fauna.query<User>(
      q.Get(q.Match(q.Index("user_by_email"), q.Casefold(session.user.email)))
    );

    let customerId = user.data.stripe_customer_id;
    if (!customerId) {

      //Criando cliente no stripe
      const stripeCostumer = await stripe.customers.create({
        email: session.user.email,
      });
      //Incluindo ID do cliente no usuário no banco de dados
      await fauna.query(
        q.Update(q.Ref(q.Collection("users"), user.ref.id), {
          data: {
            stripe_customer_id: stripeCostumer.id,
          },
        })
      );
      customerId = stripeCostumer.id;
    }

    const StripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [{ price: "price_1IxdFZJCB9W3nhHIsl4nHIJ1", quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_ERROR_URL,
    });

    return res.status(200).json({ sessionId: StripeCheckoutSession.id });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method not allowed");
  }
};
