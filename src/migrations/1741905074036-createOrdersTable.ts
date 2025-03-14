import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateOrdersTable1741905074036 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure the uuid extension is available
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Create the enum type for status
    await queryRunner.query(
      `CREATE TYPE "status_enum" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled')`,
    );

    // Create the orders table
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enumName: 'status_enum',
          },
          {
            name: 'total_amount',
            type: 'integer',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Create foreign key linking user_id to the users table
    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL', // Sets user_id to null if the related user is deleted
        onUpdate: 'CASCADE', // Updates the user_id if the referenced user is updated
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get the orders table to find and drop the foreign key
    const table = await queryRunner.getTable('orders');
    const foreignKey = table.foreignKeys.find((fk) =>
      fk.columnNames.includes('user_id'),
    );

    if (foreignKey) {
      await queryRunner.dropForeignKey('orders', foreignKey);
    }

    // Drop the orders table
    await queryRunner.dropTable('orders');

    // Drop the enum type (if no longer in use)
    await queryRunner.query(`DROP TYPE "status_enum"`);
  }
}
