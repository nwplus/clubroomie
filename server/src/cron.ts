import { CronJob } from "cron";
import { checkExpirations } from "./firebase";

export function initializeSweeper() {
  if (!process.env.EXPIRATION_CHECK_CRON)
    throw new Error("EXPIRATION_CHECK_CRON env missing!");
  console.log("Monitoring expirations...");
  const job = new CronJob(process.env.EXPIRATION_CHECK_CRON, async () => {
    const expired = await checkExpirations();
    if (expired.length > 0) console.log("Expiring", expired);
  });
  job.start();
  return job;
}
