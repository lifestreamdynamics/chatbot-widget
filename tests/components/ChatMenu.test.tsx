import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatMenu from '../../src/components/ChatMenu';

describe('ChatMenu', () => {
  const defaultProps = {
    onClearHistory: vi.fn(),
    onExportChat: vi.fn(),
    themeMode: 'dark' as const,
    onToggleTheme: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders menu button with correct aria-label', () => {
    render(<ChatMenu {...defaultProps} />);
    const button = screen.getByTestId('chatbot-menu-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Chat menu');
  });

  it('dropdown is not visible initially', () => {
    render(<ChatMenu {...defaultProps} />);
    expect(screen.queryByTestId('chatbot-menu-dropdown')).not.toBeInTheDocument();
  });

  it('clicking button shows dropdown', () => {
    render(<ChatMenu {...defaultProps} />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    expect(screen.getByTestId('chatbot-menu-dropdown')).toBeInTheDocument();
  });

  it('Clear History calls onClearHistory and closes menu', () => {
    render(<ChatMenu {...defaultProps} />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    fireEvent.click(screen.getByTestId('chatbot-menu-clear-history'));
    expect(defaultProps.onClearHistory).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('chatbot-menu-dropdown')).not.toBeInTheDocument();
  });

  it('clicking outside closes menu', () => {
    render(<ChatMenu {...defaultProps} />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    expect(screen.getByTestId('chatbot-menu-dropdown')).toBeInTheDocument();
    // Click outside the menu
    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId('chatbot-menu-dropdown')).not.toBeInTheDocument();
  });

  it('Escape key closes menu', () => {
    render(<ChatMenu {...defaultProps} />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    expect(screen.getByTestId('chatbot-menu-dropdown')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('chatbot-menu-dropdown')).not.toBeInTheDocument();
  });

  it('has correct aria-haspopup and aria-expanded attributes', () => {
    render(<ChatMenu {...defaultProps} />);
    const button = screen.getByTestId('chatbot-menu-button');
    expect(button).toHaveAttribute('aria-haspopup', 'true');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('dropdown has role menu', () => {
    render(<ChatMenu {...defaultProps} />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    expect(screen.getByTestId('chatbot-menu-dropdown')).toHaveAttribute('role', 'menu');
  });

  it('menu items have role menuitem', () => {
    render(<ChatMenu {...defaultProps} />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    expect(screen.getByTestId('chatbot-menu-clear-history')).toHaveAttribute('role', 'menuitem');
  });

  it('renders Export as JSON menu item when dropdown is open', () => {
    render(<ChatMenu {...defaultProps} />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    expect(screen.getByTestId('chatbot-menu-export-json')).toBeInTheDocument();
    expect(screen.getByText('Export as JSON')).toBeInTheDocument();
  });

  it('renders Export as Text menu item when dropdown is open', () => {
    render(<ChatMenu {...defaultProps} />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    expect(screen.getByTestId('chatbot-menu-export-text')).toBeInTheDocument();
    expect(screen.getByText('Export as Text')).toBeInTheDocument();
  });

  it('Export as JSON calls onExportChat with "json" and closes menu', () => {
    render(<ChatMenu {...defaultProps} />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    fireEvent.click(screen.getByTestId('chatbot-menu-export-json'));
    expect(defaultProps.onExportChat).toHaveBeenCalledWith('json');
    expect(screen.queryByTestId('chatbot-menu-dropdown')).not.toBeInTheDocument();
  });

  it('Export as Text calls onExportChat with "text" and closes menu', () => {
    render(<ChatMenu {...defaultProps} />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    fireEvent.click(screen.getByTestId('chatbot-menu-export-text'));
    expect(defaultProps.onExportChat).toHaveBeenCalledWith('text');
    expect(screen.queryByTestId('chatbot-menu-dropdown')).not.toBeInTheDocument();
  });

  it('export menu items have role menuitem', () => {
    render(<ChatMenu {...defaultProps} />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    expect(screen.getByTestId('chatbot-menu-export-json')).toHaveAttribute('role', 'menuitem');
    expect(screen.getByTestId('chatbot-menu-export-text')).toHaveAttribute('role', 'menuitem');
  });

  it('dropdown shows all four menu items', () => {
    render(<ChatMenu {...defaultProps} />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(4);
  });

  it('renders theme toggle with "Light Mode" text in dark mode', () => {
    render(<ChatMenu {...defaultProps} themeMode="dark" />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    expect(screen.getByTestId('chatbot-menu-theme-toggle')).toBeInTheDocument();
    expect(screen.getByText('Light Mode')).toBeInTheDocument();
  });

  it('renders theme toggle with "Dark Mode" text in light mode', () => {
    render(<ChatMenu {...defaultProps} themeMode="light" />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  });

  it('theme toggle calls onToggleTheme and closes menu', () => {
    render(<ChatMenu {...defaultProps} />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    fireEvent.click(screen.getByTestId('chatbot-menu-theme-toggle'));
    expect(defaultProps.onToggleTheme).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('chatbot-menu-dropdown')).not.toBeInTheDocument();
  });

  it('theme toggle has correct aria-label in dark mode', () => {
    render(<ChatMenu {...defaultProps} themeMode="dark" />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    expect(screen.getByTestId('chatbot-menu-theme-toggle')).toHaveAttribute(
      'aria-label',
      'Switch to light mode'
    );
  });

  it('theme toggle has correct aria-label in light mode', () => {
    render(<ChatMenu {...defaultProps} themeMode="light" />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    expect(screen.getByTestId('chatbot-menu-theme-toggle')).toHaveAttribute(
      'aria-label',
      'Switch to dark mode'
    );
  });

  it('menu contains a separator between theme toggle and other items', () => {
    render(<ChatMenu {...defaultProps} />);
    fireEvent.click(screen.getByTestId('chatbot-menu-button'));
    const separator = screen.getByRole('separator');
    expect(separator).toBeInTheDocument();
  });
});
