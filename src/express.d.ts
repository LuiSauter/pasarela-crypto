declare namespace Express {
  interface Request {
    idUser: string;
    roleUser: string;
    rawBody: string;
  }
}
