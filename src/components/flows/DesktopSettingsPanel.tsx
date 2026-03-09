import * as React from 'react';

type AppSettings = {
  close_to_tray: boolean;
  launch_on_login: boolean;
  reopen_last_session: boolean;
};

type Props = {
  settings: AppSettings;
  onToggle: (field: keyof AppSettings, checked: boolean) => void;
};

export function DesktopSettingsPanel({ settings, onToggle }: Props) {
  return (
    <section className="panel-grid">
      <section className="panel panel-span">
        <div className="panel-head">
          <h3>Desktop Lifecycle Settings</h3>
        </div>
        <div className="settings-grid">
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={settings.close_to_tray}
              onChange={(event) => onToggle('close_to_tray', event.target.checked)}
            />
            <span>
              <strong>Close to tray</strong>
              <small>Hide the window instead of prompting for a stop/quit action while a signer is active.</small>
            </span>
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={settings.launch_on_login}
              onChange={(event) => onToggle('launch_on_login', event.target.checked)}
            />
            <span>
              <strong>Launch on login</strong>
              <small>Register the desktop app for system startup. This does not unlock or auto-start a signer.</small>
            </span>
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={settings.reopen_last_session}
              onChange={(event) => onToggle('reopen_last_session', event.target.checked)}
            />
            <span>
              <strong>Reopen last session</strong>
              <small>Remember the previous signer metadata and offer restart shortcuts from the UI and tray.</small>
            </span>
          </label>
        </div>
      </section>
    </section>
  );
}
