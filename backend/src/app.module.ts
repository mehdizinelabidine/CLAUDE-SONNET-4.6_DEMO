import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { StorageModule } from "./storage/storage.module";
import { UsersModule } from "./users/users.module";
import { TimesheetsModule } from "./timesheets/timesheets.module";
import { SummariesModule } from "./summaries/summaries.module";
import { MetricsModule } from "./metrics/metrics.module";
import { ReportsModule } from "./reports/reports.module";
import { AuthModule } from "./auth/auth.module";
import { AuthGuard } from "./auth/auth.guard";

@Module({
  imports: [
    StorageModule,
    AuthModule,
    UsersModule,
    TimesheetsModule,
    SummariesModule,
    MetricsModule,
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
