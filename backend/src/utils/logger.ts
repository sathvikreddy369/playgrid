export class StructuredLogger {
  private static formatMessage(level: string, message: string, requestId?: string, details?: any) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      requestId: requestId || null,
      message,
      ...(details && { details }),
    });
  }

  static info(message: string, requestId?: string, details?: any) {
    console.log(this.formatMessage('INFO', message, requestId, details));
  }

  static warn(message: string, requestId?: string, details?: any) {
    console.warn(this.formatMessage('WARN', message, requestId, details));
  }

  static error(message: string, requestId?: string, details?: any) {
    console.error(this.formatMessage('ERROR', message, requestId, details));
  }

  static audit(action: string, actorId: string | null, targetId: string | null, status: 'SUCCESS' | 'FAILURE', requestId?: string, details?: any) {
    console.log(
      this.formatMessage('AUDIT', `Audit log: ${action}`, requestId, {
        action,
        actorId,
        targetId,
        status,
        ...details,
      })
    );
  }
}
