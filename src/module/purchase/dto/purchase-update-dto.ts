import { PartialType } from '@nestjs/swagger';
import { PurchaseDTO } from './purchase.dto';

export class UpdatePurchaseDTO extends PartialType(PurchaseDTO) {}