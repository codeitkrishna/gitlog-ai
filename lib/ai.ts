import Anthropic, {
  APIError as AnthropicAPIError,
  RateLimitError as AnthropicRateLimitError,
} from '@anthropic-ai/sdk'
import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
} from '@google/generative-ai'

type AIProvider = 'gemini' | 'anthropic'

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview'
const DEFAULT_ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929'

let geminiClient: GoogleGenerativeAI | null = null
let anthropicClient: Anthropic | null = null

export async function generateWithAI(prompt: string): Promise<string> {
  const providerOrder = getProviderOrder()
  let lastError: Error | null = null

  for (let index = 0; index < providerOrder.length; index += 1) {
    const provider = providerOrder[index]

    try {
      return await generateWithProvider(provider, prompt)
    } catch (error) {
      console.error(`${provider} generation error:`, error)

      lastError = normalizeProviderError(error, provider)
      const hasFallbackProvider = index < providerOrder.length - 1

      if (!hasFallbackProvider || !shouldTryFallback(error)) {
        throw lastError
      }
    }
  }

  throw lastError ?? new Error('AI generation failed due to an unknown error')
}

async function generateWithProvider(provider: AIProvider, prompt: string): Promise<string> {
  if (provider === 'gemini') {
    return generateWithGemini(prompt)
  }

  return generateWithAnthropic(prompt)
}

async function generateWithGemini(prompt: string): Promise<string> {
  const model = getGeminiClient().getGenerativeModel({ model: DEFAULT_GEMINI_MODEL })
  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  if (!text) {
    throw new Error('Gemini returned an empty response')
  }

  return text
}

async function generateWithAnthropic(prompt: string): Promise<string> {
  const message = await getAnthropicClient().messages.create({
    model: DEFAULT_ANTHROPIC_MODEL,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content.reduce((combinedText, block) => {
    if (block.type === 'text') {
      return combinedText + block.text
    }

    return combinedText
  }, '').trim()

  if (!text) {
    throw new Error('Anthropic returned an empty response')
  }

  return text
}

function getProviderOrder(): AIProvider[] {
  const preferredProvider = process.env.AI_PROVIDER?.toLowerCase()
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)
  const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY)

  if (preferredProvider && preferredProvider !== 'gemini' && preferredProvider !== 'anthropic') {
    throw new Error('Unsupported AI_PROVIDER. Use "gemini" or "anthropic".')
  }

  if (!hasGeminiKey && !hasAnthropicKey) {
    throw new Error(
      'Missing AI API key. Set GEMINI_API_KEY, GOOGLE_API_KEY, or ANTHROPIC_API_KEY.'
    )
  }

  if (preferredProvider === 'gemini') {
    if (!hasGeminiKey) {
      throw new Error('AI_PROVIDER is set to "gemini" but no Gemini API key was found.')
    }

    return hasAnthropicKey ? ['gemini', 'anthropic'] : ['gemini']
  }

  if (preferredProvider === 'anthropic') {
    if (!hasAnthropicKey) {
      throw new Error('AI_PROVIDER is set to "anthropic" but no Anthropic API key was found.')
    }

    return hasGeminiKey ? ['anthropic', 'gemini'] : ['anthropic']
  }

  if (hasGeminiKey && hasAnthropicKey) {
    return ['gemini', 'anthropic']
  }

  return hasGeminiKey ? ['gemini'] : ['anthropic']
}

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

  if (!apiKey) {
    throw new Error('Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_API_KEY.')
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(apiKey)
  }

  return geminiClient
}

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('Missing Anthropic API key. Set ANTHROPIC_API_KEY.')
  }

  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey })
  }

  return anthropicClient
}

function shouldTryFallback(error: unknown): boolean {
  const status = getErrorStatus(error)

  if (status === 401 || status === 403 || status === 429) {
    return true
  }

  return typeof status === 'number' && status >= 500
}

function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof GoogleGenerativeAIFetchError || error instanceof AnthropicAPIError) {
    return error.status
  }

  return undefined
}

function normalizeProviderError(error: unknown, provider: AIProvider): Error {
  if (provider === 'gemini') {
    return normalizeGeminiError(error)
  }

  return normalizeAnthropicError(error)
}

function normalizeGeminiError(error: unknown): Error {
  if (error instanceof GoogleGenerativeAIFetchError) {
    if (error.status === 401 || error.status === 403) {
      return new Error('Invalid Gemini API key. Check GEMINI_API_KEY or GOOGLE_API_KEY.')
    }

    if (error.status === 429) {
      return new Error(buildGeminiQuotaMessage(error))
    }

    if (typeof error.status === 'number' && error.status >= 500) {
      return new Error('Gemini is temporarily unavailable. Please try again in a moment.')
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('API_KEY') || error.message.includes('401')) {
      return new Error('Invalid Gemini API key. Check GEMINI_API_KEY or GOOGLE_API_KEY.')
    }

    return new Error(`Gemini generation failed: ${error.message}`)
  }

  return new Error('Gemini generation failed due to an unknown error')
}

function normalizeAnthropicError(error: unknown): Error {
  if (error instanceof AnthropicRateLimitError) {
    return new Error('Anthropic rate limit reached. Please wait a moment and try again.')
  }

  if (error instanceof AnthropicAPIError) {
    if (error.status === 401 || error.status === 403) {
      return new Error('Invalid Anthropic API key. Check ANTHROPIC_API_KEY.')
    }

    if (error.status === 429) {
      return new Error('Anthropic rate limit reached. Please wait a moment and try again.')
    }

    if (typeof error.status === 'number' && error.status >= 500) {
      return new Error('Anthropic is temporarily unavailable. Please try again in a moment.')
    }
  }

  if (error instanceof Error) {
    return new Error(`Anthropic generation failed: ${error.message}`)
  }

  return new Error('Anthropic generation failed due to an unknown error')
}

function buildGeminiQuotaMessage(error: GoogleGenerativeAIFetchError): string {
  const message = error.message.toLowerCase()
  const retryDelay = extractRetryDelay(error.message)
  const hasNoProjectQuota = message.includes('limit: 0')

  if (hasNoProjectQuota) {
    return 'Gemini quota is unavailable for this project. Add billing, use a project with quota, or switch to another provider.'
  }

  if (retryDelay) {
    return `Gemini rate limit reached. Please retry in about ${retryDelay}.`
  }

  return 'Gemini rate limit reached. Please wait a moment and try again.'
}

function extractRetryDelay(message: string): string | null {
  const match = message.match(/Please retry in ([^.\]]+)/i)

  return match?.[1]?.trim() ?? null
}
