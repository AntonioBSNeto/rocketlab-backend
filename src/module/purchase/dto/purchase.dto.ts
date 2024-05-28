import { IsArray, IsDate, IsDateString, IsNumber, IsPositive, IsString, ValidateNested } from "class-validator";
import { PurchaseProductDTO } from "./purchaseProduct.dto";
import { Type } from "class-transformer";

export class PurchaseDTO {
  @IsString()
  userId: string;

  @IsDateString()
  purchaseDate: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseProductDTO)
  products: PurchaseProductDTO[];

}