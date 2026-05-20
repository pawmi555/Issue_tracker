import { prisma } from "../lib/prisma.js";
export const adminMiddleware = async (req, res, next) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user?.userId }
    });
    if (!user || user.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Forbidden"
        });
    }
    next();
};
