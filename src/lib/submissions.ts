import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type Submission = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  businessName: string;
  businessType: string;
};

export type SubmissionInput = Omit<Submission, "id" | "createdAt">;

const DATA_FILE = path.join(process.cwd(), "data", "submissions.ndjson");

async function ensureDir() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
}

export async function saveSubmission(input: SubmissionInput): Promise<Submission> {
  await ensureDir();
  const rec: Submission = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  await fs.appendFile(DATA_FILE, JSON.stringify(rec) + "\n", "utf-8");
  return rec;
}

export async function listSubmissions(): Promise<Submission[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return data
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as Submission)
      .reverse();
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}
