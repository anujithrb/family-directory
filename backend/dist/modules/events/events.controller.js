"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const zod_1 = require("zod");
const events_service_1 = require("./events.service");
const client_1 = require("@prisma/client");
const createEventSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    eventType: zod_1.z.nativeEnum(client_1.EventType),
    date: zod_1.z.string().datetime().transform((v) => new Date(v)),
    recurrenceRule: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    memberIds: zod_1.z.array(zod_1.z.string()).optional(),
});
class EventsController {
    service;
    constructor() {
        this.service = new events_service_1.EventsService();
    }
    getEvents = async (req, res, next) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 50;
            const eventType = req.query.eventType;
            const month = req.query.month ? Number(req.query.month) : undefined;
            const year = req.query.year ? Number(req.query.year) : undefined;
            const result = await this.service.getEvents({ eventType, page, limit, month, year });
            res.json({ data: result });
        }
        catch (err) {
            next(err);
        }
    };
    getEvent = async (req, res, next) => {
        try {
            const event = await this.service.getEvent(req.params.id);
            res.json({ data: event });
        }
        catch (err) {
            next(err);
        }
    };
    createEvent = async (req, res, next) => {
        try {
            const data = createEventSchema.parse(req.body);
            const event = await this.service.createEvent(data);
            res.status(201).json({ data: event });
        }
        catch (err) {
            next(err);
        }
    };
    updateEvent = async (req, res, next) => {
        try {
            const data = createEventSchema.partial().parse(req.body);
            const event = await this.service.updateEvent(req.params.id, data);
            res.json({ data: event });
        }
        catch (err) {
            next(err);
        }
    };
    deleteEvent = async (req, res, next) => {
        try {
            await this.service.deleteEvent(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    };
}
exports.EventsController = EventsController;
//# sourceMappingURL=events.controller.js.map