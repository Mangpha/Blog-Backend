import { Injectable } from '@nestjs/common';
import { InternalServerErrorOutput } from 'src/common/common.error';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
}
