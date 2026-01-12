import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

const configService = new ConfigService();

const isProd = process.env.NODE_ENV === 'production';

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: configService.getOrThrow<string>('DB_HOST'),
    port: configService.getOrThrow<number>('DB_PORT'),
    username: configService.getOrThrow<string>('DB_USER'),
    password: configService.getOrThrow<string>('DB_PASSWORD'),
    database: configService.getOrThrow<string>('DB_NAME'),
    migrations: isProd ? ['dist/database/migrations/*.js'] : [__dirname + '/migrations/*.ts'],
    migrationsTableName: 'migrations',
    migrationsRun: false,
    synchronize: false,
    logging: false,
    extra: {
        connectionLimit: 10,
    }
}
const dataSource = new DataSource(dataSourceOptions);

export default dataSource;