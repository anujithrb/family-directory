"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const client_1 = require("@prisma/client");
const events_repository_1 = require("./events.repository");
const error_middleware_1 = require("../../middleware/error.middleware");
class EventsService {
    repo;
    constructor() {
        this.repo = new events_repository_1.EventsRepository();
    }
    async getEvents(opts) {
        return this.repo.findAll(opts);
    }
    async getEvent(id) {
        const event = await this.repo.findById(id);
        if (!event)
            throw new error_middleware_1.AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
        return event;
    }
    async createEvent(data) {
        if (data.eventType === client_1.EventType.ANNIVERSARY) {
            if (!data.memberIds || data.memberIds.length !== 2) {
                throw new error_middleware_1.AppError(400, 'INVALID_ANNIVERSARY', 'Anniversary events must have exactly 2 members');
            }
        }
        return this.repo.create(data);
    }
    async updateEvent(id, data) {
        await this.getEvent(id);
        return this.repo.update(id, data);
    }
    async deleteEvent(id) {
        await this.getEvent(id);
        return this.repo.delete(id);
    }
}
exports.EventsService = EventsService;
//# sourceMappingURL=events.service.js.map