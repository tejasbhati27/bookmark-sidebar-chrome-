<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# VisualStash - A Modern Bookmark Manager

VisualStash is a sleek and powerful Chrome extension for visually organizing your bookmarks. It provides a beautiful and intuitive interface to save, categorize, and manage your links.

## ✨ Features

*   **Visual Bookmarking:** Save and organize bookmarks with rich previews.
*   **Categorization:** Organize your bookmarks into custom categories.
*   **Locked Folder:** Keep your private bookmarks safe in a password-protected "Locked" folder.
*   **Powerful Search:** Instantly search through your bookmarks by title, URL, or content.
*   **List & Grid Views:** Choose between a compact list view or a visual grid view.
*   **Bulk Actions:** Easily move or delete multiple bookmarks at once.
*   **Keyboard Shortcuts:** Navigate and manage your bookmarks with handy keyboard shortcuts.
*   **Dark/Light Theme:** Switch between a light and dark theme to match your preference.
*   **Data Import/Export:** (Coming soon) Easily import and export your data.

## 🚀 Getting Started

Follow these instructions to get the extension up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   [Google Chrome](https://www.google.com/chrome/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/tejasbhati27/bookmark-sidebar-chrome-.git
    cd bookmark-sidebar-chrome-
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the extension for production:**
    ```bash
    npm run build
    ```
    This will create a `dist` folder with the bundled extension files.

4.  **Load the extension in Chrome:**
    *   Open Chrome and navigate to `chrome://extensions`.
    *   Enable "Developer mode" in the top right corner.
    *   Click on "Load unpacked".
    *   Select the `dist` folder that was created in the previous step.

5.  **Run in Development Mode (Optional):**
    For local development with hot-reloading, you can run:
    ```bash
    npm run dev
    ```
    This will watch for file changes and automatically rebuild the extension. You will still need to load the `dist` folder as an unpacked extension in Chrome. After the initial load, changes will be reflected automatically.

## Usage

*   Click the VisualStash icon in your Chrome toolbar to open the bookmark manager.
*   Use the "Stash Page" button to save the current tab to a category.
*   Click on categories to filter your bookmarks.
*   Use the search bar to find specific bookmarks.
*   Switch between list and grid view using the toggle button.
*   Use the lock icon to access your private "Locked" folder.[Pass - 0007]

## 🤝 Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
