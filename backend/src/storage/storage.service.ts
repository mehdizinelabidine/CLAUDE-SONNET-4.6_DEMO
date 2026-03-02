import { Injectable, OnModuleInit } from "@nestjs/common";
import * as fs from "fs/promises";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

@Injectable()
export class StorageService implements OnModuleInit {
  async onModuleInit() {
    await this.ensureDataDir();
    await this.ensureFile("users.json", []);
    await this.ensureFile("timesheets.json", []);
    await this.ensureFile("metrics.json", {
      apiCalls: 0,
      totalValidationMs: 0,
      validationCount: 0,
      submissionsPerWeek: {},
      violationsPerWeek: {},
    });
  }

  private async ensureDataDir() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch {
      // already exists
    }
  }

  private async ensureFile(filename: string, defaultValue: unknown) {
    const filepath = path.join(DATA_DIR, filename);
    try {
      await fs.access(filepath);
    } catch {
      await fs.writeFile(filepath, JSON.stringify(defaultValue, null, 2));
    }
  }

  private filePath(filename: string): string {
    return path.join(DATA_DIR, filename);
  }

  async read<T>(filename: string): Promise<T> {
    const content = await fs.readFile(this.filePath(filename), "utf-8");
    return JSON.parse(content) as T;
  }

  async write<T>(filename: string, data: T): Promise<void> {
    await fs.writeFile(
      this.filePath(filename),
      JSON.stringify(data, null, 2),
      "utf-8",
    );
  }

  async readUsers<T>(): Promise<T[]> {
    return this.read<T[]>("users.json");
  }

  async writeUsers<T>(data: T[]): Promise<void> {
    return this.write("users.json", data);
  }

  async readTimesheets<T>(): Promise<T[]> {
    return this.read<T[]>("timesheets.json");
  }

  async writeTimesheets<T>(data: T[]): Promise<void> {
    return this.write("timesheets.json", data);
  }

  async readMetrics<T>(): Promise<T> {
    return this.read<T>("metrics.json");
  }

  async writeMetrics<T>(data: T): Promise<void> {
    return this.write("metrics.json", data);
  }
}
