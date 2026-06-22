import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { passwordManagerOptOutProps } from '../../../lib/password-manager';
import type { SharedGeneratedShare, SharedLocalSaveDraft } from './types';

export function CreateFlowLocalSaveCard({
  share,
  draft,
  actionLabel,
  actionVariant = 'default',
  title = share.name,
  subtitle = `Member ${share.member_idx}`,
  labelInputLabel = 'Device label',
  primarySecretLabel,
  secondarySecretLabel,
  relayLabel = 'Relay URLs',
  relayPlaceholder = 'One relay URL per line',
  onLabelChange,
  onPrimarySecretChange,
  onSecondarySecretChange,
  onRelayUrlsChange,
  onAction,
}: {
  share: SharedGeneratedShare;
  draft: SharedLocalSaveDraft;
  actionLabel: string;
  actionVariant?: 'default' | 'secondary';
  title?: string;
  subtitle?: string;
  labelInputLabel?: string;
  primarySecretLabel: string;
  secondarySecretLabel?: string;
  relayLabel?: string;
  relayPlaceholder?: string;
  onLabelChange: (value: string) => void;
  onPrimarySecretChange: (value: string) => void;
  onSecondarySecretChange?: (value: string) => void;
  onRelayUrlsChange: (value: string) => void;
  onAction: () => void;
}) {
  return (
    <section className="igloo-panel igloo-stack">
      <div>
        <strong>{title}</strong>
        <p className="igloo-message-muted">{subtitle}</p>
      </div>
      <div className="igloo-two-up">
        <label>
          {labelInputLabel}
          <input
            value={draft.label}
            onChange={(event) => onLabelChange(event.target.value)}
          />
        </label>
        <label>
          {primarySecretLabel}
          <input
            type="password"
            {...passwordManagerOptOutProps}
            value={draft.primarySecret}
            onChange={(event) => onPrimarySecretChange(event.target.value)}
          />
        </label>
      </div>
      {secondarySecretLabel ? (
        <label>
          {secondarySecretLabel}
          <input
            type="password"
            {...passwordManagerOptOutProps}
            value={draft.secondarySecret ?? ''}
            onChange={(event) => onSecondarySecretChange?.(event.target.value)}
          />
        </label>
      ) : null}
      <label>
        {relayLabel}
        <Textarea
          className="min-h-[96px]"
          placeholder={relayPlaceholder}
          value={draft.relayUrls}
          onChange={(event) => onRelayUrlsChange(event.target.value)}
        />
      </label>
      <div className="igloo-button-row">
        <Button
          type="button"
          size="sm"
          variant={actionVariant}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </div>
    </section>
  );
}
