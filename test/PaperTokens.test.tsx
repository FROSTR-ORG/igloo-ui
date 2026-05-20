import { describe, expect, it } from 'vitest';

import { PAPER_COLOR_TOKENS, PAPER_TYPOGRAPHY_TOKENS, paperTokenCssVariables } from '../src';

describe('paper design tokens', () => {
  it('exposes canonical Paper colors and typography as package tokens', () => {
    expect(PAPER_COLOR_TOKENS.primary.blue400).toBe('#60A5FA');
    expect(PAPER_COLOR_TOKENS.surface.slate90060).toBe('#0F172A99');
    expect(PAPER_COLOR_TOKENS.status.success).toBe('#22C55E');

    expect(PAPER_TYPOGRAPHY_TOKENS.fontFamily.inter).toBe('"Inter", system-ui, sans-serif');
    expect(PAPER_TYPOGRAPHY_TOKENS.typeScale.body.fontFamily).toBe('var(--igloo-font-inter)');
    expect(PAPER_TYPOGRAPHY_TOKENS.typeScale.valueData.fontFamily).toBe('var(--igloo-font-share-tech-mono)');
  });

  it('maps token names to the CSS variables used by the stylesheet', () => {
    expect(paperTokenCssVariables.color.primary.blue400).toBe('var(--igloo-color-blue-400)');
    expect(paperTokenCssVariables.color.text.primary).toBe('var(--igloo-color-slate-200)');
    expect(paperTokenCssVariables.font.body).toBe('var(--igloo-font-inter)');
    expect(paperTokenCssVariables.font.value).toBe('var(--igloo-font-share-tech-mono)');
  });
});
