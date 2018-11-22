import jwt from 'jsonwebtoken';
import { sendError } from '../lib/validations';
import { SECRET } from '../config/jwt';

export default function (req, res, next) {
  const token = req.headers['x-access-token'];

  if (!token) {
    sendError(res, 400, 'token not found');
    return;
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      switch (err.name) {
        case 'JsonWebTokenError':
          sendError(res, 403, 'token not valid');
          break;
        case 'TokenExpiredError':
          sendError(res, 403, 'token has expired');
          break;
        default:
          sendError(res, 403, 'token error');
          break;
      }
    } else {
      // attach user object to the request
      req.user = user;
      next();
    }
  });
}
