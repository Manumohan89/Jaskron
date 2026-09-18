import { TeamMember } from '../models/TeamMember.js';

// Get all team members
export async function getTeamMembers(_req, res) {
  try {
    const members = await TeamMember.find().sort({
      createdAt: -1
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch team members'
    });
  }
}

// Get single team member
export async function getTeamMemberById(req, res) {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      res.status(404).json({
        error: 'Team member not found'
      });
      return;
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch team member'
    });
  }
}

// Create team member
export async function createTeamMember(req, res) {
  try {
    const {
      name,
      title,
      bio,
      image,
      social
    } = req.body;
    if (!name || !title || !bio) {
      res.status(400).json({
        error: 'Name, title, and bio are required'
      });
      return;
    }
    const member = new TeamMember({
      name,
      title,
      bio,
      image,
      social
    });
    await member.save();
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create team member'
    });
  }
}

// Update team member
export async function updateTeamMember(req, res) {
  try {
    const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!member) {
      res.status(404).json({
        error: 'Team member not found'
      });
      return;
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update team member'
    });
  }
}

// Delete team member
export async function deleteTeamMember(req, res) {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) {
      res.status(404).json({
        error: 'Team member not found'
      });
      return;
    }
    res.json({
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete team member'
    });
  }
}