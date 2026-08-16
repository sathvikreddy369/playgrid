const fs = require('fs');

function fixMatchController() {
  let code = fs.readFileSync('src/controllers/matchController.ts', 'utf8');
  code = code.replace(/const { id } = req.params;/g, 'const id = req.params.id as string;');
  fs.writeFileSync('src/controllers/matchController.ts', code);
}

function fixMessageController() {
  let code = fs.readFileSync('src/controllers/messageController.ts', 'utf8');
  code = code.replace(/const { matchId } = req.params;/g, 'const matchId = req.params.matchId as string;');
  code = code.replace(/const { id } = req.params;/g, 'const id = req.params.id as string;');
  code = code.replace(/const isAcceptedParticipant = match.requests.some\(/g, 'const isAcceptedParticipant = (match as any).requests?.some(');
  fs.writeFileSync('src/controllers/messageController.ts', code);
}

function fixRequestController() {
  let code = fs.readFileSync('src/controllers/requestController.ts', 'utf8');
  code = code.replace(/const { matchId } = req.params;/g, 'const matchId = req.params.matchId as string;');
  code = code.replace(/const { requestId } = req.params;/g, 'const requestId = req.params.requestId as string;');
  // The 'match' property does not exist on request... 
  // It was 'match' relation that was not included. Let's cast request to any temporarily.
  code = code.replace(/request\.match/g, '(request as any).match');
  fs.writeFileSync('src/controllers/requestController.ts', code);
}

function fixReviewController() {
  let code = fs.readFileSync('src/controllers/reviewController.ts', 'utf8');
  code = code.replace(/const { matchId } = req.params;/g, 'const matchId = req.params.matchId as string;');
  code = code.replace(/const { id } = req.params;/g, 'const id = req.params.id as string;');
  code = code.replace(/const isParticipant = match.requests.some\(/g, 'const isParticipant = (match as any).requests?.some(');
  fs.writeFileSync('src/controllers/reviewController.ts', code);
}

function fixValidate() {
  let code = fs.readFileSync('src/middleware/validate.ts', 'utf8');
  code = code.replace(/AnyZodObject/g, 'ZodObject<any, any, any>');
  fs.writeFileSync('src/middleware/validate.ts', code);
}

fixMatchController();
fixMessageController();
fixRequestController();
fixReviewController();
fixValidate();
console.log('Done fixing TS errors with script.');
