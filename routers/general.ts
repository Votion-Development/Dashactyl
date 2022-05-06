import { Router } from 'express';
// import { BaseSettings } from '../models/settings';
import { IAccount } from '../models/account';

export interface Context {
    user:       IAccount;
    servers:    unknown[];
    type:       SessionType;
    isAdmin:    boolean;
    validated:  boolean;
}

export enum SessionType {
    NONE,
    RETURNING,
    NEW_ACCOUNT
}

const router = Router();

// Authentication
router.get('/login', (_, res) => res.render('login.ejs'));
router.get('/signup', (_, res) => res.render('signup.ejs'));

// Dashboard
router.get('/dashboard', (_, res) => res.render('dashboard'));

// Main
router.get('/', (req, res) => res.render('home.ejs'));
router.get('*', (_, res) => res.render('errors.ejs', {
    code: 404,
    message: null,
    invite: null
}));

export default router;
