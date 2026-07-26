import {
  readTelegramResourceType,
  recoverTelegramMessage,
  writeTelegramErrorResponse
} from "../../../../../_telegram";
import { json, requireAdmin, type Env } from "../../../../../_shared";

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const unauthorized = await requireAdmin(request, env);
  if (unauthorized) return unauthorized;

  try {
    const url = new URL(request.url);
    const payload = (await request.json()) as {
      bodyMarkdown?: unknown;
      mediaEnabled?: unknown;
      mediaUrl?: unknown;
    };
    return json({
      message: await recoverTelegramMessage(
        env,
        readTelegramResourceType(params.resourceType),
        String(params.id ?? ""),
        url.origin,
        payload,
        url.searchParams.get("locale") === "en" ? "en" : "zh"
      )
    });
  } catch (error) {
    return writeTelegramErrorResponse(error, "Unable to recover Telegram message.");
  }
};
