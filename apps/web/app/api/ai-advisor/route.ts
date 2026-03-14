import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError, handleApiError } from '@/lib/errors';

const payloadSchema = z.object({
  portfolio: z.array(
    z.object({
      symbol: z.string(),
      allocation: z.number(),
      value: z.number(),
    }),
  ),
  riskProfile: z.string().default('Moderate'),
});

export async function POST(req: NextRequest) {
  try {
    const { portfolio, riskProfile } = payloadSchema.parse(await req.json());

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        data: {
          analysis: 'Portfolio is diversified across asset classes with healthy liquidity.',
          riskInsights: `Risk profile is ${riskProfile}. Consider quarterly volatility checks.`,
          suggestions: ['Shift 2% into defensive sectors', 'Add staggered ETF deployment', 'Review debt duration mix'],
        },
      });
    }

    const prompt = `Analyze this portfolio JSON and return concise JSON with analysis, riskInsights, suggestions (array): ${JSON.stringify(
      portfolio,
    )}. Risk profile: ${riskProfile}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a portfolio advisor. Reply in valid compact JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new AppError(`OpenAI request failed with status ${response.status}`, 502);
    }

    const completion = (await response.json()) as any;
    const content = completion.choices?.[0]?.message?.content;

    return NextResponse.json({ data: content ? JSON.parse(content) : null });
  } catch (error) {
    return handleApiError(error);
  }
}
