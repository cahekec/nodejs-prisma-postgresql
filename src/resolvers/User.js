import { getUserId } from "../utils";

const User = {
  posts(parent, args, { prisma, req }, info) {
    return parent.posts.filter(post => post.published);
  },
  email: {
    fragment: "fragment userId on User { id }",
    resolve(parent, args, { prisma, req }, info) {
      const userId = getUserId(req, false);

      if (userId && userId === parent.id) {
        return parent.email;
      } else {
        return null;
      }
    }
  }
};

export default User;
