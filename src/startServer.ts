import { join } from "path";
import { GraphQLServer } from "graphql-yoga";
import * as fs from "fs";
// import { importSchema } from "graphql-import";
// import { mergeSchemas, makeExecutableSchema } from "graphql-tools";
import { createTypeormConn } from "./utils/createTypeormConn";
import { GraphQLSchema } from "graphql";
import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { addResolversToSchema } from "@graphql-tools/schema";
import { mergeSchemas } from "@graphql-tools/merge";

export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(join(__dirname, "./modules"));
  folders.forEach((folder) => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const schema = loadSchemaSync(
      join(__dirname, `./modules/${folder}/schema.graphql`),
      {
        loaders: [new GraphQLFileLoader()],
      }
    );
    schemas.push(addResolversToSchema({ schema, resolvers }));
  });

  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }) as any,
  });

  await createTypeormConn();
  const app = await server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
  });
  console.log("Server is running on localhost: 4000");

  return app;
};
