import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsMobilePhone, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from 'class-validator';
import { AddressDto } from './address.dto';

export class UserDTO {
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsEmail()
  email: string;
  
  @IsString()
  password: string;

  @IsMobilePhone('pt-BR')
  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses?: AddressDto[];

}