import { Request, Response } from 'express';

export const uploadImage = async (req: Request, res: Response) => {
  res.json({ url: "https://via.placeholder.com/150" });
};
