import { Module } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { PurchaseController } from "./purchase.controller";
import { PurchaseService } from "./purchase.service";

@Module({
  controllers: [PurchaseController],
  providers: [PurchaseService, PrismaService],
  exports: [PurchaseService]
})
export class PurchaseModule {}