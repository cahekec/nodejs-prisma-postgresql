import "@babel/polyfill";
import { GraphQLServer, PubSub } from "graphql-yoga";

import { resolvers, fragmentReplacements } from "./resolvers";
import prisma from "./prisma";

const pubsub = new PubSub();

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context(req) {
    return {
      prisma,
      req
    };
  },
  fragmentReplacements
});

server.start({ port: process.env.PORT || 4000 }, () => {
  console.log("The server is up");
});
