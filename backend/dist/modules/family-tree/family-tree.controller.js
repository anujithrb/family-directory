"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyTreeController = void 0;
const family_tree_service_1 = require("./family-tree.service");
class FamilyTreeController {
    service;
    constructor() {
        this.service = new family_tree_service_1.FamilyTreeService();
    }
    getTree = async (_req, res, next) => {
        try {
            const tree = await this.service.getFamilyTree();
            res.json({ data: tree });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.FamilyTreeController = FamilyTreeController;
//# sourceMappingURL=family-tree.controller.js.map