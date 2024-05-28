import { IsNumber, IsOptional, IsString } from "class-validator";

export class AddressDto {
  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  street: string;

  @IsNumber()
  streetNumber: number

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsString()
  zipCode: string;
}