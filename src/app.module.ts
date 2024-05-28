import { Module } from '@nestjs/common';
import { ProductModule } from './module/products/products.module';
import { UserModule } from './module/users/users.module';
import { AuthModule } from './module/auth/auth.module';
import { PurchaseModule } from './module/purchase/purchase.module';

@Module({
  imports: [ProductModule, UserModule, AuthModule, PurchaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
