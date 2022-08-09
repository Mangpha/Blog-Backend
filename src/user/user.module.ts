import { Module } from '@nestjs/common';
import { TypeOrmCustomModule } from 'src/typeorm/custom.module';
import { UserRepository } from './repositories/user.repository';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmCustomModule.forCustomRepository([UserRepository])],
  providers: [UserResolver, UserService],
})
export class UserModule {}
