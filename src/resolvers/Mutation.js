import bcrypt from "bcryptjs";

import { getUserId, generateToken, hashPassword } from "../utils";

const Mutation = {
  async signin(parent, args, { prisma }, info) {
    const user = await prisma.query.user({
      where: {
        email: args.data.email
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(args.data.password, user.password);

    if (!isMatch) {
      throw new Error("Wrong password");
    }

    return {
      user,
      token: generateToken(user.id)
    };
  },
  async createUser(parent, args, { prisma }, info) {
    const password = await hashPassword(args.data.password);

    const user = await prisma.mutation.createUser({
      data: {
        ...args.data,
        password
      }
    });

    return {
      user,
      token: generateToken(user.id)
    };
  },
  async deleteUser(parent, args, { prisma, req }, info) {
    const userId = getUserId(req);
    return prisma.mutation.deleteUser({ where: { id: userId } }, info);
  },
  async updateUser(parent, { data }, { prisma, req }, info) {
    const userId = getUserId(req);

    if (typeof data.password === "string") {
      data.password = await hashPassword(data.password);
    }

    return prisma.mutation.updateUser(
      {
        where: {
          id: userId
        },
        data: data
      },
      info
    );
  },
  async createPost(parent, args, { prisma, req }, info) {
    const userId = getUserId(req);

    return prisma.mutation.createPost(
      {
        data: {
          title: args.data.title,
          body: args.data.body,
          published: args.data.published,
          author: { connect: { id: userId } }
        }
      },
      info
    );
  },
  async deletePost(parent, { id }, { prisma, req }, info) {
    const userId = getUserId(req);

    const postExists = await prisma.exists.Post({
      id,
      author: {
        id: userId
      }
    });

    if (!postExists) {
      throw new Error("Unable to delete Post");
    }

    return prisma.mutation.deletePost({ where: { id } }, info);
  },
  async updatePost(parent, { id, data }, { prisma, req }, info) {
    const userId = getUserId(req);

    const isPublished = await prisma.exists.Post({
      id,
      published: true
    });

    const postExists = await prisma.exists.Post({
      id: id,
      author: {
        id: userId
      }
    });

    if (!postExists) {
      throw new Error("Unable to update Post");
    }

    if (isPublished && data.published === false) {
      await prisma.mutation.deleteManyComments({
        where: {
          post: {
            id
          }
        }
      });
    }

    return prisma.mutation.updatePost({ where: { id }, data }, info);
  },
  async createComment(parent, args, { prisma, req }, info) {
    const userId = getUserId(req);

    const isPublished = await prisma.exists.Post({
      id: args.data.post,
      published: true
    });

    if (!isPublished) {
      throw new Error("Post not published");
    }

    return prisma.mutation.createComment(
      {
        data: {
          text: args.data.text,
          author: {
            connect: {
              id: userId
            }
          },
          post: {
            connect: {
              id: args.data.post
            }
          }
        }
      },
      info
    );
  },
  async deleteComment(parent, { id }, { prisma, req }, info) {
    const userId = getUserId(req);

    const commentExists = await prisma.exists.Comment({
      id: id,
      author: {
        id: userId
      }
    });

    if (!commentExists) {
      throw new Error("Unable to delete Comment");
    }

    return prisma.mutation.deleteComment({ where: { id } }, info);
  },
  async updateComment(parent, { id, data }, { prisma, req }, info) {
    const userId = getUserId(req);

    const commentExists = await prisma.exists.Comment({
      id: id,
      author: {
        id: userId
      }
    });

    if (!commentExists) {
      throw new Error("Unable to update Comment");
    }

    return prisma.mutation.updateComment({ where: { id }, data }, info);
  }
};

export default Mutation;
