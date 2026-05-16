import { Response, NextFunction } from 'express';

export function serializeBigIntMiddleware(_req: any, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);
  res.json = function(data: any) {
    return originalJson(JSON.parse(JSON.stringify(data, (_key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    )));
  };
  next();
}
