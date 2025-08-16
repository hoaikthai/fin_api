import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TransferController } from './transfer.controller';
import { TransactionModule } from '../transaction/transaction.module';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/configuration';

@Module({
  imports: [
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
  controllers: [TransferController],
})
export class TransferModule {}
