import {
  IsNotEmpty,
  IsUUID,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'The ID of the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productId: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'The quantity of the product', example: 2 })
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => OrderItemDto)
  @ApiProperty({
    description: 'The items in the order',
    type: [OrderItemDto],
    example: [
      { productId: '123e4567-e89b-12d3-a456-426614174000', quantity: 2 },
    ],
  })
  items: OrderItemDto[];
}
