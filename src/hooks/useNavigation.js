import { useNavigate } from 'react-router-dom';

/**
 * useNavigation - Centralized navigation and link logic.
 * Usage: const nav = useNavigation(); nav.goTo('/dashboard')
 */
export default function useNavigation() {
  const navigate = useNavigate();

  // Internal navigation
  const goTo = (path, options) => navigate(path, options);

  // External navigation
  const goToExternal = (url) => {
    window.location.href = url;
  };

  // Open in new tab
  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Build dashboard/session URLs, etc.
  const buildDashboardUrl = (subpath = '') => `/dashboard${subpath}`;
  const buildSessionUrl = (sessionId) => `/dashboard?mosaic=${sessionId}`;

  return { goTo, goToExternal, openInNewTab, buildDashboardUrl, buildSessionUrl };
} 