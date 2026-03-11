"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const users_repository_1 = require("./users.repository");
const error_middleware_1 = require("../../middleware/error.middleware");
class UsersService {
    repo;
    constructor() {
        this.repo = new users_repository_1.UsersRepository();
    }
    async getUsers(page, limit) {
        return this.repo.findAll(page, limit);
    }
    async getUser(id) {
        const user = await this.repo.findById(id);
        if (!user)
            throw new error_middleware_1.AppError(404, 'USER_NOT_FOUND', 'User not found');
        return user;
    }
    async updateUserRole(id, role) {
        await this.getUser(id);
        return this.repo.updateRole(id, role);
    }
    async setUserActive(id, isActive) {
        await this.getUser(id);
        return this.repo.setActive(id, isActive);
    }
    async grantPermission(userId, permissionKey, grantedBy) {
        await this.getUser(userId);
        return this.repo.grantPermission(userId, permissionKey, grantedBy);
    }
    async revokePermission(userId, permissionKey) {
        await this.getUser(userId);
        return this.repo.revokePermission(userId, permissionKey);
    }
    async getUserPermissions(userId) {
        await this.getUser(userId);
        return this.repo.getUserPermissions(userId);
    }
}
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map