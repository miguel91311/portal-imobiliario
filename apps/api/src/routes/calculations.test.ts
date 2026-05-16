import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import calculationRoutes from './calculations';

const app = express();
app.use(express.json());
app.use('/api/calculations', calculationRoutes);

describe('IMT Jovem Calculator', () => {
  it('should return zero tax for eligible buyer under threshold', async () => {
    const res = await request(app)
      .post('/api/calculations/imt-jovem')
      .send({
        propertyValue: 300_000,
        buyerAge: 28,
        isFirstHome: true,
        isResident: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.eligible).toBe(true);
    expect(res.body.totalTax).toBe(0);
  });

  it('should calculate non-eligible buyer tax', async () => {
    const res = await request(app)
      .post('/api/calculations/imt-jovem')
      .send({
        propertyValue: 500_000,
        buyerAge: 40,
        isFirstHome: false,
        isResident: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.eligible).toBe(false);
    expect(res.body.totalTax).toBeGreaterThan(0);
  });
});

describe('AVM Calculator', () => {
  it('should return an estimate for PT property', async () => {
    const res = await request(app)
      .post('/api/calculations/avm')
      .send({
        propertyId: 'test-id',
        sqm: 100,
        typology: 'T3',
        city: 'Lisboa',
        country: 'PT',
      });

    expect(res.status).toBe(200);
    expect(res.body.estimatedValue).toBeGreaterThan(0);
    expect(res.body.confidence).toBeGreaterThanOrEqual(88);
    expect(res.body.currency).toBe('EUR');
  });
});
