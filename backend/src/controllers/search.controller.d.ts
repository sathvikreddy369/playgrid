import { Request, Response } from 'express';
export declare class SearchController {
    search(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    aiSearch(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const searchController: SearchController;
//# sourceMappingURL=search.controller.d.ts.map