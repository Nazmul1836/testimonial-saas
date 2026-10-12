#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/5f4d2a05229f43633d7bf63337058f1c7cf81afbd589d52f1839fcf1be0882fc/contract';
import startContract from '../../snapshots/5f4d2a05229f43633d7bf63337058f1c7cf81afbd589d52f1839fcf1be0882fc/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/8727b8ad20f263595f92caea19596b879dd73ff279cbb7e30b69e9927957c52e/contract';
import endContract from '../../snapshots/8727b8ad20f263595f92caea19596b879dd73ff279cbb7e30b69e9927957c52e/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'RateLimitHit',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('key', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'RateLimitHit',
        index: 'RateLimitHit_key_createdAt_idx_82c8d55f',
        columns: ['key', 'createdAt'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
