<p align="right">
  <a href="README.md">🇹🇷 Türkçe</a> | <b>🇬🇧 English</b>
</p>

# Kiwano • X Unfollow Assistant

A lightweight userscript designed to safely detect and unfollow non-followers on X (Twitter).

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Settings and Filters](#settings-and-filters)
- [Limits and Safety](#limits-and-safety)
- [License](#license)

---

## Features

- **Dual Language Support:** Easily toggle the assistant panel between Turkish (🇹🇷) and English (🇬🇧).
- **Follow-back Detection:** Automatically recognizes users who follow you back across all X display languages and leaves them intact.
- **24-Hour Counter Memory:** Tracks the number of accounts unfollowed within a rolling 24-hour window, warning you before hitting the 200 safe threshold to protect your account.
- **Verified Account Protection:** Safely skip accounts with a blue checkmark.
- **Stop User Threshold:** Halts execution when a specified `@username` is encountered to preserve older followings.
- **Whitelist & Blacklist:** Exclude friends or important accounts via Whitelist, log unfollowed users in Blacklist, and import/export lists in `.txt` format.
- **Speed & Themes:** Adjustable pacing (Normal, Fast, Turbo) and 5 distinct accent colors.

---

## Installation

### 1. Tampermonkey Extension
Install the Tampermonkey extension for your preferred browser:
- [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### 2. Install the Script

**Method A (Direct 1-Click Install):**
Click [kiwano-x-unfollow.user.js](https://raw.githubusercontent.com/furkvn7/kiwano-x-unfollow/main/kiwano-x-unfollow.user.js). When the Tampermonkey prompt appears, click **Install**.

**Method B (Manual Install):**
1. Click the Tampermonkey icon and choose **Create a new script**.
2. Copy and paste the contents of [`kiwano-x-unfollow.user.js`](./kiwano-x-unfollow.user.js) into the editor.
3. Save with `Ctrl + S` (`Cmd + S` on macOS).

---

## Usage

1. Open [x.com](https://x.com) and navigate to your **Following** (`/following`) page.
2. The Kiwano panel will appear in the bottom-right corner. Configure your limit and speed preferences.
3. Add any accounts you want to preserve into the Whitelist.
4. Click **Start**.

To avoid browser throttling, keep the tab open and do not minimize the window while the script is running.

---

## Settings and Filters

| Option | Description |
| :--- | :--- |
| **Language** | Switch panel interface between Turkish and English. |
| **Skip Verified** | Ignores verified accounts with blue checkmarks. |
| **Stop at this user** | Automatically stops execution once the specified `@username` is found. |
| **Unfollow Limit** | Maximum number of accounts to unfollow in one session. |
| **Process Speed** | Delay between unfollow actions (Normal / Fast / Turbo). |
| **Show Badges** | Adds an "Unfollowed" tag next to accounts recorded in your blacklist. |
| **Reset History** | Clears the 24-hour unfollow activity memory. |

---

## Limits and Safety

This tool is intended for personal account organization. Twitter / X policies regarding automated or rapid unfollowing can change. Exceeding 150-200 unfollows within a 24-hour period is not recommended to avoid account restrictions.

---

## License

This project is licensed under the [MIT License](./LICENSE).

