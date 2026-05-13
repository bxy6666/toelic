import { AppError } from "@/lib/errors";

type OpenAiImageResponse = {
  data?: Array<{
    b64_json?: string;
  }>;
};

const DEFAULT_OPENAI_IMAGE_MODEL = "gpt-image-2";
const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations";

function getOpenAiImageConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new AppError(
      "OPENAI_IMAGE_CONFIG_MISSING",
      "未配置 OpenAI API Key，请在本机 .env.local 中配置 OPENAI_API_KEY。",
      400,
    );
  }

  return {
    apiKey,
    model: process.env.OPENAI_IMAGE_MODEL || DEFAULT_OPENAI_IMAGE_MODEL,
  };
}

export async function generateImageDataUrl(imagePrompt: string) {
  const { apiKey, model } = getOpenAiImageConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);

  try {
    const response = await fetch(OPENAI_IMAGES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "low",
        output_format: "png",
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AppError(
        "OPENAI_IMAGE_GENERATION_FAILED",
        "OpenAI 图片生成失败，请稍后重试。",
        502,
      );
    }

    const data = (await response.json()) as OpenAiImageResponse;
    const imageBase64 = data.data?.[0]?.b64_json;

    if (!imageBase64?.trim()) {
      throw new AppError(
        "OPENAI_IMAGE_RESPONSE_INVALID",
        "OpenAI 图片生成返回内容为空或格式不正确。",
        502,
      );
    }

    return `data:image/png;base64,${imageBase64}`;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "OPENAI_IMAGE_GENERATION_FAILED",
      "OpenAI 图片生成请求失败，请检查网络或稍后重试。",
      502,
    );
  } finally {
    clearTimeout(timeout);
  }
}
