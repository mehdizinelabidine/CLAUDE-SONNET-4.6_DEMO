import { Module } from '@nestjs/common';
import { SummariesController } from './summaries.controller';
import { SummariesService } from './summaries.service';
import { StorageModule } from '../storage/storage.module';
import { ValidationModule } from '../validation/validation.module';

@Module({
  imports: [StorageModule, ValidationModule],
  controllers: [SummariesController],
  providers: [SummariesService],
  exports: [SummariesService],
})
export class SummariesModule {}
