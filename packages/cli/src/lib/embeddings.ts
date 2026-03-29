const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const EMBEDDING_MODEL = 'gemini-embedding-001';
const TARGET_DIMS = 1536; // Match DB column

export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!GOOGLE_API_KEY) {
    console.warn('GOOGLE_API_KEY not set, skipping embedding generation');
    return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${EMBEDDING_MODEL}`,
          content: { parts: [{ text }] },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Embedding API error:', error);
      return null;
    }

    const data = await response.json();
    const fullEmbedding = data.embedding?.values;
    
    if (!fullEmbedding) return null;
    
    // Truncate to target dimensions (common practice, preserves most semantic info)
    return fullEmbedding.slice(0, TARGET_DIMS);
  } catch (error) {
    console.error('Embedding generation failed:', error);
    return null;
  }
}

export function buildEmbeddingText(person: {
  full_name: string;
  current_company?: string | null;
  job_title?: string | null;
  notes?: string | null;
  how_we_met?: string | null;
}): string {
  const parts = [
    person.full_name,
    person.current_company && `works at ${person.current_company}`,
    person.job_title && `as ${person.job_title}`,
    person.how_we_met && `met: ${person.how_we_met}`,
    person.notes,
  ].filter(Boolean);
  
  return parts.join('. ');
}
