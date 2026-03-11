import { EventType } from '@prisma/client';
import { EventsRepository, CreateEventDto } from './events.repository';
import { AppError } from '../../middleware/error.middleware';

export class EventsService {
  private readonly repo: EventsRepository;

  constructor() {
    this.repo = new EventsRepository();
  }

  async getEvents(opts: { eventType?: EventType; page: number; limit: number; month?: number; year?: number }) {
    return this.repo.findAll(opts);
  }

  async getEvent(id: string) {
    const event = await this.repo.findById(id);
    if (!event) throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
    return event;
  }

  async createEvent(data: CreateEventDto) {
    if (data.eventType === EventType.ANNIVERSARY) {
      if (!data.memberIds || data.memberIds.length !== 2) {
        throw new AppError(400, 'INVALID_ANNIVERSARY', 'Anniversary events must have exactly 2 members');
      }
    }
    return this.repo.create(data);
  }

  async updateEvent(id: string, data: Partial<CreateEventDto>) {
    await this.getEvent(id);
    return this.repo.update(id, data);
  }

  async deleteEvent(id: string) {
    await this.getEvent(id);
    return this.repo.delete(id);
  }
}
