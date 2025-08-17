import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category } from './category.entity';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/configuration';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
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
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
