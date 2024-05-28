import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

const tokens = { access_token: 'acc_token', refresh_token: 'refr_token' };

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{
        provide: AuthService,
        useValue: {
          signIn: jest.fn().mockResolvedValue(tokens),
          refreshToken: jest.fn().mockResolvedValue(tokens),
        }
      }]
    }).compile();


    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    it('should return access and refresh tokens successfully', async () => {
      const login_data = {
        email: 'email@email.com',
        password: 'senha123'
      }

      const result = await authController.signIn(login_data);

      expect(result).toEqual(tokens);
    });

    it('should throw an exception', () => {
      const login_data = {
        email: 'email@email.com',
        password: 'senha123'
      }

      jest.spyOn(authService, 'signIn').mockRejectedValueOnce(new Error());

      expect(authController.signIn(login_data)).rejects.toThrow();
    });
  });


  describe('refresh', () => {
    it('should return access and refresh tokens successfully', async () => {
      const token = { refreshToken: "my-token" };

      const result = await authController.refresh(token);

      expect(result).toEqual(tokens);
    });

    it('should throw an exception', () => {
      const token = { refreshToken: "my-token" };

      jest.spyOn(authService, 'refreshToken').mockRejectedValueOnce(new Error());

      expect(authController.refresh(token)).rejects.toThrow();
    });
  });

});