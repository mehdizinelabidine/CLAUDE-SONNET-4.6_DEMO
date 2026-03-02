import { Module } from '@nestjs/common';
import { TimesheetsController } from './timesheets.controller';
import { TimesheetsService } from './timesheets.service';
import { StorageModule } from '../storage/storage.module';
import { ValidationModule } from '../validation/validation.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [StorageModule, ValidationModule, MetricsModule],
  controllers: [TimesheetsController],
  providers: [TimesheetsService],
  exports: [TimesheetsService],
})
export class TimesheetsModule {}
