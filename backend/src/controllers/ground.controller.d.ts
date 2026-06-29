import { Request, Response } from 'express';
export declare class GroundController {
    createGround(req: Request, res: Response): Promise<void>;
    getGrounds(req: Request, res: Response): Promise<void>;
    getGroundById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateGround(req: Request, res: Response): Promise<void>;
    addReview(req: Request, res: Response): Promise<void>;
    deleteReview(req: Request, res: Response): Promise<void>;
    verifyGround(req: Request, res: Response): Promise<void>;
}
export declare const groundController: GroundController;
//# sourceMappingURL=ground.controller.d.ts.map