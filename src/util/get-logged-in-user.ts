import db from "../db/db.ts";

export const getActiveUser = () => {
  const user = getLoggedInUser();
  if (!user) {
    throw new Error("Unexpected error; No user found");
  }
  return user;
};

export const getLoggedInUser = (email?: string) => {
  const { activeEmail } = db.data;

  if (email) {
    const user = db.data[email];
    if (Date.now() < user?.expirationTime && user?.accessToken) {
      return { ...user, email };
    }
    return;
  }

  if (activeEmail) {
    const user = db.data[activeEmail];
    if (Date.now() < user?.expirationTime && user?.accessToken) {
      return { ...user, email: activeEmail };
    }
  }
};
