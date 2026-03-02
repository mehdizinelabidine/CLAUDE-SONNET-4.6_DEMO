import * as fs from "fs/promises";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

const DATA_DIR = path.join(__dirname, "../../data");

interface User {
  id: string;
  name: string;
  email: string;
  role: "employee" | "admin";
  createdAt: string;
}

const EMPLOYEE_NAMES = [
  "Alice Johnson",
  "Bob Smith",
  "Carol Williams",
  "David Brown",
  "Emma Davis",
  "Frank Miller",
  "Grace Wilson",
  "Henry Moore",
  "Isabella Taylor",
  "James Anderson",
  "Karen Thomas",
  "Liam Jackson",
  "Mia White",
  "Noah Harris",
  "Olivia Martin",
  "Peter Garcia",
  "Quinn Martinez",
  "Rachel Lewis",
  "Samuel Lee",
  "Tina Walker",
];

const ADMIN_NAMES = ["Admin One", "Admin Two"];

async function seed() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  const now = new Date().toISOString();

  const employees: User[] = EMPLOYEE_NAMES.map((name, i) => ({
    id: `emp-${String(i + 1).padStart(3, "0")}`,
    name,
    email: `${name.toLowerCase().replace(" ", ".")}@company.com`,
    role: "employee",
    createdAt: now,
  }));

  const admins: User[] = ADMIN_NAMES.map((name, i) => ({
    id: `adm-${String(i + 1).padStart(3, "0")}`,
    name,
    email: `${name.toLowerCase().replace(" ", ".")}@company.com`,
    role: "admin",
    createdAt: now,
  }));

  const users: User[] = [...admins, ...employees];

  // Seed some timesheet entries for the current week
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);

  const timesheets: Array<{
    id: string;
    userId: string;
    date: string;
    status: "onsite" | "wfh" | "leave";
    createdAt: string;
  }> = [];
  const statuses: Array<"onsite" | "wfh" | "leave"> = [
    "onsite",
    "onsite",
    "onsite",
    "onsite",
    "onsite",
    "onsite",
    "onsite",
    "onsite",
    "onsite",
    "wfh",
    "wfh",
    "wfh",
    "leave",
    "onsite",
    "onsite",
    "wfh",
    "onsite",
    "onsite",
    "leave",
    "onsite",
  ];

  employees.forEach((emp, idx) => {
    // Add 3 days for each employee (Mon, Tue, Wed)
    for (let d = 0; d < 3; d++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + d);
      const dateStr = date.toISOString().slice(0, 10);
      const status = statuses[idx % statuses.length];

      timesheets.push({
        id: uuidv4(),
        userId: emp.id,
        date: dateStr,
        status: d > 0 && status === "wfh" && d > 2 ? "onsite" : status,
        createdAt: now,
      });
    }
  });

  const metrics = {
    apiCalls: 42,
    totalValidationMs: 1250,
    validationCount: 28,
    submissionsPerWeek: {},
    violationsPerWeek: {},
  };

  await fs.writeFile(
    path.join(DATA_DIR, "users.json"),
    JSON.stringify(users, null, 2),
  );
  await fs.writeFile(
    path.join(DATA_DIR, "timesheets.json"),
    JSON.stringify(timesheets, null, 2),
  );
  await fs.writeFile(
    path.join(DATA_DIR, "metrics.json"),
    JSON.stringify(metrics, null, 2),
  );

  console.log(
    `✅ Seeded ${users.length} users (${admins.length} admins, ${employees.length} employees)`,
  );
  console.log(`✅ Seeded ${timesheets.length} timesheet entries`);
  console.log(`Data written to: ${DATA_DIR}`);
}

seed().catch(console.error);
