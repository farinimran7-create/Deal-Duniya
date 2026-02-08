import { Request, Response, NextFunction } from "express";

export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated() && (req.user as any).isAdmin) {
        return next();
    }
    res.status(403).json({ message: "Forbidden: Admin access required" });
}
