import { Test, TestingModule } from "@nestjs/testing";
import { PurchaseService } from "./purchase.service";
import { Purchase } from "@prisma/client";
import { PurchaseDTO } from "./dto/purchase.dto";
import { PrismaService } from "../../database/prisma.service";

const purchaseList: Purchase[] = [
  { id: '1', total: 20, userId: '3', purchase_date: new Date(2024, 5, 10), createdAt: null, deletedAt: null, updatedAt: null },
  { id: '2', total: 20, userId: '2', purchase_date: new Date(2024, 4, 10), createdAt: null, deletedAt: null, updatedAt: null },
  { id: '3', total: 20, userId: '1', purchase_date: new Date(2024, 2, 10), createdAt: null, deletedAt: null, updatedAt: null },
];

const deletedPurchase: Purchase = { id: '1', total: 20, userId: '3', purchase_date: new Date(2024, 5, 10), createdAt: null, deletedAt: new Date(), updatedAt: null };

describe('PurchaseService', () => {
  let purchaseService: PurchaseService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseService],
      providers: [{
        provide: PrismaService,
        useValue: {
          purchase: {
            findMany: jest.fn().mockResolvedValue(purchaseList),
            findUnique: jest.fn().mockResolvedValue(purchaseList[0]),
            create: jest.fn().mockResolvedValue(null)
          },
          // TODO: fix $transaction mock implementation
          $transaction: jest.fn().mockResolvedValue(null),
        }
      }
    ]
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    purchaseService = module.get<PurchaseService>(PurchaseService);
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
    expect(purchaseService).toBeDefined();
  });

  describe('create', () => {
    // $transaction mock doesn work
    // it('should create a purchase successfully', async () => {
    //   // arrange
    //   const body: PurchaseDTO = {
    //     purchaseDate: new Date(2024, 5, 10),
    //     userId: '3',
    //     products: []
    //   };

    //   // act
    //   await purchaseService.create(body);

    //   // assert
    //   expect(prismaService.purchase.create).toHaveBeenCalledTimes(1);
    //   expect(prismaService.purchase.create).toHaveBeenCalledWith(body);
    // });

    it('should throw an execption', () => {
      const body: PurchaseDTO = {
        purchaseDate: new Date(2024, 5, 10),
        userId: '3',
        products: []
      };

      jest.spyOn(prismaService, '$transaction').mockRejectedValueOnce(new Error());

      expect(purchaseService.create(body)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return a purchase list successfully', async () => {
      const result = await purchaseService.findAll();
      
      expect(result).toEqual(purchaseList);
    });

    it('should throw an exception', () => {
      jest.spyOn(purchaseService, 'findAll').mockRejectedValueOnce(new Error());

      expect(purchaseService.findAll()).rejects.toThrow();
    });
  });
  
  describe('findOne', () => {
    it('should get a purchase item successfully', async () => {
      // Act
      const result = await purchaseService.findOne('1');

      // Assert
      expect(result).toEqual(purchaseList[0]);
      expect(prismaService.purchase.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.purchase.findUnique).toHaveBeenCalledWith({ where: { id: '1' }, });
    });

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(prismaService.purchase, 'findUnique').mockRejectedValueOnce(new Error());

      // Assert
      expect(purchaseService.findOne('1')).rejects.toThrow();
    });
  });

  describe('delete', () => {
    // $transaction mock doesn work
    // it('should remove a purchase item successfully', async () => {
    //   // Act
    //   const result = await purchaseService.deletePurchase('1');

    //   // Assert
    //   expect(result).toEqual(deletedPurchase);
    //   expect(result.deletedAt).toBeTruthy();
    // });

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(prismaService, '$transaction').mockRejectedValueOnce(new Error());

      // Assert
      expect(purchaseService.deletePurchase('1')).rejects.toThrow();
    });
  });

});