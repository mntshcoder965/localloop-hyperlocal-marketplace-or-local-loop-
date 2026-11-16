import { Request, Response, NextFunction } from 'express';
import { locationsService } from './locations.service.js';

export const locationsController = {
  async getByPincode(req: Request, res: Response, next: NextFunction) {
    try {
      const { pincode } = req.params;
      const record = await locationsService.resolvePincode(pincode);
      if (!record) {
        res.status(404).json({ success: false, message: 'Pincode not found' });
        return;
      }
      res.json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  },

  async reverse(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      if (isNaN(lat) || isNaN(lon)) {
        res.status(400).json({ success: false, message: 'Valid lat and lon query parameters required' });
        return;
      }
      const data = await locationsService.reverseGeocode(lat, lon);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  getPopularHubs(req: Request, res: Response) {
    const hubs = locationsService.listPopularHubs();
    res.json({ success: true, data: hubs });
  },
};

