// Utilitário para serializar BigInt em JSON
// PostgreSQL retorna BigInt; Express não serializa nativamente

export function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = serializeBigInt(obj[key]);
    }
    return result;
  }
  return obj;
}

export function jsonResponse(data: any) {
  return JSON.parse(JSON.stringify(data, (_key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}
