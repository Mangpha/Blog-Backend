import { Injectable } from '@nestjs/common';
import { InternalServerErrorOutput } from 'src/common/common.error';
import { JwtService } from 'src/jwt/jwt.service';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount({
    username,
    email,
    password,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const existUsername = await this.userRepository.findOne({
        where: { username },
      });
      if (existUsername)
        return { success: false, error: 'User name already exists' };
      const existEmail = await this.userRepository.findOne({
        where: { email },
      });
      if (existEmail) return { success: false, error: 'Email already exists' };
      await this.userRepository.save(
        this.userRepository.create({ username, email, password }),
      );
      return { success: true };
    } catch (e) {
      console.log(e);
      return InternalServerErrorOutput;
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const findUser = await this.userRepository.findOne({ where: { email } });
      if (!findUser) return { success: false, error: 'User not found' };
      const checkPassword = await findUser.checkPassword(password);
      if (!checkPassword) return { success: false, error: 'Wrong Password' };
      const token = this.jwtService.sign(findUser.id);
      return { success: true, token };
    } catch (e) {
      console.log(e);
      return InternalServerErrorOutput;
    }
  }
}
