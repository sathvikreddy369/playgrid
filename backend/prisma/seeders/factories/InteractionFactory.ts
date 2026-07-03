import { faker } from '@faker-js/faker';
import { NotificationType, ReportType, ReportStatus } from '@prisma/client';
import { getRandomPastDate, getDateAfter } from '../utils/time';
import { getRandomElements, getRandomInt } from '../utils/helpers';

export const generateInteractions = (users: any[], matches: any[]) => {
  const messages = [];
  const notifications = [];
  const reports = [];
  const reviews = [];
  const connections = [];

  // Messages (1:1 chat)
  const messageConnections = getRandomInt(20, 50); // Pairs of users talking
  for (let i = 0; i < messageConnections; i++) {
    const u1 = users[Math.floor(Math.random() * users.length)];
    let u2 = users[Math.floor(Math.random() * users.length)];
    while (u1.id === u2.id) {
      u2 = users[Math.floor(Math.random() * users.length)];
    }

    const chatStartTime = getRandomPastDate(6);
    const conversationLength = getRandomInt(3, 10);
    
    for (let j = 0; j < conversationLength; j++) {
      const isU1Sender = j % 2 === 0;
      messages.push({
        id: faker.string.uuid(),
        content: j === 0 ? "Hey, are we still playing tomorrow?" : getRandomElements(["Yes!", "I'm running late.", "Bring the gear.", "See you there!"], 1, 1)[0],
        senderId: isU1Sender ? u1.id : u2.id,
        receiverId: isU1Sender ? u2.id : u1.id,
        isRead: j < conversationLength - 1, // Last message might be unread
        createdAt: new Date(chatStartTime.getTime() + j * 60000) // 1 min apart
      });
    }
  }

  // Notifications (Sample)
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const notifCount = getRandomInt(2, 8);
    for (let j = 0; j < notifCount; j++) {
      notifications.push({
        id: faker.string.uuid(),
        userId: user.id,
        type: NotificationType.SYSTEM_ALERT,
        content: "Welcome to PlayGrid!",
        link: null,
        isRead: Math.random() > 0.2,
        createdAt: getRandomPastDate(2)
      });
    }
  }

  // Reports (Small percentage)
  const reportCount = Math.floor(users.length * 0.05); // 5% reports
  for (let i = 0; i < reportCount; i++) {
    const submitter = users[Math.floor(Math.random() * users.length)];
    const target = users[Math.floor(Math.random() * users.length)];
    if (submitter.id === target.id) continue;

    reports.push({
      id: faker.string.uuid(),
      submitterId: submitter.id,
      targetType: ReportType.USER,
      targetId: target.id,
      reason: "No show for the match.",
      status: ReportStatus.PENDING,
      createdAt: getRandomPastDate(1),
      updatedAt: getRandomPastDate(1)
    });
  }

  // Reviews (5% of pairs)
  for (let i = 0; i < reportCount; i++) {
    const reviewer = users[Math.floor(Math.random() * users.length)];
    const target = users[Math.floor(Math.random() * users.length)];
    if (reviewer.id === target.id) continue;
    
    reviews.push({
      id: faker.string.uuid(),
      reviewerId: reviewer.id,
      targetId: target.id,
      rating: getRandomInt(3, 5),
      comment: faker.lorem.sentence(),
      createdAt: getRandomPastDate(3)
    });
  }

  // Connections
  for (let i = 0; i < messageConnections; i++) {
    const u1 = users[Math.floor(Math.random() * users.length)];
    let u2 = users[Math.floor(Math.random() * users.length)];
    while (u1.id === u2.id) {
      u2 = users[Math.floor(Math.random() * users.length)];
    }
    
    connections.push({
      id: faker.string.uuid(),
      requesterId: u1.id,
      recipientId: u2.id,
      status: 'ACCEPTED',
      createdAt: getRandomPastDate(3)
    });
  }

  return { messages, notifications, reports, reviews, connections };
};
