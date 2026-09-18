import { Service } from '../models/Service.js';
import { ServiceRequest } from '../models/ServiceRequest.js';

// Get all services
export async function getServices(_req, res) {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
}

// Get single service
export async function getServiceById(req, res) {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
}

// Create service (admin)
export async function createService(req, res) {
  try {
    const { title, description, icon, features, category, price } = req.body;
    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }
    const service = new Service({ title, description, icon, features, category, price });
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
}

// Update service (admin)
export async function updateService(req, res) {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
}

// Delete service (admin)
export async function deleteService(req, res) {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
}

// Logged-in user: register interest in a service
export async function requestService(req, res) {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    const { name, email, phone, message } = req.body;
    const request = new ServiceRequest({
      service: service._id,
      user: req.user.id,
      name: name || req.user.name,
      email: email || req.user.email,
      phone,
      message
    });
    await request.save();
    res.status(201).json({ message: 'Service request submitted', request });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit service request' });
  }
}

// Logged-in user: my service requests
export async function getMyServiceRequests(req, res) {
  try {
    const requests = await ServiceRequest.find({ user: req.user.id })
      .populate('service', 'title icon')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your service requests' });
  }
}

// Admin: all service requests
export async function getAllServiceRequests(_req, res) {
  try {
    const requests = await ServiceRequest.find()
      .populate('service', 'title icon')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service requests' });
  }
}

// Admin: update a service request's status
export async function updateServiceRequestStatus(req, res) {
  try {
    const { status } = req.body;
    const request = await ServiceRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!request) {
      return res.status(404).json({ error: 'Service request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service request' });
  }
}
