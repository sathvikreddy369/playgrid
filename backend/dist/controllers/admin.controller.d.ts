import { Request, Response } from 'express';
export declare class AdminController {
    getStats(req: Request, res: Response): Promise<void>;
    getModerationQueue(req: Request, res: Response): Promise<void>;
    getUsers(req: Request, res: Response): Promise<void>;
    getMatches(req: Request, res: Response): Promise<void>;
}
export declare const adminController: AdminController;
//# sourceMappingURL=admin.controller.d.ts.map