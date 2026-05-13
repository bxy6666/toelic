import {
  DEFAULT_MAAS_BASE_URL,
  DEFAULT_MAAS_MODEL,
} from "@/lib/constants";
import { AppError } from "@/lib/errors";

type MaasChatMessage = {
  role: "system" | "user";
  content: string;
};

type MaasChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function getMaasConfig() {
  const apiKey = process.env.MAAS_API_KEY?.trim();

  if (!apiKey) {
    throw new AppError(
      "MAAS_CONFIG_MISSING",
      "未配置 MaaS API Key，请在本机 .env.local 中配置。",
      400,
    );
  }

  return {
    apiKey,
    baseUrl: process.env.MAAS_BASE_URL || DEFAULT_MAAS_BASE_URL,
    model: process.env.MAAS_MODEL || DEFAULT_MAAS_MODEL,
  };
}

function buildChatCompletionsUrl(baseUrl: string) {
  return `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
}

export async function generateTextWithMaas(messages: MaasChatMessage[]) {
  const { apiKey, baseUrl, model } = getMaasConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch(buildChatCompletionsUrl(baseUrl), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AppError(
        "AI_GENERATION_FAILED",
        "MaaS 生成失败，请稍后重试。",
        502,
      );
    }

    const data = (await response.json()) as MaasChatResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content?.trim()) {
      throw new AppError(
        "AI_RESPONSE_INVALID",
        "MaaS 返回内容为空或格式不正确。",
        502,
      );
    }

    return content;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "AI_GENERATION_FAILED",
      "MaaS 请求失败，请检查网络或稍后重试。",
      502,
    );
  } finally {
    clearTimeout(timeout);
  }
}
