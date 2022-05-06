import { Router } from 'express';
// import ApiKeyManager from '../../managers/apikeys';
import apiUserHandler from './users';

const router = Router();

// TODO: api key validation
// router.use((req, res, next) => {});

router.use('/users', apiUserHandler);

router.get('/', (_, res) => res.json({
    status: 'ok',
    data: null
}));

export default router;
