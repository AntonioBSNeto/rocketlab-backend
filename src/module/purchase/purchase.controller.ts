import { Body, Controller, Delete, Get, Param, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { PurchaseService } from "./purchase.service";
import { PurchaseDTO } from "./dto/purchase.dto";
import { AuthGuard } from "../auth/auth.guard";
import { Purchase } from "@prisma/client";

@Controller('purchase')
export class PurchaseController {
  constructor (private purchaseService: PurchaseService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Req() request, @Body() body: PurchaseDTO) {
    const userIdFromToken = request.user.userId;
    if (userIdFromToken !== body.userId) {
      throw new UnauthorizedException('User ID does not match token user ID');
    }
    return this.purchaseService.create(body);
  }

  @Get()
  findAll(): Promise<Purchase[]> {
    return this.purchaseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Purchase> {
    return this.purchaseService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.purchaseService.deletePurchase(id);
  }

}