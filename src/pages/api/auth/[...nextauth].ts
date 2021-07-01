import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { query as query } from "faunadb";
import { fauna } from "../../../services/fauna";
export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: "read:user",
    }),
  ],

  callbacks: {
    async session(session) {
    try {
      const userActiveSubscription = await fauna.query(
        query.Get(
          query.Intersection([
            query.Match(
              query.Index("subscription_by_user_ref"),
              query.Select(
                "ref",
                query.Get(
                  query.Match(
                    query.Index("user_by_email"),
                    query.Casefold(session.user.email)
                  )
                )
              )
            ),
            query.Match(query.Index("subscription_by_status"), "active"),
          ])
        )
      );  
      return {
        ...session,
        activeSubscription: userActiveSubscription,
      };
    } catch (error) {
      return {
        ...session,
        activeSubscription:null
      }
    }
      
    },
    async signIn(user, account, profile) {
      const { email } = user;

      try {
        //VErifica se existe um usuário com determinado e-mail no banco
        await fauna.query(
          query.If(
            query.Not(
              query.Exists(
                query.Match(query.Index("user_by_email"), query.Casefold(email))
              )
            ), //else
            query.Create(query.Collection("users"), { data: { email } }),
            query.Get(
              query.Match(query.Index("user_by_email"), query.Casefold(email))
            )
          )
        );
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
});
