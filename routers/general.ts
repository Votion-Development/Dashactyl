import { Router } from 'express';
// import { BaseSettings } from '../models/settings';

const router = Router();

// Authentication
router.get('/login', (_, res) => res.render('login.ejs'));
router.get('/signup', (_, res) => res.render('signup.ejs'));

// Dashboard
router.get('/dashboard', (req, res) => {
    return res.render('dashboard.ejs', {
        user:{
            resources:{
                memory: 0,
                disk: 0,
                cpu: 0,
                servers: 0
            }
        },
        servers:[]
    });
});

// Main
router.get('/', (_, res) => res.render('home.ejs'));
router.get('*', (_, res) => res.render('errors.ejs', {
    code: 404,
    message: null,
    invite: null
}));

export default router;
