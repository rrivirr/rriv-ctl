import db from "../db/db.ts";

export const getActiveUser = () => {
  const user = getLoggedInUser();
  if (!user) {
    throw new Error("Unexpected error; No user found");
  }
  return user;
};

export const getLoggedInUser = (email?: string) => {
  const {
    activeEmail,
    environment: { name: env },
  } = db.data;

  if (email) {
    const user = db.data[email][env];
    if (Date.now() < user?.expirationTime && user?.accessToken) {
      return { ...user, email };
    }
    return;
  }

  if (activeEmail) {
    const user = db.data[activeEmail][env];
    if (Date.now() < user?.expirationTime && user?.accessToken) {
      return { ...user, email: activeEmail };
    }
  }
};
