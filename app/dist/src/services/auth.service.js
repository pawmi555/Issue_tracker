import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
const createAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};
const createRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};
const toSafeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email
});
export const register = async (name, email, password) => {
    const exists = await prisma.user.findUnique({
        where: { email }
    });
    if (exists) {
        throw new Error("Email already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash: hashedPassword
        }
    });
    return {
        user: toSafeUser(user)
    };
};
export const login = async (email, password) => {
    const user = await prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        throw new Error("Invalid credentials");
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        throw new Error("Invalid credentials");
    }
    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);
    return {
        user: toSafeUser(user),
        accessToken,
        refreshToken
    };
};
export const refreshToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error("Refresh token required");
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (!decoded.userId) {
        throw new Error("Invalid refresh token");
    }
    const accessToken = createAccessToken(Number(decoded.userId));
    return {
        accessToken
    };
};
