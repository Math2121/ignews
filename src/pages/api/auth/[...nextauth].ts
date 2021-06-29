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
    async signIn(user, account, profile) {
      const { email } = user;
console.log(email)
      try {
        //VErifica se existe um usuário com determinado e-mail no banco
        await fauna.query(
          query.If(
            query.Not(
              query.Exists(
                query.Match(
                  query.Index("user_by_email"),
                  query.Casefold(email)
                )
              )
            ),//else
            query.Create(
              query.Collection("users"), 
              { data: { email } }
            ),
            query.Get(
              query.Match(
                query.Index("user_by_email"),
                query.Casefold(email)
              )
            )
          )
        );
        return true;
      } catch (error) {
        console.log(error)
        return false;
      }
    },
  },
});
