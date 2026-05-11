import { Router } from 'express';
import { z } from 'zod';
import { requireTelegramUser } from './authMiddleware.js';
import { query, type Birthday } from './db.js';
import { sortByNextBirthday } from './birthdayUtils.js';

const router = Router();

const birthdaySchema = z.object({
  name: z.string().trim().min(1).max(80),
  relation: z.string().trim().min(1).max(80),
  birth_date: z.string().regex(/^(\d{4}|0000)-\d{2}-\d{2}$/),
  note: z.string().trim().max(500).optional().nullable(),
  gift_idea: z.string().trim().max(500).optional().nullable()
});

router.use('/api', requireTelegramUser);

router.get('/api/me', (req, res) => {
  res.json({ user: req.currentUser });
});

router.get('/api/birthdays', async (req, res, next) => {
  try {
    const result = await query<Birthday>(
      'SELECT * FROM birthdays WHERE user_id = $1 ORDER BY birth_date ASC',
      [req.currentUser!.id]
    );

    res.json({ birthdays: sortByNextBirthday(result.rows) });
  } catch (error) {
    next(error);
  }
});

router.post('/api/birthdays', async (req, res, next) => {
  try {
    const payload = birthdaySchema.parse(req.body);
    const result = await query<Birthday>(
      `
        INSERT INTO birthdays (user_id, name, relation, birth_date, note, gift_idea)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        req.currentUser!.id,
        payload.name,
        payload.relation,
        payload.birth_date,
        payload.note || null,
        payload.gift_idea || null
      ]
    );

    res.status(201).json({ birthday: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.put('/api/birthdays/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const payload = birthdaySchema.parse(req.body);

    const result = await query<Birthday>(
      `
        UPDATE birthdays
        SET name = $1,
            relation = $2,
            birth_date = $3,
            note = $4,
            gift_idea = $5,
            updated_at = now()
        WHERE id = $6 AND user_id = $7
        RETURNING *
      `,
      [
        payload.name,
        payload.relation,
        payload.birth_date,
        payload.note || null,
        payload.gift_idea || null,
        id,
        req.currentUser!.id
      ]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Birthday not found' });
    res.json({ birthday: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.delete('/api/birthdays/:id', async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM birthdays WHERE id = $1 AND user_id = $2',
      [Number(req.params.id), req.currentUser!.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Birthday not found' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router };
