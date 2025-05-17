import * as bcrypt from "bcrypt";

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const compareToken = async (token: string, hasedToken: string): Promise<boolean> => {
  return await bcrypt.compare(token, hasedToken);
};

export const formatResponse = (message: string, data: any = null) => {
  return { message, data };
};

export const getCurrentYear = () => {
  const date = new Date();
  return date.getFullYear();
}
