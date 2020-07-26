import { join } from "path";
import { GraphQLServer } from "graphql-yoga";
import * as fs from "fs";
import * as Redis from "ioredis";
import { GraphQLSchema } from "graphql";
import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { addResolversToSchema } from "@graphql-tools/schema";
import { mergeSchemas } from "@graphql-tools/merge";

import { User } from "./entity/User";
import { createTypeormConn } from "./utils/createTypeormConn";

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

  const redis = new Redis();

  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }) as any,
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host"),
    }),
  });

  server.express.get("/confirm/:id", async (req, res) => {
    const { id } = req.params;
    const userId = await redis.get(id);
    if (userId) {
      await User.update({ id: userId }, { confirmed: true });
      res.send("ok");
    } else {
      res.send("invalid");
    }
  });

  await createTypeormConn();
  const app = await server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
  });
  console.log("Server is running on localhost: 4000");

  return app;
};
