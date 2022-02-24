import { NextFunction, Router } from "express";
import passport from "passport";
import { db } from "../app";

export const authRouter = Router();
export async function isAuthenticated(req: any , res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(401);
};

authRouter.get("/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

authRouter.get("/google/callback",
  passport.authenticate("google", { successRedirect: `${process.env.CLIENT_URL}`, failureRedirect: "/login" })
);

authRouter.get("/google/response", async (req: any, res: any) => {  
  console.log("google response: ", req.user);
  if( req.user ) {
    let user = await db.user.findUnique({
      where: {
        id: req.user.id,
      }
    })
    return res.json(user)
  }
  res.send({msg: "usuario no logueado"})
});

authRouter.post<{}, {}>("/local/login", (req, res, next) => {
  passport.authenticate(
    "local",
    { successRedirect: `${process.env.CLIENT_URL}/`, failureRedirect: "/login" },
    (err, user, info) => {
      if (err) throw err;
      if (!user) return res.status(404).send("No user exists");
      else {
        req.login(user, (err) => {
          if (err) throw err;
          return res.send(user) 
        });
      }
    }
  )(req, res, next);
});

authRouter.get("/logout", (req, res) => {
  try {
    req.logout();
  } catch (e) { 
    console.log(e);
  }
  return res.status(200).send("Logout success");
});
