import { join } from "path";
import { GraphQLServer } from "graphql-yoga";
import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { addResolversToSchema } from "@graphql-tools/schema";
import { resolvers } from "./resolvers";
import { createTypeormConn } from "./utils/createTypeormConn";

export const startServer = async () => {
  const schema = addResolversToSchema({
    schema: loadSchemaSync(join(__dirname, "schema.graphql"), {
      loaders: [new GraphQLFileLoader()],
    }),
    resolvers,
  });

  const server = new GraphQLServer({ schema });

  await createTypeormConn();
  const app = await server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
  });
  console.log("Server is running on localhost: 4000");

  return app;
};
