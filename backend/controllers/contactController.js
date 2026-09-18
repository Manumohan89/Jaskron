import { Contact } from '../models/Contact.js';
import { User } from '../models/User.js';
import { sendMail, contactAdminNotifyEmail } from '../utils/email.js';
import { notifyUser } from '../utils/notify.js';

// Admin: list contacts — search + pagination (10 per page)
export async function getContacts(req, res) {
  try {
    const { search, page, limit } = req.query;
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { subject: { $regex: search, $options: 'i' } }
          ]
        }
      : {};
    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
      Contact.countDocuments(filter)
    ]);
    res.json({ contacts, total, page: p, pages: Math.ceil(total / l) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
}

// Get single contact
export async function getContactById(req, res) {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
}

// Create contact (submit form) — public
export async function createContact(req, res) {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }
    const contact = new Contact({ name, email, subject, message });
    await contact.save();

    const admins = await User.find({ role: 'admin' });
    await Promise.all(admins.map((admin) => Promise.all([
      sendMail({ to: admin.email, subject: `New contact form: ${subject}`, html: contactAdminNotifyEmail(contact) }),
      notifyUser(admin._id, {
        title: 'New contact form submission',
        message: `${name} sent a message: "${subject}"`,
        type: 'contact',
        link: '/admin?tab=contacts'
      })
    ])));

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
}

// Update contact status
export async function updateContactStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['new', 'read', 'responded'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
}

// Delete contact
export async function deleteContact(req, res) {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
}
