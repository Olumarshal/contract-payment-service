import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
// import { SeedService } from './seed/seed.service';
import dataSource from 'db/data-source';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    await dataSource.initialize();
    console.log('Database connected successfully.');

    // for development only
    // const seedService = app.get(SeedService);

    // console.log('Seeding database...');
    // await seedService.seed();
    // console.log('Database seeded successfully.');

    const configService = app.get(ConfigService);
    await app.listen(configService.get<number>('port'));
    console.log(
      `Server is running on port ${configService.get<number>('port')}`,
    );
  } catch (error) {
    console.error('Error during application bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
