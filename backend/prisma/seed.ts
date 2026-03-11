import { PrismaClient, Gender, Role, RelationshipType, EventType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Generation 1 (grandparents)
  const grandfather = await prisma.familyMember.create({
    data: {
      firstName: 'Robert',
      lastName: 'Johnson',
      dateOfBirth: new Date('1940-03-15'),
      dateOfDeath: new Date('2010-11-20'),
      gender: Gender.MALE,
      bio: 'Family patriarch. Beloved grandfather.',
      isLiving: false,
    },
  });

  const grandmother = await prisma.familyMember.create({
    data: {
      firstName: 'Margaret',
      lastName: 'Johnson',
      dateOfBirth: new Date('1943-07-22'),
      gender: Gender.FEMALE,
      bio: 'Family matriarch. Great cook.',
      isLiving: true,
    },
  });

  // Gen 2 - Children of grandparents (sibling pair 1)
  const father1 = await prisma.familyMember.create({
    data: {
      firstName: 'James',
      lastName: 'Johnson',
      dateOfBirth: new Date('1965-05-10'),
      gender: Gender.MALE,
      isLiving: true,
    },
  });

  const uncle1 = await prisma.familyMember.create({
    data: {
      firstName: 'David',
      lastName: 'Johnson',
      dateOfBirth: new Date('1968-09-14'),
      gender: Gender.MALE,
      isLiving: true,
    },
  });

  // Spouses
  const mother1 = await prisma.familyMember.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      dateOfBirth: new Date('1967-02-28'),
      gender: Gender.FEMALE,
      isLiving: true,
    },
  });

  const aunt1 = await prisma.familyMember.create({
    data: {
      firstName: 'Linda',
      lastName: 'Johnson',
      dateOfBirth: new Date('1970-12-05'),
      gender: Gender.FEMALE,
      isLiving: true,
    },
  });

  // Gen 3 - Children (sibling pair 2)
  const child1 = await prisma.familyMember.create({
    data: {
      firstName: 'Emily',
      lastName: 'Johnson',
      dateOfBirth: new Date('1990-04-18'),
      gender: Gender.FEMALE,
      isLiving: true,
    },
  });

  const child2 = await prisma.familyMember.create({
    data: {
      firstName: 'Michael',
      lastName: 'Johnson',
      dateOfBirth: new Date('1992-08-25'),
      gender: Gender.MALE,
      isLiving: true,
    },
  });

  const child3 = await prisma.familyMember.create({
    data: {
      firstName: 'Sophie',
      lastName: 'Johnson',
      dateOfBirth: new Date('1995-01-12'),
      gender: Gender.FEMALE,
      isLiving: true,
    },
  });

  console.log('Family members created');

  // Create Users
  const adminMember = await prisma.familyMember.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      dateOfBirth: new Date('1985-06-15'),
      gender: Gender.MALE,
      isLiving: true,
    },
  });

  const regularMember = father1;
  const readonlyMember = child1;

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@family.local',
      passwordHash: await bcrypt.hash('Admin@123', 12),
      role: Role.ADMIN,
      familyMemberId: adminMember.id,
      isActive: true,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'james@family.local',
      passwordHash: await bcrypt.hash('User@123', 12),
      role: Role.USER,
      familyMemberId: regularMember.id,
      isActive: true,
    },
  });

  const readonlyUser = await prisma.user.create({
    data: {
      email: 'emily@family.local',
      passwordHash: await bcrypt.hash('ReadOnly@123', 12),
      role: Role.READ_ONLY,
      familyMemberId: readonlyMember.id,
      isActive: true,
    },
  });

  // Grant CAN_ADD_RELATIVES to regular user
  await prisma.userPermission.create({
    data: {
      userId: regularUser.id,
      permissionKey: 'CAN_ADD_RELATIVES',
      grantedBy: adminUser.id,
    },
  });

  console.log('Users created');

  // Relationships - Gen 1
  await prisma.relationship.createMany({
    data: [
      // Grandparents marriage
      { fromMemberId: grandfather.id, toMemberId: grandmother.id, type: RelationshipType.SPOUSE_OF, startDate: new Date('1962-06-10') },
      { fromMemberId: grandmother.id, toMemberId: grandfather.id, type: RelationshipType.SPOUSE_OF, startDate: new Date('1962-06-10') },
      // Grandparents -> children
      { fromMemberId: grandfather.id, toMemberId: father1.id, type: RelationshipType.PARENT_OF },
      { fromMemberId: grandmother.id, toMemberId: father1.id, type: RelationshipType.PARENT_OF },
      { fromMemberId: grandfather.id, toMemberId: uncle1.id, type: RelationshipType.PARENT_OF },
      { fromMemberId: grandmother.id, toMemberId: uncle1.id, type: RelationshipType.PARENT_OF },
      // Sibling pair 1
      { fromMemberId: father1.id, toMemberId: uncle1.id, type: RelationshipType.SIBLING_OF },
      { fromMemberId: uncle1.id, toMemberId: father1.id, type: RelationshipType.SIBLING_OF },
      // Gen 2 marriages
      { fromMemberId: father1.id, toMemberId: mother1.id, type: RelationshipType.SPOUSE_OF, startDate: new Date('1989-08-20') },
      { fromMemberId: mother1.id, toMemberId: father1.id, type: RelationshipType.SPOUSE_OF, startDate: new Date('1989-08-20') },
      { fromMemberId: uncle1.id, toMemberId: aunt1.id, type: RelationshipType.SPOUSE_OF, startDate: new Date('1993-04-15') },
      { fromMemberId: aunt1.id, toMemberId: uncle1.id, type: RelationshipType.SPOUSE_OF, startDate: new Date('1993-04-15') },
      // Gen 2 -> Gen 3
      { fromMemberId: father1.id, toMemberId: child1.id, type: RelationshipType.PARENT_OF },
      { fromMemberId: mother1.id, toMemberId: child1.id, type: RelationshipType.PARENT_OF },
      { fromMemberId: father1.id, toMemberId: child2.id, type: RelationshipType.PARENT_OF },
      { fromMemberId: mother1.id, toMemberId: child2.id, type: RelationshipType.PARENT_OF },
      // Sibling pair 2
      { fromMemberId: child1.id, toMemberId: child2.id, type: RelationshipType.SIBLING_OF },
      { fromMemberId: child2.id, toMemberId: child1.id, type: RelationshipType.SIBLING_OF },
    ],
  });

  // Child3 from uncle/aunt
  await prisma.relationship.createMany({
    data: [
      { fromMemberId: uncle1.id, toMemberId: child3.id, type: RelationshipType.PARENT_OF },
      { fromMemberId: aunt1.id, toMemberId: child3.id, type: RelationshipType.PARENT_OF },
    ],
  });

  console.log('Relationships created');

  // Events - Birthday events
  const birthdayEvents = [grandfather, grandmother, father1, mother1, uncle1, aunt1, child1, child2, child3];
  for (const member of birthdayEvents) {
    if (member.dateOfBirth) {
      const event = await prisma.event.create({
        data: {
          title: `${member.firstName}'s Birthday`,
          eventType: EventType.BIRTHDAY,
          date: member.dateOfBirth,
          recurrenceRule: 'RRULE:FREQ=YEARLY',
          description: `Birthday of ${member.firstName} ${member.lastName}`,
        },
      });
      await prisma.eventMember.create({
        data: { eventId: event.id, familyMemberId: member.id },
      });
    }
  }

  // Anniversary events (2)
  const anniversary1 = await prisma.event.create({
    data: {
      title: 'Robert & Margaret\'s Anniversary',
      eventType: EventType.ANNIVERSARY,
      date: new Date('1962-06-10'),
      recurrenceRule: 'RRULE:FREQ=YEARLY',
      description: '50+ years of love',
    },
  });
  await prisma.eventMember.createMany({
    data: [
      { eventId: anniversary1.id, familyMemberId: grandfather.id },
      { eventId: anniversary1.id, familyMemberId: grandmother.id },
    ],
  });

  const anniversary2 = await prisma.event.create({
    data: {
      title: 'James & Sarah\'s Anniversary',
      eventType: EventType.ANNIVERSARY,
      date: new Date('1989-08-20'),
      recurrenceRule: 'RRULE:FREQ=YEARLY',
      description: 'Celebrating another year together',
    },
  });
  await prisma.eventMember.createMany({
    data: [
      { eventId: anniversary2.id, familyMemberId: father1.id },
      { eventId: anniversary2.id, familyMemberId: mother1.id },
    ],
  });

  // Custom events (5)
  const customEventsData = [
    { title: 'Family Reunion 2024', date: new Date('2024-07-04'), description: 'Annual family gathering at grandma\'s place' },
    { title: 'Christmas Celebration', date: new Date('2024-12-25'), recurrenceRule: 'RRULE:FREQ=YEARLY', description: 'Family Christmas dinner' },
    { title: 'Thanksgiving Dinner', date: new Date('2024-11-28'), recurrenceRule: 'RRULE:FREQ=YEARLY', description: 'Annual Thanksgiving feast' },
    { title: 'Emily\'s Graduation Party', date: new Date('2012-05-20'), description: 'Celebrating Emily\'s college graduation' },
    { title: 'New Year Party 2025', date: new Date('2025-01-01'), description: 'Welcoming 2025 together' },
  ];

  for (const eventData of customEventsData) {
    await prisma.event.create({
      data: {
        title: eventData.title,
        eventType: EventType.CUSTOM,
        date: eventData.date,
        recurrenceRule: eventData.recurrenceRule,
        description: eventData.description,
      },
    });
  }

  console.log('Events created');
  console.log('Seed completed successfully!');
  console.log('\nTest credentials:');
  console.log('  Admin:    admin@family.local  / Admin@123');
  console.log('  User:     james@family.local  / User@123');
  console.log('  Readonly: emily@family.local  / ReadOnly@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
