import { Router } from 'express';
import { WhatsAppController } from '../controllers/whatsapp.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
const whatsappController = new WhatsAppController();

// All routes require authentication
router.use(authenticate);

router.post('/connect', (req, res) => whatsappController.connect(req, res));
router.get('/status', (req, res) => whatsappController.getStatus(req, res));
router.post('/disconnect', (req, res) => whatsappController.disconnect(req, res));
router.post('/send', (req, res) => whatsappController.sendMessage(req, res));
router.post('/sync-contacts', (req, res) => whatsappController.syncContacts(req, res));

export default router;
