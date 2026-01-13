import { DefaultNamingStrategy } from 'typeorm';
import { snakeCase } from 'typeorm/util/StringUtils';

export class SnakeCaseNamingStrategy extends DefaultNamingStrategy {
  columnName(propertyName: string, customName: string): string {
    return snakeCase(customName || propertyName); 
  }
}
