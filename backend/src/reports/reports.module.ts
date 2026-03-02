import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { StorageModule } from '../storage/storage.module';
import { SummariesModule } from '../summaries/summaries.module';

@Module({
  imports: [StorageModule, SummariesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
