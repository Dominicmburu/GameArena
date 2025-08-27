import bcrypt from "bcryptjs";

export const hash = async (s) => {
  const saltRounds = 12;
  return bcrypt.hash(s, saltRounds);
};

export const compare = async (s, h) => bcrypt.compare(s, h);
