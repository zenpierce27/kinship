import { describe, it, expect } from 'vitest';
import { buildEmbeddingText } from '../lib/embeddings.js';

// Production formatter used by add and embed-stale; no credentials or services.
describe('contact text for embeddings', () => {
  it('includes supplied context in a stable, readable order', () => {
    expect(buildEmbeddingText({
      full_name: 'Example Person', current_company: 'Example Org',
      job_title: 'Designer', how_we_met: 'Community event',
      notes: 'Interested in ceramics',
    })).toBe('Example Person. works at Example Org. as Designer. met: Community event. Interested in ceramics');
  });

  it('supports a name without optional context', () => {
    expect(buildEmbeddingText({ full_name: 'Example Person' })).toBe('Example Person');
  });

  it('omits empty and null fields without empty separators', () => {
    expect(buildEmbeddingText({
      full_name: 'Example Person', current_company: null,
      job_title: '', how_we_met: null, notes: 'A useful note',
    })).toBe('Example Person. A useful note');
  });
});
