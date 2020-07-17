const { verify } = require("jsonwebtoken");

module.exports.isAuth = (req, res) => {
  const authorization = req.headers["authorization"];
  if (!authorization) throw new Error("You need to login");
  const token = authorization.split(" ")[1];
  const { userId } = verify(token, process.env.ACCESS_TOKEN_SECRECT);
  return userId;
};
