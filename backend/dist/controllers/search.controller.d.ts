import { Request, Response } from 'express';
export declare class SearchController {
    search(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    aiSearch(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const searchController: SearchController;
//# sourceMappingURL=search.controller.d.ts.map