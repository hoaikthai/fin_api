import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { Account } from './account.entity';
import { TransactionModule } from '../transaction/transaction.module';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/configuration';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService<AppConfig>) => {
        const jwtConfig = configService.get('jwt', { infer: true })!;
        return {
          secret: jwtConfig.secret,
          signOptions: { expiresIn: jwtConfig.expiresIn },
        };
      },
      inject: [ConfigService],
    }),
    TransactionModule,
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
