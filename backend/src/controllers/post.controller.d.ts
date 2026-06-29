import { Request, Response } from 'express';
export declare class PostController {
    getPosts(req: Request, res: Response): Promise<void>;
    getPostById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createPost(req: Request, res: Response): Promise<void>;
    updatePost(req: Request, res: Response): Promise<void>;
    deletePost(req: Request, res: Response): Promise<void>;
    toggleLike(req: Request, res: Response): Promise<void>;
    toggleSave(req: Request, res: Response): Promise<void>;
    createReply(req: Request, res: Response): Promise<void>;
    toggleReplyLike(req: Request, res: Response): Promise<void>;
    deleteReply(req: Request, res: Response): Promise<void>;
}
export declare const postController: PostController;
//# sourceMappingURL=post.controller.d.ts.map