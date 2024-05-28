import { IsInt, IsOptional, IsString } from "class-validator";

export class PurchaseProductDTO {
  @IsOptional()
  id: string;

  @IsString()
  productId: string;

  @IsInt()
  quantity: number;
}