import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConsentDialog from '../../src/components/ConsentDialog';

describe('ConsentDialog', () => {
  const defaultProps = {
    onAccept: vi.fn(),
    onDecline: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and description text', () => {
    render(<ConsentDialog {...defaultProps} />);
    expect(screen.getByText('Privacy & Data Consent')).toBeInTheDocument();
    expect(screen.getByText(/stores your conversation history/)).toBeInTheDocument();
  });

  it('calls onAccept when Accept button is clicked', () => {
    render(<ConsentDialog {...defaultProps} />);
    fireEvent.click(screen.getByTestId('chatbot-consent-accept'));
    expect(defaultProps.onAccept).toHaveBeenCalledOnce();
  });

  it('calls onDecline when Decline button is clicked', () => {
    render(<ConsentDialog {...defaultProps} />);
    fireEvent.click(screen.getByTestId('chatbot-consent-decline'));
    expect(defaultProps.onDecline).toHaveBeenCalledOnce();
  });

  it('has role alertdialog with correct ARIA attributes', () => {
    render(<ConsentDialog {...defaultProps} />);
    const dialog = screen.getByTestId('chatbot-consent-dialog');
    expect(dialog).toHaveAttribute('role', 'alertdialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'chatbot-consent-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'chatbot-consent-description');
  });

  it('auto-focuses the Accept button on mount', () => {
    render(<ConsentDialog {...defaultProps} />);
    expect(screen.getByTestId('chatbot-consent-accept')).toHaveFocus();
  });

  it('has correct data-testid attributes', () => {
    render(<ConsentDialog {...defaultProps} />);
    expect(screen.getByTestId('chatbot-consent-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('chatbot-consent-accept')).toBeInTheDocument();
    expect(screen.getByTestId('chatbot-consent-decline')).toBeInTheDocument();
  });

  it('renders Accept & Continue and Decline button labels', () => {
    render(<ConsentDialog {...defaultProps} />);
    expect(screen.getByText('Accept & Continue')).toBeInTheDocument();
    expect(screen.getByText('Decline')).toBeInTheDocument();
  });
});
