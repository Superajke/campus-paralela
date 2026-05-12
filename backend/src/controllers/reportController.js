import { buildInventoryReport } from "../services/reportService.js";

export async function inventory(_req, res, next) {
  try {
    res.json(await buildInventoryReport());
  } catch (error) {
    next(error);
  }
}
