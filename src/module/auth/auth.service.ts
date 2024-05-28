import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService
  ) { }

  async signIn(email: string, pass: string): Promise<{ access_token: string, refresh_token: string }> {
    const user = await this.usersService.findOneByEmail(email);
    const isPasswordMatching = await compare(pass, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException();
    }

    return (await this.createToken(user.id, user.email));
  }

  async createToken(id: string, email: string) {
    const refreshToken = this.jwtService.sign(
      { userId: id, email },
      {
        expiresIn: '7d',
      },
    );

    const accessToken  = this.jwtService.sign({ userId: id, email })

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      return (this.createToken(payload.userId, payload.email));
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

}