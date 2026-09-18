import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { getTeamMembers, getTeamMemberById, createTeamMember, updateTeamMember, deleteTeamMember } from '../controllers/teamController.js';
const router = Router();
router.get('/', getTeamMembers);
router.get('/:id', getTeamMemberById);
// Writes were previously wide open with no auth check — anyone could add,
// edit, or delete team member profiles. Locked to admins only.
router.post('/', authenticate, requireAdmin, createTeamMember);
router.put('/:id', authenticate, requireAdmin, updateTeamMember);
router.delete('/:id', authenticate, requireAdmin, deleteTeamMember);
export default router;
