import { Injectable, OnModuleInit } from "@nestjs/common";
import * as fs from "fs/promises";
import * as path from "path";

const IS_VERCEL = !!process.env.VERCEL;
const SEED_DATA_DIR = path.join(process.cwd(), "data");
const DATA_DIR = IS_VERCEL ? path.join("/tmp", "data") : SEED_DATA_DIR;

@Injectable()
export class StorageService implements OnModuleInit {
  async onModuleInit() {
    await this.ensureDataDir();

    if (IS_VERCEL) {
      // On Vercel, copy seed data from the read-only bundle to writable /tmp
      await this.copySeedFileIfMissing("users.json", []);
      await this.copySeedFileIfMissing("timesheets.json", []);
      await this.copySeedFileIfMissing("metrics.json", {
        apiCalls: 0,
        totalValidationMs: 0,
        validationCount: 0,
        submissionsPerWeek: {},
        violationsPerWeek: {},
      });
    } else {
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
  }

  private async ensureDataDir() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch {
      // already exists
    }
  }

  /** On Vercel: copy bundled seed file to /tmp if it doesn't already exist there */
  private async copySeedFileIfMissing(filename: string, defaultValue: unknown) {
    const dest = path.join(DATA_DIR, filename);
    try {
      await fs.access(dest);
    } catch {
      // File not in /tmp yet — try copying from bundled seed data
      const src = path.join(SEED_DATA_DIR, filename);
      try {
        await fs.copyFile(src, dest);
      } catch {
        // Seed file not bundled; create with defaults
        await fs.writeFile(dest, JSON.stringify(defaultValue, null, 2));
      }
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
