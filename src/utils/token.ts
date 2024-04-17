import jwt from 'jsonwebtoken';
import { expressjwt } from 'express-jwt';
import 'dotenv/config';

export const createToken = (uuid: string) => {
  return jwt.sign({ uuid }, process.env.JWT_SECRET || '');
};

export const authenticate = expressjwt({
  secret: process.env.JWT_SECRET || '',
  requestProperty: 'auth',
  algorithms: ['HS256'],
});

export function parseToken(token: string): { uuid?: string } {
  return token
    ? (jwt.verify(token, process.env.JWT_SECRET || '') as { uuid: string })
    : {};
}
