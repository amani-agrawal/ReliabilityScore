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
    
    // Call your findGraphPaths function (which reads from your Parquet file)
    // and returns the computed graph paths.
    const paths = await findGraphPaths(originAddress, targetAddress);
    
    // Send the result as JSON.
    res.json({ paths });
  } catch (err) {
    next(err);
  }
};
