import { CronJob } from "cron";
import { checkExpirations } from "./firebase";
import { EXPIRATION_CHECK_CRON } from "./constants";

export function initializeSweeper() {
  console.log("Monitoring expirations...");
  const job = new CronJob(EXPIRATION_CHECK_CRON, async () => {
    const expired = await checkExpirations();
    if (expired.length > 0) console.log("Expired:", expired);
  });
  job.start();
  return job;
}
