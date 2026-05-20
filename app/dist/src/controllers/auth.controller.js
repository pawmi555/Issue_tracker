import * as authService from "../services/auth.service.js";
import * as userService from "../services/user.service.js";
export const me = async (req, res) => {
    console.log(req.user);
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    const userId = req.user.userId;
    const user = await userService.getUserById(userId);
    console.log(req.headers.authorization);
    res.json({
        success: true,
        data: user
    });
};
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await authService.register(name, email, password);
        res.status(201).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};
export const logout = async (req, res) => {
    res.json({
        success: true,
        message: "Logged out"
    });
};
export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const accessToken = await authService.refreshToken(refreshToken);
        return res.json({
            success: true,
            data: { accessToken }
        });
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
};
