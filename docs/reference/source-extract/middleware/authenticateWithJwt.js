//server/src/middleware/AuthenticateWithJwt.js

require("dotenv").config();
const jwt = require("jsonwebtoken");

const AUTH_ERROR_CODES = {
  AUTH_REQUIRED: "AUTH_REQUIRED",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
};

const sendAuthError = (res, code, message) => {
  return res.status(401).json({
    error: {
      message,
      code,
    },
  });
};

const authenticateWithJwt = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return sendAuthError(
      res,
      AUTH_ERROR_CODES.AUTH_REQUIRED,
      "Not authenticated"
    );
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    console.log(
      `JWT verification failed at URL ${req.url}`,
      err.name,
      err.message
    );

    if (err.name === "TokenExpiredError") {
      return sendAuthError(
        res,
        AUTH_ERROR_CODES.TOKEN_EXPIRED,
        "Session has expired"
      );
    }

    return sendAuthError(
      res,
      AUTH_ERROR_CODES.TOKEN_INVALID,
      "Invalid or malformed token"
    );
  }
};

module.exports = authenticateWithJwt;
