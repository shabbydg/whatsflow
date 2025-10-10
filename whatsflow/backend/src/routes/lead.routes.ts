import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
const leadController = new LeadController();

// All routes require authentication
router.use(authenticate);

// Lead management
router.get('/', (req, res) => leadController.getLeads(req, res));
router.get('/stats', (req, res) => leadController.getLeadStats(req, res));
router.get('/:id', (req, res) => leadController.getLeadById(req, res));
router.get('/:id/activities', (req, res) => leadController.getLeadActivities(req, res));

// Lead actions
router.post('/generate', (req, res) => leadController.generateLeadProfile(req, res));
router.post('/detect-intent', (req, res) => leadController.detectIntent(req, res));
router.put('/:id/status', (req, res) => leadController.updateLeadStatus(req, res));
router.put('/:id/profile', (req, res) => leadController.updateLeadProfile(req, res));
router.post('/:id/notes', (req, res) => leadController.addNote(req, res));
router.put('/:id/qualify', (req, res) => leadController.qualifyLead(req, res));

export default router;

