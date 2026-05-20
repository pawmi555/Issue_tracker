import * as userService from "../services/user.service.js";
export const getUsers = async (req, res) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const users = await userService.getUsers(page, limit);
    res.json({
        success: true,
        data: users
    });
};
export const getUserById = async (req, res) => {
    const id = Number(req.params.id);
    const user = await userService.getUserById(id);
    res.json({
        success: true,
        data: user
    });
};
export const updateUser = async (req, res) => {
    const id = Number(req.params.id);
    const { name } = req.body;
    const user = await userService.updateUser(id, name);
    res.json({
        success: true,
        data: user
    });
};
export const deleteUser = async (req, res) => {
    const id = Number(req.params.id);
    await userService.deleteUser(id);
    res.json({
        success: true,
        message: "User deleted"
    });
};
