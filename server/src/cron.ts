import { CronJob } from "cron";
import { checkExpirations } from "./firebase";
import { EXPIRATION_CHECK_CRON } from "./constants";

export function initializeSweeper() {
  console.log("Monitoring expirations...");
  const job = new CronJob(EXPIRATION_CHECK_CRON, async () => {
    console.log("Checking expirations...");
    const expired = await checkExpirations();
    console.log("Expired:", expired);
  });
  job.start();
  return job;
}
