import { Router } from 'express';
import { PersonaService } from '../services/persona.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';
import { body, validationResult } from 'express-validator';

const router = Router();
const personaService = new PersonaService();

/**
 * GET /api/v1/personas
 * Get all personas for the authenticated business
 */
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessProfileId = req.user?.businessProfileId;

    if (!businessProfileId) {
      return res.status(400).json({ error: 'Business profile not found' });
    }

    const personas = await personaService.getAllPersonas(businessProfileId);

    res.json({
      success: true,
      data: personas,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/personas/:id
 * Get a specific persona
 */
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessProfileId = req.user?.businessProfileId;
    const personaId = req.params.id;

    if (!businessProfileId) {
      return res.status(400).json({ error: 'Business profile not found' });
    }

    const persona = await personaService.getPersonaById(personaId, businessProfileId);

    res.json({
      success: true,
      data: persona,
    });
  } catch (error: any) {
    if (error.message === 'Persona not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/personas
 * Create a new custom persona
 */
router.post(
  '/',
  authenticate,
  [
    body('name').trim().notEmpty().withMessage('Persona name is required'),
    body('description').optional().trim(),
    body('ai_instructions').optional().trim(),
    body('ai_model').optional().trim(),
    body('tone').optional().trim(),
    body('response_style').optional().trim(),
    body('preferred_language').optional().trim(),
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const businessProfileId = req.user?.businessProfileId;

      if (!businessProfileId) {
        return res.status(400).json({ error: 'Business profile not found' });
      }

      const persona = await personaService.createPersona(businessProfileId, req.body);

      res.status(201).json({
        success: true,
        data: persona,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * PUT /api/v1/personas/:id
 * Update a persona
 */
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessProfileId = req.user?.businessProfileId;
    const personaId = req.params.id;

    if (!businessProfileId) {
      return res.status(400).json({ error: 'Business profile not found' });
    }

    const persona = await personaService.updatePersona(
      personaId,
      businessProfileId,
      req.body
    );

    res.json({
      success: true,
      data: persona,
    });
  } catch (error: any) {
    if (error.message === 'Persona not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Cannot modify system personas') {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/v1/personas/:id
 * Delete a custom persona
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessProfileId = req.user?.businessProfileId;
    const personaId = req.params.id;

    if (!businessProfileId) {
      return res.status(400).json({ error: 'Business profile not found' });
    }

    await personaService.deletePersona(personaId, businessProfileId);

    res.json({
      success: true,
      message: 'Persona deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Persona not found') {
      return res.status(404).json({ error: error.message });
    }
    if (
      error.message === 'Cannot delete system personas' ||
      error.message === 'Cannot delete persona that is assigned to devices'
    ) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/personas/models/available
 * Get list of available AI models
 */
router.get('/models/available', authenticate, async (req: AuthRequest, res) => {
  try {
    const models = personaService.getAvailableAIModels();

    res.json({
      success: true,
      data: models,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
