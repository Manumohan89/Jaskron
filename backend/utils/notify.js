import { Notification } from '../models/Notification.js';
import { emitToUser } from './socket.js';

// Creates a DB notification AND pushes it live via socket.io if the user is online.
export async function notifyUser(userId, { title, message, type = 'system', link }) {
  const notification = await Notification.create({ user: userId, title, message, type, link });
  emitToUser(userId, 'notification', notification);
  return notification;
}
