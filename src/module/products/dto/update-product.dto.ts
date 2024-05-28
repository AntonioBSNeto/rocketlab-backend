import { PartialType } from '@nestjs/swagger';
import { ProductDTO } from './product.dto';

export class UpdateProductDTO extends PartialType(ProductDTO) {}