import { Request, Response } from 'express';
export declare class MatchController {
    getRecommendations(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createMatch(req: Request, res: Response): Promise<void>;
    getMatches(req: Request, res: Response): Promise<void>;
    getMatchById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    requestToJoin(req: Request, res: Response): Promise<void>;
    approvePlayer(req: Request, res: Response): Promise<void>;
    rejectPlayer(req: Request, res: Response): Promise<void>;
    markAttendance(req: Request, res: Response): Promise<void>;
    cancelMatch(req: Request, res: Response): Promise<void>;
}
export declare const matchController: MatchController;
//# sourceMappingURL=match.controller.d.ts.map