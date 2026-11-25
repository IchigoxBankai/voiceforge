import { usageService } from '../services/usage.service.js';

export const getUsage = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const usage = await usageService.getUserUsage(userId);

    res.json({
      success: true,
      usage
    });
  } catch (err) {
    next(err);
  }
};

