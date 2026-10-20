import { VALKEY_URL } from "astro:env/server";
import { Valkey } from "iovalkey";

const valkey = async () => {
  const vk = new Valkey({
    host: VALKEY_URL,
    readOnly: true,
    maxLoadingRetryTime: 2,
    retryStrategy: () => null,
    maxRetriesPerRequest: 1,
    keepAlive: 10000,
    commandTimeout: 2000,
    sentinelMaxConnections: 25,
  });

  try {
    await vk.ping();
    return vk;
  } catch (error) {
    console.error("Valkey connection ping failed:", error);
    await vk.quit().catch(() => {});
    process.exit(1);
  }
};

export const client = await valkey();
