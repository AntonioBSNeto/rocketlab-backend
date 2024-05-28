import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./users.controller";
import { UserService } from "./users.service";
import { User } from "@prisma/client";
import { UserDTO } from "./dto/user.dto";
import { UpdateUserDTO } from "./dto/update-user.dto";

const userList: User[] = [
  { id: '0', email: 'email0@email.com', name: 'nome 0', password: 'senha0', phone: '9999999999', createdAt: null, deletedAt: null, updatedAt: null },
  { id: '1', email: 'email1@email.com', name: 'nome 1', password: 'senha1', phone: '9999999999', createdAt: null, deletedAt: null, updatedAt: null },
  { id: '2', email: 'email2@email.com', name: 'nome 2', password: 'senha2', phone: '9999999999', createdAt: null, deletedAt: null, updatedAt: null }
]

const updatedUser = { id: '1', email: 'email1@email.com', name: 'nome novo', password: 'nova senha', phone: '9999999999', createdAt: null, deletedAt: null, updatedAt: null };

const deletedUser = { id: '3', email: 'email3@email.com', name: 'nome 3', password: 'senha3', phone: '9999999999', createdAt: null, deletedAt: new Date(2024, 5, 1), updatedAt: null };

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{
        provide: UserService,
        useValue: {
          create: jest.fn().mockResolvedValue(null),
          findAll: jest.fn().mockResolvedValue(userList),
          findAllByNameContaining: jest.fn().mockResolvedValue(userList.slice(0,2)),
          findOne: jest.fn().mockResolvedValue(userList[0]),
          updateUser: jest.fn().mockResolvedValue(updatedUser),
          deleteUser: jest.fn().mockResolvedValue(deletedUser),
        }
      }]
    }).compile();


    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a user list entity successfully', async () => {
      const result = await userController.findAll();
      
      expect(result).toEqual(userList);
    });

    it('should throw an exception', () => {
      jest.spyOn(userService, 'findAll').mockRejectedValueOnce(new Error());

      expect(userController.findAll()).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      // arrange
      const body: UserDTO = {
        name: 'produto 1',
        email: 'email@email.com',
        password: 'senha1'
      };

      // act
      await userController.create(body);

      // assert
      expect(userService.create).toHaveBeenCalledTimes(1);
      expect(userService.create).toHaveBeenCalledWith(body);
    })

    it('should throw an execption', () => {
      const body: UserDTO = {
        name: 'produto 1',
        email: 'email@email.com',
        password: 'senha1'
      };

      jest.spyOn(userService, 'create').mockRejectedValueOnce(new Error());

      expect(userController.create(body)).rejects.toThrow();
    });
  });


  describe('findOne', () => {
    it('should get a user item successfully', async () => {
      // Act
      const result = await userController.findOne('1');

      // Assert
      expect(result).toEqual(userList[0]);
      expect(userService.findOne).toHaveBeenCalledTimes(1);
      expect(userService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw an exception', () => {
      // Arrange
      jest
        .spyOn(userService, 'findOne')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(userController.findOne('1')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a user item successfully', async () => {
      // Arrange
      const body: UpdateUserDTO = {
        name: 'novo nome',
        password: 'nova senha',
      };

      // Act
      const result = await userController.update('2', body);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(userService.updateUser).toHaveBeenCalledTimes(1);
      expect(userService.updateUser).toHaveBeenCalledWith('2', body);
    });

    it('should throw an exception', () => {
      // Arrange
      const body: UpdateUserDTO = {
        name: 'novo nome',
        password: 'nova senha',
      };

      jest.spyOn(userService, 'updateUser').mockRejectedValueOnce(new Error());

      // Assert
      expect(userController.update('2', body)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should remove a produuct item successfully', async () => {
      // Act
      const result = await userController.delete('1');

      // Assert
      expect(result).toEqual(deletedUser);
      expect(result.deletedAt).toEqual(deletedUser.deletedAt);
    });

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(userService, 'deleteUser').mockRejectedValueOnce(new Error());

      // Assert
      expect(userController.delete('1')).rejects.toThrow();
    });
  });
});