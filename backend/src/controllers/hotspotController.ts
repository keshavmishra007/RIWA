import { Request, Response } from 'express';
import { db } from '../db/store.js';

export const getHotspots = async (_req: Request, res: Response): Promise<void> => {
  try {
    const hotspots = await db.getHotspots();
    res.json(hotspots);
  } catch (error) {
    console.error('Get hotspots error:', error);
    res.status(500).json({ error: 'Failed to retrieve hotspots.' });
  }
};
