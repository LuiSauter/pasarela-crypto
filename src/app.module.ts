import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que el ConfigService esté disponible en todo el proyecto sin necesidad de importarlo en otros módulos.
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
