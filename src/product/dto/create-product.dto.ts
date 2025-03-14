import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'The name of the product', example: 'Laptop' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The description of the product',
    example: 'High-performance laptop',
  })
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'The price of the product', example: 10000 })
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({
    description: 'The stock quantity of the product',
    example: 10,
  })
  stock: number;
}
