import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateOrderItemsTable1741905213446 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()', // Ensure the uuid-ossp extension is enabled
          },
          {
            name: 'order_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'quantity',
            type: 'integer',
          },
          {
            name: 'price',
            type: 'integer',
            isNullable: false,
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

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'orders',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('order_items');
    const orderForeignKey = table.foreignKeys.find((fk) =>
      fk.columnNames.includes('order_id'),
    );
    const productForeignKey = table.foreignKeys.find((fk) =>
      fk.columnNames.includes('product_id'),
    );

    if (orderForeignKey) {
      await queryRunner.dropForeignKey('order_items', orderForeignKey);
    }

    if (productForeignKey) {
      await queryRunner.dropForeignKey('order_items', productForeignKey);
    }

    await queryRunner.dropTable('order_items');
  }
}
