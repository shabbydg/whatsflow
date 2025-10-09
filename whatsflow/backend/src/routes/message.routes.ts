import { Router } from 'express';
import { MessageController } from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
const messageController = new MessageController();

router.use(authenticate);

router.get('/', (req, res) => messageController.getMessages(req, res));
router.get('/stats', (req, res) => messageController.getStats(req, res));
router.get('/conversation/:contactId', (req, res) => messageController.getConversation(req, res));

export default router;
