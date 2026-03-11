"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyMembersController = void 0;
const zod_1 = require("zod");
const family_members_service_1 = require("./family-members.service");
const client_1 = require("@prisma/client");
const createMemberSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    dateOfBirth: zod_1.z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
    dateOfDeath: zod_1.z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
    gender: zod_1.z.nativeEnum(client_1.Gender),
    bio: zod_1.z.string().optional(),
    isLiving: zod_1.z.boolean().optional(),
});
class FamilyMembersController {
    service;
    constructor() {
        this.service = new family_members_service_1.FamilyMembersService();
    }
    getMembers = async (req, res, next) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const search = req.query.search;
            const isLiving = req.query.isLiving !== undefined ? req.query.isLiving === 'true' : undefined;
            const result = await this.service.getMembers({ search, isLiving, page, limit });
            res.json({ data: result });
        }
        catch (err) {
            next(err);
        }
    };
    getMember = async (req, res, next) => {
        try {
            const member = await this.service.getMember(req.params.id);
            res.json({ data: member });
        }
        catch (err) {
            next(err);
        }
    };
    createMember = async (req, res, next) => {
        try {
            const user = req.user;
            const data = createMemberSchema.parse(req.body);
            const member = await this.service.createMember(data, {
                id: user.sub,
                role: user.role,
                familyMemberId: user.familyMemberId,
            });
            res.status(201).json({ data: member });
        }
        catch (err) {
            next(err);
        }
    };
    updateMember = async (req, res, next) => {
        try {
            const user = req.user;
            const data = createMemberSchema.partial().parse(req.body);
            const member = await this.service.updateMember(req.params.id, data, {
                id: user.sub,
                role: user.role,
                familyMemberId: user.familyMemberId,
            });
            res.json({ data: member });
        }
        catch (err) {
            next(err);
        }
    };
    deleteMember = async (req, res, next) => {
        try {
            await this.service.deleteMember(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    };
    uploadPhoto = async (req, res, next) => {
        try {
            const user = req.user;
            if (!req.file) {
                res.status(400).json({ error: { code: 'NO_FILE', message: 'No file uploaded' } });
                return;
            }
            const photoUrl = `/api/files/${req.file.filename}`;
            const member = await this.service.updatePhoto(req.params.id, photoUrl, {
                id: user.sub,
                role: user.role,
                familyMemberId: user.familyMemberId,
            });
            res.json({ data: member });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.FamilyMembersController = FamilyMembersController;
//# sourceMappingURL=family-members.controller.js.map