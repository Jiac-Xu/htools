import { createArticleBrowseHref } from "./admin-display";
import { createToolPreviewSource } from "./tool-helpers";
import type { ArticleSummary, Tool } from "./types";
import type { Locale } from "./i18n";

export const TELEGRAM_MESSAGE_LIMIT = 32768;

export type TelegramResourceType = "tool" | "article";

export type TelegramPushResource = {
  type: TelegramResourceType;
  id: string;
  title: string;
  description: string;
  url: string;
  demoUrl: string;
  image: string;
  tags: string[];
};

export function createTelegramToolResource(tool: Tool): TelegramPushResource {
  return {
    type: "tool",
    id: tool.id,
    title: tool.name,
    description: tool.description,
    url: tool.url,
    demoUrl: tool.demoUrl,
    image: createToolPreviewSource(tool),
    tags: tool.tags
  };
}

export function createTelegramArticleResource(
  article: ArticleSummary,
  origin: string
): TelegramPushResource {
  return {
    type: "article",
    id: article.id,
    title: article.title,
    description: article.summary,
    url: resolveTelegramResourceUrl(
      createArticleBrowseHref(article.slug, article.published),
      origin
    ),
    demoUrl: "",
    image: resolveTelegramResourceUrl(article.coverImage, origin),
    tags: Array.from(new Set([article.category, ...article.tags].filter(Boolean)))
  };
}

export function createDefaultTelegramBody(resource: TelegramPushResource) {
  const description = escapeTelegramText(resource.description);
  const title = escapeTelegramText(resource.title);
  return description ? `**${title}**\n\n${description}` : `**${title}**`;
}

export function buildTelegramPreviewMarkdown(
  resource: TelegramPushResource,
  bodyMarkdown: string,
  footerMarkdown: string,
  locale: "zh" | "en"
) {
  const labels = locale === "zh"
    ? { article: "文章地址", project: "项目地址", demo: "演示地址" }
    : { article: "Article", project: "Project", demo: "Demo" };
  const tags = resource.tags.map(toTelegramHashtag).filter(Boolean).join(" ");
  const linkLabel = resource.type === "article" ? labels.article : labels.project;

  return [
    bodyMarkdown.trim(),
    tags,
    `${linkLabel}：${resource.url}`,
    resource.demoUrl ? `${labels.demo}：${resource.demoUrl}` : "",
    footerMarkdown.trim()
  ].filter(Boolean).join("\n\n");
}

export function createTelegramResourceMediaUrl(resource: TelegramPushResource) {
  if (resource.type === "article") return resource.image;
  if (resource.image) return resource.image;
  return resource.url
    ? `https://image.thum.io/get/width/1200/crop/720/${resource.url}`
    : "";
}

export function countTelegramMessageCharacters(value: string) {
  return Array.from(value).length;
}

export function escapeTelegramPreviewHashtags(value: string) {
  return value
    .split("\n")
    .map((line) => /^#[^#\s]/u.test(line) ? `\\${line}` : line)
    .join("\n");
}

export function getTelegramText(locale: Locale) {
  return locale === "zh"
    ? {
        action: "Telegram 推送",
        title: "Telegram 推送",
        description: "编辑当前内容的 Telegram 推送信息，固定消息尾巴由系统自动附加。",
        statuses: {
          not_pushed: "未推送",
          pending: "已保存，等待推送",
          synced: "已与 Telegram 同步"
        },
        messageNotFound: "原 Telegram 消息已不存在。清除旧消息记录后，可以手动重新推送。",
        targetChanged: "Telegram 发送目标已经改变。请重新建立推送，再将当前内容手动推送到新目标。",
        permissionDenied: "机器人当前没有发送或编辑目标消息的权限，请先调整 Telegram 权限后重试。",
        recoverMessage: "重新建立推送",
        recovered: "旧消息记录已清除，请手动重新推送。",
        bodyLabel: "Markdown 正文",
        restoreDefault: "恢复",
        previewTitle: "消息预览",
        mediaLabel: "推送图片",
        mediaEnabled: "开启图片",
        mediaDisabled: "关闭图片",
        mediaUrlLabel: "图片地址",
        mediaUrlPlaceholder: "https://example.com/preview.png",
        mediaHelp: "开启后使用当前内容的预览图，可替换为其他公开图片地址。",
        mediaInvalid: "发送图片时请填写有效的图片地址。",
        fixedContent: "自动附加内容",
        save: "保存",
        send: "推送",
        update: "更新",
        saved: "Telegram 推送内容已保存。",
        restored: "已恢复默认正文和图片设置。",
        sent: "已推送到 Telegram。",
        updated: "Telegram 推送已更新。",
        loading: "正在加载消息预览。",
        tooLong: "完整消息超过 Telegram 的 32768 字符限制。"
      }
    : {
        action: "Telegram Push",
        title: "Telegram Push",
        description: "Edit the current Telegram message; the fixed message footer is appended automatically.",
        statuses: {
          not_pushed: "Not pushed",
          pending: "Saved, waiting to push",
          synced: "Synced with Telegram"
        },
        messageNotFound: "The original Telegram message no longer exists. Clear its old record, then push it manually again.",
        targetChanged: "The Telegram target has changed. Rebuild the push, then send the current content to the new target manually.",
        permissionDenied: "The bot cannot send or edit the target message. Update its Telegram permissions, then try again.",
        recoverMessage: "Rebuild Push",
        recovered: "The old message record was cleared. Push the content manually again.",
        bodyLabel: "Markdown content",
        restoreDefault: "Reset",
        previewTitle: "Message preview",
        mediaLabel: "Push image",
        mediaEnabled: "Enable image",
        mediaDisabled: "Disable image",
        mediaUrlLabel: "Image URL",
        mediaUrlPlaceholder: "https://example.com/preview.png",
        mediaHelp: "When enabled, uses the current item's preview image; replace it with another public image URL if needed.",
        mediaInvalid: "Enter a valid image URL when image sending is enabled.",
        fixedContent: "Automatically appended",
        save: "Save",
        send: "Push",
        update: "Update",
        saved: "Telegram push content saved.",
        restored: "Default content and image settings restored.",
        sent: "Pushed to the Telegram chat.",
        updated: "Telegram push updated.",
        loading: "Loading message preview.",
        tooLong: "The complete message exceeds Telegram's 32768-character limit."
      };
}

function toTelegramHashtag(value: string) {
  const normalized = value.trim().replace(/^#+/, "").replace(/[^\p{L}\p{N}_]+/gu, "_");
  return normalized ? `#${normalized.replace(/^_+|_+$/g, "")}` : "";
}

function resolveTelegramResourceUrl(value: string, origin: string) {
  if (!value.trim()) return "";
  try {
    return new URL(value, origin).toString();
  } catch {
    return "";
  }
}

function escapeTelegramText(value: string) {
  return value.trim().replace(/\\/g, "\\\\").replace(/\*/g, "\\*");
}
