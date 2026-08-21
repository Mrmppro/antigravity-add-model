import { BrowserWindow, WebContentsView } from 'electron';

/**
 * Generates the HTML content for the initial loading screen overlay.
 * This is injected into a WebContentsView and shown to the user before
 * the main application bundle finishes loading.
 *
 * @param foregroundColor - The text and loader animation color (hex or CSS color string).
 * @param backgroundColor - The background color of the loading view.
 */
function getLoadingHtml(foregroundColor: string, backgroundColor: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: ${backgroundColor};
      color: ${foregroundColor};
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      user-select: none;
      overflow: hidden;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(128, 128, 128, 0.2);
      border-radius: 50%;
      border-top-color: ${foregroundColor};
      animation: spin 0.8s ease-in-out infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
  </div>
</body>
</html>
  `;
}

/**
 * Attaches a temporary WebContentsView overlay that shows a loading animation.
 * It is automatically removed when the window's main content finishes loading.
 */
export function attachLoadingOverlay(
  win: BrowserWindow,
  foregroundColor: string,
  backgroundColor: string,
): void {
  const view = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  const html = getLoadingHtml(foregroundColor, backgroundColor);
  void view.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  win.contentView.addChildView(view);
  const updateBounds = () => {
    const [width, height] = win.getContentSize();
    view.setBounds({ x: 0, y: 0, width, height });
  };
  updateBounds();
  win.on('resize', updateBounds);
  win.webContents.once('did-finish-load', () => {
    try {
      win.contentView.removeChildView(view);
    } catch (_) {
      // In case window was closed quickly
    }
    win.off('resize', updateBounds);
  });
}
