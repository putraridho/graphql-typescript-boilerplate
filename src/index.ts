import "reflect-metadata";
import { join } from "path";
import { GraphQLServer } from "graphql-yoga";
import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { addResolversToSchema } from "@graphql-tools/schema";
import { resolvers } from "./resolvers";
import { createTypeormConn } from "./utils/createTypeormConn";

const startServer = async () => {
  const schema = addResolversToSchema({
    schema: loadSchemaSync(join(__dirname, "schema.graphql"), {
      loaders: [new GraphQLFileLoader()],
    }),
    resolvers,
  });

  const server = new GraphQLServer({ schema });

  await createTypeormConn();
  await server.start();
  console.log("Server is running on localhost: 4000");
};

startServer();
