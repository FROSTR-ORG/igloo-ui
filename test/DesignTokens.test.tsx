import { describe, expect, it } from 'vitest';

import { IGLOO_COLOR_TOKENS, IGLOO_TYPOGRAPHY_TOKENS, iglooTokenCssVariables } from '../src';

describe('design tokens', () => {
  it('exposes canonical colors and typography as package tokens', () => {
    expect(IGLOO_COLOR_TOKENS.primary.blue400).toBe('#60A5FA');
    expect(IGLOO_COLOR_TOKENS.surface.slate90060).toBe('#0F172A99');
    expect(IGLOO_COLOR_TOKENS.status.success).toBe('#22C55E');

    expect(IGLOO_TYPOGRAPHY_TOKENS.fontFamily.inter).toBe('"Inter", system-ui, sans-serif');
    expect(IGLOO_TYPOGRAPHY_TOKENS.typeScale.body.fontFamily).toBe('var(--igloo-font-inter)');
    expect(IGLOO_TYPOGRAPHY_TOKENS.typeScale.valueData.fontFamily).toBe('var(--igloo-font-share-tech-mono)');
  });

  it('maps token names to the CSS variables used by the stylesheet', () => {
    expect(iglooTokenCssVariables.color.primary.blue400).toBe('var(--igloo-color-blue-400)');
    expect(iglooTokenCssVariables.color.text.primary).toBe('var(--igloo-color-slate-200)');
    expect(iglooTokenCssVariables.font.body).toBe('var(--igloo-font-inter)');
    expect(iglooTokenCssVariables.font.value).toBe('var(--igloo-font-share-tech-mono)');
  });
});
