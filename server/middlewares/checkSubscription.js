// import User from "./models/auth.js";

export const checkSubscriptionStatus = async (req, res, next) => {
  if (!req.user) return next();

  if (req.user.subscription && req.user.subscriptionExpiresAt) {
    const now = new Date();

    if (now > req.user.subscriptionExpiresAt) {
      // Expired → set to false
      req.user.subscription = false;
      await req.user.save();
    }
  }

  next();
};
