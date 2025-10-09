/**
 * Products Routes
 * Handles product knowledge base management
 */

import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.js';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * Get all products for a business
 */
router.get(
  '/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('category').optional().isString(),
    query('search').optional().isString(),
  ],
  validateRequest,
  async (req: AuthRequest, res) => {
    try {
      const businessProfileId = req.user?.businessProfileId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;
      const category = req.query.category as string;
      const search = req.query.search as string;

      let whereClause = 'WHERE business_profile_id = ?';
      const params: any[] = [businessProfileId];

      if (category) {
        whereClause += ' AND category = ?';
        params.push(category);
      }

      if (search) {
        whereClause += ' AND (name LIKE ? OR description LIKE ? OR sku LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Get products with pagination
      const products = await pool.query<RowDataPacket[]>(
        `SELECT * FROM products ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      // Get total count
      const [countResult] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM products ${whereClause}`,
        params
      );

      const total = countResult[0].total;

      res.json({
        success: true,
        data: products[0],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      logger.error('Error fetching products:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Get a single product
 */
router.get(
  '/:id',
  authenticate,
  [param('id').isUUID()],
  validateRequest,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const businessProfileId = req.user?.businessProfileId;

      const [products] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM products WHERE id = ? AND business_profile_id = ?',
        [id, businessProfileId]
      );

      if (products.length === 0) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      res.json({ success: true, data: products[0] });
    } catch (error: any) {
      logger.error('Error fetching product:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Create a new product
 */
router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().isString(),
    body('description').optional().isString(),
    body('category').optional().isString(),
    body('price').optional().isFloat({ min: 0 }),
    body('currency').optional().isString().isLength({ min: 3, max: 3 }),
    body('sku').optional().isString(),
    body('image_url').optional().isURL(),
    body('product_url').optional().isURL(),
    body('specifications').optional().isObject(),
    body('is_available').optional().isBoolean(),
  ],
  validateRequest,
  async (req: AuthRequest, res) => {
    try {
      const businessProfileId = req.user?.businessProfileId;
      const {
        name,
        description,
        category,
        price,
        currency = 'LKR',
        sku,
        image_url,
        product_url,
        specifications,
        is_available = true,
      } = req.body;

      const productId = uuidv4();

      await pool.query<ResultSetHeader>(
        `INSERT INTO products
         (id, business_profile_id, name, description, category, price, currency, sku, image_url, product_url, specifications, is_available)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          businessProfileId,
          name,
          description || null,
          category || null,
          price || null,
          currency,
          sku || null,
          image_url || null,
          product_url || null,
          specifications ? JSON.stringify(specifications) : null,
          is_available,
        ]
      );

      const [products] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM products WHERE id = ?',
        [productId]
      );

      logger.info(`Product created: ${productId} - ${name}`);

      res.status(201).json({ success: true, data: products[0] });
    } catch (error: any) {
      logger.error('Error creating product:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Update a product
 */
router.put(
  '/:id',
  authenticate,
  [
    param('id').isUUID(),
    body('name').optional().isString(),
    body('description').optional().isString(),
    body('category').optional().isString(),
    body('price').optional().isFloat({ min: 0 }),
    body('currency').optional().isString().isLength({ min: 3, max: 3 }),
    body('sku').optional().isString(),
    body('image_url').optional().isURL(),
    body('product_url').optional().isURL(),
    body('specifications').optional().isObject(),
    body('is_available').optional().isBoolean(),
  ],
  validateRequest,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const businessProfileId = req.user?.businessProfileId;

      // Check if product exists
      const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM products WHERE id = ? AND business_profile_id = ?',
        [id, businessProfileId]
      );

      if (existing.length === 0) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      const allowedFields = [
        'name',
        'description',
        'category',
        'price',
        'currency',
        'sku',
        'image_url',
        'product_url',
        'specifications',
        'is_available',
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          updateValues.push(
            field === 'specifications' ? JSON.stringify(req.body[field]) : req.body[field]
          );
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update' });
      }

      updateValues.push(id, businessProfileId);

      await pool.query<ResultSetHeader>(
        `UPDATE products SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND business_profile_id = ?`,
        updateValues
      );

      const [products] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );

      logger.info(`Product updated: ${id}`);

      res.json({ success: true, data: products[0] });
    } catch (error: any) {
      logger.error('Error updating product:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Delete a product
 */
router.delete(
  '/:id',
  authenticate,
  [param('id').isUUID()],
  validateRequest,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const businessProfileId = req.user?.businessProfileId;

      const [result] = await pool.query<ResultSetHeader>(
        'DELETE FROM products WHERE id = ? AND business_profile_id = ?',
        [id, businessProfileId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      logger.info(`Product deleted: ${id}`);

      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error: any) {
      logger.error('Error deleting product:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Get product categories
 */
router.get(
  '/categories/list',
  authenticate,
  async (req: AuthRequest, res) => {
    try {
      const businessProfileId = req.user?.businessProfileId;

      const [categories] = await pool.query<RowDataPacket[]>(
        `SELECT DISTINCT category, COUNT(*) as count
         FROM products
         WHERE business_profile_id = ? AND category IS NOT NULL
         GROUP BY category
         ORDER BY category`,
        [businessProfileId]
      );

      res.json({ success: true, data: categories });
    } catch (error: any) {
      logger.error('Error fetching categories:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;
