import { Request, Response } from 'express';
export declare class CommunityController {
    createCommunity(req: Request, res: Response): Promise<void>;
    getCommunities(req: Request, res: Response): Promise<void>;
    getCommunityById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    joinCommunity(req: Request, res: Response): Promise<void>;
    leaveCommunity(req: Request, res: Response): Promise<void>;
    kickMember(req: Request, res: Response): Promise<void>;
    verifyCommunity(req: Request, res: Response): Promise<void>;
}
export declare const communityController: CommunityController;
//# sourceMappingURL=community.controller.d.ts.map