import { extractFragmentReplacements } from "prisma-binding";
import Query from "./Query";
import Subscription from "./Subscription";
import Mutation from "./Mutation";
import User from "./User";
import Post from "./Post";
import Comment from "./Comment";

const resolvers = { Query, Mutation, Subscription, User, Post, Comment };

const fragmentReplacements = extractFragmentReplacements(resolvers);

export { resolvers, fragmentReplacements };
