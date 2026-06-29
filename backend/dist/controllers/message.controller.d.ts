import { Request, Response } from 'express';
export declare class MessageController {
    getConversations(req: Request, res: Response): Promise<void>;
    getMessages(req: Request, res: Response): Promise<void>;
    markAsRead(req: Request, res: Response): Promise<void>;
}
export declare const messageController: MessageController;
//# sourceMappingURL=message.controller.d.ts.map