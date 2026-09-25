import { Router } from 'express';
import pool from '../db.js';
import { validatePosts } from '../validators/postsValidator.js';

const router = Router();

router.get('/', async (req, res) => {
  const { term } = req.query;

  try {
    let query = 
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
      `;
    const params: string[] = [];

    if (term) {
      query += `
        WHERE
          posts.title ILIKE '%' || $1 || '%'
          OR posts.content ILIKE '%' || $1 || '%'
          OR posts.category ILIKE '%' || $1 || '%'
      `;
      params.push(term as string);
    }

    query += `
      GROUP BY 
        posts.id, 
        posts.title, 
        posts.category,
        posts.content,
        posts.created_at,
        posts.updated_at
      ORDER BY posts.updated_at DESC
    `
    const result = await pool.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to get posts'
    })
  }
})

router.get('/:id', async (req, res) => {
  const { id } = req.params;

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
        WHERE posts.id = $1
        GROUP BY 
          posts.id, 
          posts.title, 
          posts.category, 
          posts.content,
          posts.created_at,
          posts.updated_at
      `,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to get posts'
    })
  }
})

router.post('/', async (req, res) => {
  const { title, content, category, tags } = req.body;

  const validationError = validatePosts(
    title,
    content,
    category, 
    tags
  );

  if (validationError) {
    return res.status(400).json({
      message: validationError
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    //Create post
    const postResult = await client.query(
      `
        INSERT INTO posts (title, content, category)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [title, content, category]
    );
    const postId = postResult.rows[0].id;
    //Normalize tags
    const normalizedTags = [
      ... new Set(
        (tags ?? []).map((tag: string) => tag.trim().toLowerCase())
      )
    ];
    //create tag
    for ( const tagName of normalizedTags) {
      const tagResult = await client.query(
        `
          INSERT INTO tags (name)
          VALUES ($1)
          ON CONFLICT (name) 
          DO NOTHING
          RETURNING id
        `,
        [tagName]
      );

      let tagId;

      if (tagResult.rows.length > 0) {
        tagId = tagResult.rows[0].id
      } else {
        const existingTag = await client.query(
          `
            SELECT id
            FROM tags
            WHERE name = $1
          `,
          [tagName]
        );
        tagId = existingTag.rows[0].id;
      }

      //link tag to the post
      await client.query(
        `
        INSERT INTO post_tags (post_id, tag_id)
        VALUES ($1, $2)
        `,
        [postId, tagId]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({
      id: postId,
      title,
      content,
      category,
      tags: normalizedTags
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    return res.status(500).json({
      message: 'Failed to create post'
    })
  } finally {
    client.release();
  }
})

export default router;