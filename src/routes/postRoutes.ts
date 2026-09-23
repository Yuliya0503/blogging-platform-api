import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT 
          posts.id AS id,
          posts.title,
          posts.category,
          posts.content,
          COALESCE(
            ARRAY_AGG (tags.name) FILTER (WHERE tags.id IS NOT NULL),
            '{}'
          ) AS tags,
          posts.created_at AS "createdAt",
          posts.updated_at AS "updatedAt"
        FROM posts
        LEFT JOIN post_tags ON posts.id = post_tags.post_id
        LEFT JOIN tags ON post_tags.tag_id = tags.id
        GROUP BY 
          posts.id, 
          posts.title, 
          posts.category,
          posts.content,
          posts.created_at,
          posts.updated_at
        ORDER BY posts.updated_at DESC
      `
    );
    

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to get posts'
    })
  }
})

export default router;