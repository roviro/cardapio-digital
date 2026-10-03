import { Request, Response } from "express";
import { storeService } from "../services/storeService";

export const settingsController = {
  getSettings(req: Request, res: Response) {
    try {
      const settings = storeService.getAll();
      return res.json(settings);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  updateSettings(req: Request, res: Response) {
    try {
      const data = req.body;
      storeService.setMany(data);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};
