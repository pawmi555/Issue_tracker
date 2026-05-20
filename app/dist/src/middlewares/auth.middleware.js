import jwt from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) {
            return res.status(401).json({
                success: false,
                message: "Token required"
            });
        }
        if (!auth.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Invalid format"
            });
        }
        const token = auth.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (typeof decoded !== "object" ||
            decoded === null ||
            !("userId" in decoded)) {
            throw new Error("Invalid token");
        }
        req.user = {
            userId: Number(decoded.userId)
        };
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};
