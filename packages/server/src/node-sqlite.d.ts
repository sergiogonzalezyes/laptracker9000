declare module 'node:sqlite' {
  interface StatementResultingChanges {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  }

  interface StatementSync {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    all(...params: any[]): any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(...params: any[]): any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    run(...params: any[]): StatementResultingChanges;
  }

  class DatabaseSync {
    constructor(location: string, options?: { open?: boolean; readOnly?: boolean });
    close(): void;
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }
}
