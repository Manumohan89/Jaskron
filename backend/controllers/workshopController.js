import { Workshop } from '../models/Workshop.js';
import { User } from '../models/User.js';
import { sendMail, workshopConfirmationEmail, buildICS } from '../utils/email.js';
import { notifyUser } from '../utils/notify.js';

// Get all workshops
export async function getWorkshops(_req, res) {
  try {
    const workshops = await Workshop.find().sort({ date: 1 });
    res.json(workshops);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workshops' });
  }
}

// Get single workshop
export async function getWorkshopById(req, res) {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      res.status(404).json({ error: 'Workshop not found' });
      return;
    }
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workshop' });
  }
}

// Create workshop (admin)
export async function createWorkshop(req, res) {
  try {
    const { title, description, date, instructor, capacity, level, category, duration } = req.body;
    if (!title || !description || !date || !instructor) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const workshop = new Workshop({
      title,
      description,
      date,
      instructor,
      capacity: capacity || 30,
      level: level || 'Beginner',
      category: category || 'Cybersecurity',
      duration: duration || '2 hours'
    });
    await workshop.save();
    res.status(201).json(workshop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create workshop' });
  }
}

// Update workshop (admin)
export async function updateWorkshop(req, res) {
  try {
    const { registrations, ...updates } = req.body; // never let registrations be overwritten directly
    const workshop = await Workshop.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!workshop) {
      res.status(404).json({ error: 'Workshop not found' });
      return;
    }
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update workshop' });
  }
}

// Delete workshop (admin)
export async function deleteWorkshop(req, res) {
  try {
    const workshop = await Workshop.findByIdAndDelete(req.params.id);
    if (!workshop) {
      res.status(404).json({ error: 'Workshop not found' });
      return;
    }
    res.json({ message: 'Workshop deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete workshop' });
  }
}

// Register for a workshop (logged-in user)
export async function registerForWorkshop(req, res) {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ error: 'Workshop not found' });
    }
    const alreadyRegistered = workshop.registrations.some(
      (r) => r.user?.toString() === req.user.id && r.status !== 'cancelled'
    );
    if (alreadyRegistered) {
      return res.status(400).json({ error: 'You are already registered for this workshop' });
    }
    if (workshop.enrolledCount >= workshop.capacity) {
      return res.status(400).json({ error: 'Workshop is full' });
    }
    workshop.registrations.push({ user: req.user.id });
    workshop.enrolledCount += 1;
    await workshop.save();

    const user = await User.findById(req.user.id);
    if (user) {
      const ics = buildICS(workshop);
      sendMail({
        to: user.email,
        subject: `You're registered: ${workshop.title}`,
        html: workshopConfirmationEmail(user.name, workshop),
        attachments: [{ filename: 'workshop-invite.ics', content: ics, contentType: 'text/calendar' }]
      });
      notifyUser(user._id, {
        title: 'Workshop registration confirmed',
        message: `You're confirmed for "${workshop.title}"`,
        type: 'workshop',
        link: '/dashboard'
      });
    }

    res.json({ message: 'Successfully registered', workshop });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register for workshop' });
  }
}

// Bulk/team registration — a logged-in user books multiple seats at once for
// colleagues who don't need their own accounts. Each seat is tracked as a
// "guest" registration linked back to the booking user via `bookedBy`.
export async function registerTeamForWorkshop(req, res) {
  try {
    const { attendees } = req.body; // [{ name, email }, ...]
    if (!Array.isArray(attendees) || attendees.length === 0) {
      return res.status(400).json({ error: 'Provide at least one attendee (name + email)' });
    }
    if (attendees.length > 50) {
      return res.status(400).json({ error: 'Team registrations are capped at 50 seats at a time' });
    }
    for (const a of attendees) {
      if (!a.name?.trim() || !a.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) {
        return res.status(400).json({ error: 'Every attendee needs a valid name and email' });
      }
    }

    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ error: 'Workshop not found' });

    const seatsAvailable = workshop.capacity - workshop.enrolledCount;
    if (attendees.length > seatsAvailable) {
      return res.status(400).json({ error: `Only ${seatsAvailable} seat(s) left in this workshop` });
    }

    const bookingUser = await User.findById(req.user.id);
    const newRegs = attendees.map((a) => ({
      bookedBy: req.user.id,
      guestName: a.name.trim(),
      guestEmail: a.email.trim().toLowerCase(),
      paymentStatus: workshop.isPaid ? 'pending' : 'not_required'
    }));
    workshop.registrations.push(...newRegs);
    workshop.enrolledCount += attendees.length;
    await workshop.save();

    // Confirmation to each attendee + the person who booked
    const ics = buildICS(workshop);
    await Promise.all(attendees.map((a) => sendMail({
      to: a.email,
      subject: `You're registered: ${workshop.title}`,
      html: workshopConfirmationEmail(a.name, workshop),
      attachments: [{ filename: 'workshop-invite.ics', content: ics, contentType: 'text/calendar' }]
    })));

    if (bookingUser) {
      notifyUser(bookingUser._id, {
        title: 'Team registration confirmed',
        message: `Booked ${attendees.length} seat(s) for "${workshop.title}"`,
        type: 'workshop',
        link: '/dashboard'
      });
    }

    res.json({ message: `${attendees.length} seat(s) booked successfully`, workshop });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete team registration' });
  }
}

// Cancel my registration (logged-in user)
export async function cancelRegistration(req, res) {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ error: 'Workshop not found' });
    }
    const registration = workshop.registrations.find(
      (r) => r.user?.toString() === req.user.id && r.status !== 'cancelled'
    );
    if (!registration) {
      return res.status(400).json({ error: 'You are not registered for this workshop' });
    }
    registration.status = 'cancelled';
    workshop.enrolledCount = Math.max(0, workshop.enrolledCount - 1);
    await workshop.save();
    res.json({ message: 'Registration cancelled', workshop });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel registration' });
  }
}

// Get workshops I'm registered for (logged-in user)
export async function getMyWorkshops(req, res) {
  try {
    const workshops = await Workshop.find({ 'registrations.user': req.user.id }).sort({ date: 1 });
    const result = workshops.map((w) => {
      const myReg = w.registrations.find((r) => r.user.toString() === req.user.id);
      return {
        ...w.toObject(),
        myRegistrationStatus: myReg?.status,
        registeredAt: myReg?.registeredAt
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your workshops' });
  }
}

// Admin: view registrations for a workshop
export async function getWorkshopRegistrations(req, res) {
  try {
    const workshop = await Workshop.findById(req.params.id).populate('registrations.user', 'name email');
    if (!workshop) {
      return res.status(404).json({ error: 'Workshop not found' });
    }
    res.json(workshop.registrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
}

// Admin: update a specific user's registration status (e.g. mark completed)
export async function updateRegistrationStatus(req, res) {
  try {
    const { status } = req.body; // 'registered' | 'attended' | 'completed' | 'cancelled'
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ error: 'Workshop not found' });
    }
    const registration = workshop.registrations.find((r) => r._id.toString() === req.params.regId);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    registration.status = status;
    await workshop.save();
    res.json({ message: 'Registration updated', registration });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update registration' });
  }
}

// Backwards-compatible alias used by older clients
export const enrollWorkshop = registerForWorkshop;
