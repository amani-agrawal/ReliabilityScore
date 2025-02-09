// findGraphPathsHandler.ts
import { RequestHandler } from "express";
import { findGraphPaths } from "./build-social-graph"; 

/**
 * Expected request body: {
 *   originAddress: string,
 *   targetAddress: string
 * }
 */
export const findGraphPathsHandler: RequestHandler = async (req, res, next) => {
  try {
    const { originAddress, targetAddress } = req.body;
    if (!originAddress || !targetAddress) {
      res.status(400).json({ error: "originAddress and targetAddress are required" });
      return;
    }
    
    const paths = await findGraphPaths(originAddress, targetAddress);

    res.json({ paths });
  } catch (err) {
    next(err);
  }
};
