import { NextRequest, NextResponse } from 'next/server';
import { fromPrompt, generateWithSteps } from '@kraken-lab/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  prompt?: string;
  withSteps?: boolean;
  model?: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ error: 'El prompt es obligatorio.' }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY no configurada en el servidor.' },
      { status: 500 },
    );
  }

  try {
    if (body.withSteps) {
      const result = await generateWithSteps(prompt, { model: body.model });
      return NextResponse.json(result);
    }
    const result = await fromPrompt(prompt, { model: body.model });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
