import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {pool} from '../db/dbconfig.js';

const TOKEN_KEY = process.env.TOKEN_KEY;
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const { email, password, displayName } = req.body;

    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length > 0) {
            return res.status(409).json({ message: 'User already exists!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (email, password, displayName) VALUES ($1, $2, $3)',
            [email, hashedPassword, displayName]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User doesn't exist!" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email or Password is Incorrect' });
        }

        const token = jwt.sign({ id: user.rows[0].id }, TOKEN_KEY);
        res.status(200).json({ token, userID: user.rows[0].id, Uname: user.rows[0].displayname });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.get("/:userID", async (req, res) => {
    try {
        // Query to get displayName by user ID in PostgreSQL
        const result = await pool.query(
            'SELECT displayName FROM users WHERE id = $1',
            [req.params.userID]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0].displayname);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});


// Middleware to verify user requests by token
export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (token) {
        jwt.verify(token, TOKEN_KEY, (err) => {
            if (err) {
                return res.sendStatus(403);
            }
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

export { router as userRouter };
