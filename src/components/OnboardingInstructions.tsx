import React from 'react';
import { ArrowRight, ExternalLink, Globe } from 'lucide-react';
import { Button } from './ui/button';

interface OnboardingInstructionsProps {
  onContinue: () => void;
  appName?: string;
  subtitle?: string;
}

export const OnboardingInstructions: React.FC<OnboardingInstructionsProps> = ({
  onContinue,
  appName = 'igloo',
  subtitle = 'A browser-based threshold signing node for the FROSTR protocol'
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <div className="flex items-center justify-center">
          <div className="rounded-xl border border-blue-600/20 bg-blue-600/10 p-3">
            <Globe className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-blue-200">Welcome to {appName}</h2>
        <p className="mx-auto max-w-sm text-sm text-blue-300/70">{subtitle}</p>
      </div>

      <div className="space-y-2 rounded-lg border border-blue-900/30 bg-gray-800/30 p-4">
        <p className="text-sm leading-relaxed text-blue-100/80">
          {appName} runs as a remote signer for your Nostr private key using FROSTR threshold signatures.
          Your private key is split into shares, and signing requires multiple shares to cooperate.
          The full key is never reconstructed.
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-amber-700/30 bg-amber-900/20 p-4">
        <h3 className="text-sm font-semibold text-amber-200">Before You Start</h3>
        <p className="text-sm leading-relaxed text-amber-100/80">
          You will need a <span className="font-medium text-amber-200">v2 onboarding package</span> (`bfonboard1...`).
          Generate it from your issuer device and paste it here.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <a
            href="https://github.com/FROSTR-ORG/igloo-desktop/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded border border-blue-600/30 bg-blue-600/20 px-3 py-1.5 text-xs text-blue-300 transition-colors hover:bg-blue-600/30"
          >
            Igloo Desktop
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://frostr.org/apps"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded border border-blue-600/30 bg-blue-600/20 px-3 py-1.5 text-xs text-blue-300 transition-colors hover:bg-blue-600/30"
          >
            All FROSTR Apps
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <Button onClick={onContinue} className="w-full py-3 font-medium text-white transition-colors">
        <span className="flex items-center justify-center">
          Continue to Setup
          <ArrowRight className="ml-2 h-5 w-5" />
        </span>
      </Button>
    </div>
  );
};

export default OnboardingInstructions;
