import { Injectable } from '@nestjs/common';
import { InternalServerErrorOutput } from 'src/common/common.error';
import { JwtService } from 'src/jwt/jwt.service';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/createAccount.dto';
import { DeleteAccountOutput } from './dtos/deleteAccount.dto';
import { EditAccountInput, EditAccountOutput } from './dtos/editAccount.dto';
import { FindByIdOutput } from './dtos/findById.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
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
      const existEmail = await this.userRepository.findOne({
        where: { email },
      });
      if (existEmail) return { success: false, error: 'Email already exists' };
      const existUsername = await this.userRepository.findOne({
        where: { username },
      });
      if (existUsername)
        return { success: false, error: 'User name already exists' };
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
      const findUser = await this.userRepository.findOne({
        where: { email },
        select: ['id', 'password'],
      });
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

  async findById(userId: number): Promise<FindByIdOutput> {
    return await this.userRepository.findById(userId);
  }

  async editAccount(
    user: number,
    { username, email, password }: EditAccountInput,
  ): Promise<EditAccountOutput> {
    try {
      const userData = await this.userRepository.findOneBy({ id: user });

      if (email) {
        const existEmail = await this.userRepository.findOneBy({ email });
        if (existEmail)
          return { success: false, error: 'Email already exists' };
        userData.email = email;
        userData.verified = false;
      }
      if (username) {
        const existUsername = await this.userRepository.findOneBy({ username });
        if (existUsername)
          return { success: false, error: 'Username already exists' };
        userData.username = username;
      }
      if (password) userData.password = password;

      await this.userRepository.save(userData);
      return { success: true };
    } catch (e) {
      console.log(e);
      return InternalServerErrorOutput;
    }
  }

  async deleteAccount(user: number): Promise<DeleteAccountOutput> {
    try {
      await this.userRepository.delete({ id: user });
      return { success: true };
    } catch (e) {
      console.log(e);
      return InternalServerErrorOutput;
    }
  }
}
