import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

router.route('/')
    .get((req:Request, res:Response, next?: NextFunction) => {
        res.status(200).json('its working')
    })
    
export default router;