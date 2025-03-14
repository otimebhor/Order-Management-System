import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'The email of the user',
    example: 'john@example.com',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  password: string;
}
