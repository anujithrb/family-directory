import { Role, PermissionKey } from '@prisma/client';
import { UsersRepository } from './users.repository';
import { AppError } from '../../middleware/error.middleware';

export class UsersService {
  private readonly repo: UsersRepository;

  constructor() {
    this.repo = new UsersRepository();
  }

  async getUsers(page: number, limit: number) {
    return this.repo.findAll(page, limit);
  }

  async getUser(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    return user;
  }

  async updateUserRole(id: string, role: Role) {
    await this.getUser(id);
    return this.repo.updateRole(id, role);
  }

  async setUserActive(id: string, isActive: boolean) {
    await this.getUser(id);
    return this.repo.setActive(id, isActive);
  }

  async grantPermission(userId: string, permissionKey: PermissionKey, grantedBy: string) {
    await this.getUser(userId);
    return this.repo.grantPermission(userId, permissionKey, grantedBy);
  }

  async revokePermission(userId: string, permissionKey: PermissionKey) {
    await this.getUser(userId);
    return this.repo.revokePermission(userId, permissionKey);
  }

  async getUserPermissions(userId: string) {
    await this.getUser(userId);
    return this.repo.getUserPermissions(userId);
  }
}
