// server/middlewares/redirectIfLoggedIn.js

export const redirectIfLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  next();
};
