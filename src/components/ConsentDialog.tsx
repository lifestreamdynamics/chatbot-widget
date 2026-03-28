import { useEffect, useRef } from 'react';
import { Shield } from '../utils/icons';

interface ConsentDialogProps {
  onAccept: () => void;
  onDecline: () => void;
}

export default function ConsentDialog({ onAccept, onDecline }: ConsentDialogProps) {
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    acceptButtonRef.current?.focus();
  }, []);

  return (
    <div
      className="chatbot-consent-container"
      role="alertdialog"
      aria-labelledby="chatbot-consent-title"
      aria-describedby="chatbot-consent-description"
      data-testid="chatbot-consent-dialog"
    >
      <div className="chatbot-consent-content">
        <div className="chatbot-consent-icon-wrapper">
          <Shield className="chatbot-consent-icon" />
        </div>
        <h3 id="chatbot-consent-title" className="chatbot-consent-title">
          Privacy &amp; Data Consent
        </h3>
        <p id="chatbot-consent-description" className="chatbot-consent-description">
          This chat stores your conversation history to provide a better experience. Your data is
          handled in accordance with our privacy policy. You can revoke consent or clear your history
          at any time.
        </p>
        <div className="chatbot-consent-actions">
          <button
            ref={acceptButtonRef}
            onClick={onAccept}
            className="chatbot-consent-accept-btn"
            data-testid="chatbot-consent-accept"
          >
            Accept &amp; Continue
          </button>
          <button
            onClick={onDecline}
            className="chatbot-consent-decline-btn"
            data-testid="chatbot-consent-decline"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
