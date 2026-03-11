"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const zod_1 = require("zod");
const users_service_1 = require("./users.service");
const client_1 = require("@prisma/client");
const updateRoleSchema = zod_1.z.object({ role: zod_1.z.nativeEnum(client_1.Role) });
const permissionSchema = zod_1.z.object({ permissionKey: zod_1.z.nativeEnum(client_1.PermissionKey) });
class UsersController {
    service;
    constructor() {
        this.service = new users_service_1.UsersService();
    }
    getUsers = async (req, res, next) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const result = await this.service.getUsers(page, limit);
            res.json({ data: result });
        }
        catch (err) {
            next(err);
        }
    };
    getUser = async (req, res, next) => {
        try {
            const user = await this.service.getUser(req.params.id);
            res.json({ data: user });
        }
        catch (err) {
            next(err);
        }
    };
    updateRole = async (req, res, next) => {
        try {
            const { role } = updateRoleSchema.parse(req.body);
            const user = await this.service.updateUserRole(req.params.id, role);
            res.json({ data: user });
        }
        catch (err) {
            next(err);
        }
    };
    setActive = async (req, res, next) => {
        try {
            const { isActive } = zod_1.z.object({ isActive: zod_1.z.boolean() }).parse(req.body);
            const user = await this.service.setUserActive(req.params.id, isActive);
            res.json({ data: user });
        }
        catch (err) {
            next(err);
        }
    };
    grantPermission = async (req, res, next) => {
        try {
            const { permissionKey } = permissionSchema.parse(req.body);
            const perm = await this.service.grantPermission(req.params.id, permissionKey, req.user.sub);
            res.status(201).json({ data: perm });
        }
        catch (err) {
            next(err);
        }
    };
    revokePermission = async (req, res, next) => {
        try {
            const { permissionKey } = permissionSchema.parse(req.body);
            await this.service.revokePermission(req.params.id, permissionKey);
            res.json({ data: { message: 'Permission revoked' } });
        }
        catch (err) {
            next(err);
        }
    };
    getPermissions = async (req, res, next) => {
        try {
            const perms = await this.service.getUserPermissions(req.params.id);
            res.json({ data: perms });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map