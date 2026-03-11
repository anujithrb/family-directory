"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipsController = void 0;
const zod_1 = require("zod");
const relationships_service_1 = require("./relationships.service");
const client_1 = require("@prisma/client");
const createRelSchema = zod_1.z.object({
    fromMemberId: zod_1.z.string().cuid(),
    toMemberId: zod_1.z.string().cuid(),
    type: zod_1.z.nativeEnum(client_1.RelationshipType),
    startDate: zod_1.z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
    endDate: zod_1.z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
});
class RelationshipsController {
    service;
    constructor() {
        this.service = new relationships_service_1.RelationshipsService();
    }
    getRelationships = async (req, res, next) => {
        try {
            const rels = await this.service.getRelationships(req.params.memberId);
            res.json({ data: rels });
        }
        catch (err) {
            next(err);
        }
    };
    addRelationship = async (req, res, next) => {
        try {
            const data = createRelSchema.parse(req.body);
            const rel = await this.service.addRelationship(data);
            res.status(201).json({ data: rel });
        }
        catch (err) {
            next(err);
        }
    };
    removeRelationship = async (req, res, next) => {
        try {
            await this.service.removeRelationship(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    };
}
exports.RelationshipsController = RelationshipsController;
//# sourceMappingURL=relationships.controller.js.map