import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
const contactController = new ContactController();

router.use(authenticate);

router.get('/', (req, res) => contactController.getContacts(req, res));
router.get('/search', (req, res) => contactController.searchContacts(req, res));
router.get('/tags', (req, res) => contactController.getTags(req, res));
router.post('/tags', (req, res) => contactController.createTag(req, res));
router.get('/:id', (req, res) => contactController.getContact(req, res));
router.post('/', (req, res) => contactController.createContact(req, res));
router.put('/:id', (req, res) => contactController.updateContact(req, res));
router.delete('/:id', (req, res) => contactController.deleteContact(req, res));
router.post('/:id/tags', (req, res) => contactController.addTagToContact(req, res));

export default router;
