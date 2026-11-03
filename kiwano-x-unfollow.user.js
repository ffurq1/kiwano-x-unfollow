// ==UserScript==
// @name         Kiwano - X Unfollow Assistant
// @namespace    https://github.com/furkvn7/kiwano-x-unfollow
// @version      1.0.0
// @description  X (Twitter) üzerinde sizi geri takip etmeyen hesapları güvenli şekilde takipten çıkarmanızı sağlayan kullanıcı betiği.
// @author       furkvn7
// @match        https://x.com/*
// @match        https://twitter.com/*
// @icon         https://abs.twimg.com/favicons/twitter.3.ico
// @license      MIT
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const FILE_HEADER_BL = "#KIWANO_BLACKLIST_V1";
    const FILE_HEADER_WL = "#KIWANO_WHITELIST_V1";
    const LEGACY_HEADER_BL = "#XFB_VALID_LIST_V1";
    const LEGACY_HEADER_WL = "#XFB_WHITELIST_V1";

    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    let isRunning = false;
    let unfollowedCount = 0;

    function getStoredData(newKey, oldKey, defaultValue) {
        try {
            const stored = localStorage.getItem(newKey) || localStorage.getItem(oldKey);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }

    let blacklist = getStoredData('kiwano_blacklist', 'xfb_blacklist', []);
    let whitelist = getStoredData('kiwano_whitelist', 'xfb_whitelist', []);
    let unfollowHistory = getStoredData('kiwano_unfollow_history', 'xfb_unfollow_history', []);

    function cleanOldHistory() {
        const now = Date.now();
        const originalLen = unfollowHistory.length;
        unfollowHistory = unfollowHistory.filter(t => (now - t) < TWENTY_FOUR_HOURS);
        if (originalLen !== unfollowHistory.length) {
            localStorage.setItem('kiwano_unfollow_history', JSON.stringify(unfollowHistory));
        }
    }
    cleanOldHistory();

    let settings = getStoredData('kiwano_settings', 'xfb_settings', {
        skipVerified: true,
        stopUser: '',
        limit: 50,
        speed: 'fast',
        theme: 'kiwano',
        showBadges: true
    });

    const themes = {
        kiwano: { primary: '#f59e0b', primaryFg: '#09090b', name: 'Kiwano Altın' },
        zinc: { primary: '#ffffff', primaryFg: '#09090b', name: 'Klasik Beyaz' },
        blue: { primary: '#1d9bf0', primaryFg: '#ffffff', name: 'X Mavisi' },
        green: { primary: '#10b981', primaryFg: '#ffffff', name: 'Zümrüt Yeşili' },
        purple: { primary: '#8b5cf6', primaryFg: '#ffffff', name: 'Gece Moru' }
    };

    function applyTheme() {
        const t = themes[settings.theme] || themes.kiwano;
        document.documentElement.style.setProperty('--kiwano-primary', t.primary);
        document.documentElement.style.setProperty('--kiwano-primary-fg', t.primaryFg);
    }

    function saveSettings() {
        const skipEl = document.getElementById('kiwano-skip-verified');
        if (!skipEl) return;
        const themeRadio = document.querySelector('input[name="kiwano-theme"]:checked');
        settings = {
            skipVerified: skipEl.checked,
            stopUser: document.getElementById('kiwano-stop-user').value.trim(),
            limit: parseInt(document.getElementById('kiwano-limit').value, 10) || 50,
            speed: document.getElementById('kiwano-speed').value,
            theme: themeRadio ? themeRadio.value : 'kiwano',
            showBadges: document.getElementById('kiwano-show-badges').checked
        };
        localStorage.setItem('kiwano_settings', JSON.stringify(settings));
        applyTheme();
        clearBadgeCache();
        markBlacklistedUsers();
    }

    const style = document.createElement('style');
    style.id = 'kiwano-styles';
    style.innerHTML = `
        :root {
            --kiwano-primary: #f59e0b;
            --kiwano-primary-fg: #09090b;
        }
        #kiwano-bot-panel {
            position: fixed; bottom: 20px; right: 88px; width: 348px; z-index: 99999;
            background: #111215; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 14px;
            color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05);
            overflow: hidden; transition: width 0.2s ease, transform 0.2s ease; user-select: none; box-sizing: border-box;
        }
        #kiwano-bot-panel *, #kiwano-bot-panel *::before, #kiwano-bot-panel *::after { box-sizing: border-box; }
        #kiwano-bot-panel.minimized { width: 230px; border-radius: 12px; }
        #kiwano-bot-panel.minimized .kiwano-body { display: none; }
        #kiwano-bot-panel.minimized .kiwano-header { border-bottom: none; padding: 12px 16px; }
        
        .kiwano-header {
            padding: 13px 16px; font-weight: 600; font-size: 13.5px; letter-spacing: -0.01em;
            color: #f4f4f5; background: rgba(255, 255, 255, 0.02); display: flex;
            justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .kiwano-title { display: flex; align-items: center; gap: 8px; }
        .kiwano-brand-tag {
            font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
            padding: 1px 6px; border-radius: 4px; background: rgba(245, 158, 11, 0.15); color: var(--kiwano-primary);
        }
        .kiwano-header-actions { display: flex; align-items: center; gap: 6px; }
        .kiwano-icon-btn {
            background: transparent; border: 1px solid transparent; color: #a1a1aa;
            width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center;
            justify-content: center; cursor: pointer; transition: background-color 0.15s, color 0.15s; padding: 0;
        }
        .kiwano-icon-btn:hover { background: #22242a; border-color: rgba(255,255,255,0.05); color: #f4f4f5; }
        
        .kiwano-toggle-btn { transition: transform 0.2s; }
        #kiwano-bot-panel.minimized .kiwano-toggle-btn { transform: rotate(180deg); }

        .kiwano-body {
            padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 14px;
            max-height: calc(100vh - 100px); overflow-y: auto; overflow-x: hidden;
        }
        .kiwano-body::-webkit-scrollbar { width: 6px; }
        .kiwano-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .kiwano-body::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        
        .kiwano-row { display: flex; flex-direction: column; gap: 6px; }
        .kiwano-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .kiwano-label { font-size: 12px; font-weight: 500; color: #a1a1aa; line-height: 1.2; }
        .kiwano-input-group { display: flex; gap: 6px; align-items: center; width: 100%; }

        .kiwano-input, .kiwano-select {
            background: #18191e; border: 1px solid rgba(255, 255, 255, 0.08); color: #f4f4f5;
            padding: 0 12px; border-radius: 8px; outline: none; font-family: inherit;
            width: 100%; height: 36px; font-size: 13px; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .kiwano-select {
            appearance: none; -webkit-appearance: none; -moz-appearance: none;
            background-repeat: no-repeat; background-position: right 10px center; background-size: 14px;
            cursor: pointer; padding-right: 30px;
        }
        .kiwano-select option { background: #18191e; color: #f4f4f5; padding: 8px; }
        .kiwano-input::placeholder { color: #52525b; }
        .kiwano-input:focus, .kiwano-select:focus { border-color: rgba(255, 255, 255, 0.28); box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.06); }
        .kiwano-input-group .kiwano-input { flex: 1; min-width: 0; height: 36px; }

        .kiwano-label-info-row { display: flex; align-items: center; gap: 5px; position: relative; }
        .kiwano-info-trigger { display: inline-flex; align-items: center; color: #71717a; cursor: help; transition: color 0.15s; }
        .kiwano-info-trigger:hover { color: #f4f4f5; }
        .kiwano-tooltip-box {
            visibility: hidden; opacity: 0; position: absolute;
            top: calc(100% + 8px); left: 0; width: 280px;
            background: #18191e; border: 1px solid rgba(255, 255, 255, 0.14); color: #e4e4e7;
            font-size: 11px; font-weight: 500; line-height: 1.5; padding: 10px 12px; border-radius: 8px;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.9); pointer-events: none; z-index: 999999;
            transform: translateY(-4px); transition: opacity 0.15s ease, transform 0.15s ease;
        }
        .kiwano-info-trigger:hover + .kiwano-tooltip-box { visibility: visible; opacity: 1; transform: translateY(0); }

        .kiwano-accordion { display: flex; flex-direction: column; }
        .kiwano-accordion-header {
            display: flex; justify-content: space-between; align-items: center; cursor: pointer;
            padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.08); transition: color 0.2s;
        }
        .kiwano-accordion-header:hover .kiwano-label { color: #f4f4f5; }
        .kiwano-chevron { transition: transform 0.3s ease; color: #a1a1aa; }
        .kiwano-accordion.collapsed .kiwano-chevron { transform: rotate(-90deg); }
        .kiwano-accordion-content {
            display: flex; flex-direction: column; gap: 12px; overflow: hidden;
            transition: max-height 0.3s ease, margin 0.3s ease, opacity 0.3s ease;
            max-height: 500px; opacity: 1; margin-top: 8px; margin-bottom: 8px;
        }
        .kiwano-accordion.collapsed .kiwano-accordion-content { max-height: 0; margin-top: 0; margin-bottom: 0; opacity: 0; pointer-events: none; }

        .kiwano-switch-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #f4f4f5; font-weight: 500; padding: 2px 0; cursor: pointer; }
        .kiwano-switch { position: relative; display: inline-block; width: 38px; height: 20px; flex-shrink: 0; }
        .kiwano-switch input { opacity: 0; width: 0; height: 0; }
        .kiwano-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #27272a; border: 1px solid rgba(255, 255, 255, 0.06); transition: 0.2s; border-radius: 9999px; }
        .kiwano-slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px; background-color: #a1a1aa; transition: 0.2s; border-radius: 50%; }
        .kiwano-switch input:checked + .kiwano-slider { background-color: var(--kiwano-primary); border-color: var(--kiwano-primary); }
        .kiwano-switch input:checked + .kiwano-slider:before { transform: translateX(18px); background-color: var(--kiwano-primary-fg); }

        .kiwano-btn-primary {
            background: var(--kiwano-primary); color: var(--kiwano-primary-fg); font-weight: 600; font-size: 13px; height: 40px; padding: 0 16px;
            border: none; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0, 0.1); cursor: pointer;
            transition: opacity 0.15s, transform 0.1s; display: flex; align-items: center; justify-content: center; width: 100%; font-family: inherit;
        }
        .kiwano-btn-primary:hover { opacity: 0.9; }
        .kiwano-btn-primary:active { transform: scale(0.99); }
        .kiwano-btn-primary.stop { background: #ef4444; color: #ffffff; }
        .kiwano-btn-primary.stop:hover { background: #dc2626; }

        .kiwano-btn-secondary { background: #22242a; border: 1px solid rgba(255, 255, 255, 0.05); color: #f4f4f5; border-radius: 8px; padding: 0 12px; height: 36px; font-size: 12px; font-weight: 500; font-family: inherit; cursor: pointer; transition: background-color 0.15s; display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; flex-shrink: 0; }
        .kiwano-btn-secondary:hover { background: #2c2e36; }
        
        .kiwano-btn-danger { background: #22242a; border: 1px solid rgba(255, 255, 255, 0.05); color: #f87171; border-radius: 8px; padding: 0 12px; height: 36px; font-size: 12px; font-weight: 500; font-family: inherit; cursor: pointer; transition: background-color 0.15s; display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; flex-shrink: 0; }
        .kiwano-btn-danger:hover { background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.25); }

        .kiwano-progress-wrap { display: flex; flex-direction: column; gap: 6px; }
        .kiwano-progress-info { display: flex; justify-content: space-between; font-size: 12px; color: #a1a1aa; font-weight: 500; }
        .kiwano-progress-bar { width: 100%; height: 5px; background: #18191e; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 9999px; overflow: hidden; }
        .kiwano-progress-fill { height: 100%; width: 0%; background: var(--kiwano-primary); border-radius: 9999px; transition: width 0.3s ease; }
        .kiwano-footer-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .kiwano-footer-actions { display: flex; gap: 6px; align-items: center; }

        .kiwano-toast { font-size: 12px; font-weight: 500; text-align: center; padding: 8px 12px; border-radius: 8px; background: #18191e; border: 1px solid rgba(255, 255, 255, 0.08); color: #f4f4f5; display: none; }

        .kiwano-modal-overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(17, 18, 21, 0.95); backdrop-filter: blur(8px); z-index: 1000;
            display: flex; align-items: center; justify-content: center; padding: 16px;
            box-sizing: border-box; opacity: 0; pointer-events: none; transition: opacity 0.2s ease; border-radius: 14px;
        }
        .kiwano-modal-overlay.active { opacity: 1; pointer-events: auto; }
        .kiwano-modal-card {
            background: #18191e; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; padding: 16px;
            width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.9);
        }
        .kiwano-modal-title { font-size: 14px; font-weight: 600; color: #f4f4f5; margin-bottom: 8px; }
        .kiwano-modal-desc { font-size: 11.5px; color: #a1a1aa; line-height: 1.5; margin-bottom: 14px; text-align: left; }
        
        .kiwano-theme-selector { display: flex; gap: 10px; margin-top: 6px; justify-content: center; }
        .kiwano-theme-dot {
            width: 24px; height: 24px; border-radius: 50%; cursor: pointer;
            border: 2px solid transparent; transition: transform 0.2s; position: relative;
        }
        .kiwano-theme-dot input { opacity: 0; position: absolute; width: 100%; height: 100%; cursor: pointer; margin: 0; }
        .kiwano-theme-dot:has(input:checked) { transform: scale(1.15); border-color: #f4f4f5; }
        
        .kiwano-modal-actions { display: flex; gap: 6px; }
        .kiwano-modal-btn { flex: 1; height: 32px; border-radius: 6px; font-size: 11.5px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: background 0.15s; }
        .kiwano-modal-btn.cancel { background: #22242a; color: #f4f4f5; border: 1px solid rgba(255,255,255,0.05); }
        .kiwano-modal-btn.cancel:hover { background: #2c2e36; }
        .kiwano-modal-btn.confirm { background: #ffffff; color: #09090b; }
        .kiwano-modal-btn.confirm:hover { background: #e4e4e7; }

        .kiwano-badge {
            background-color: rgba(244, 33, 46, 0.15); color: #f4212e; font-size: 11px; font-weight: 500;
            padding: 2px 6px; border-radius: 4px; border: none; margin-left: 6px; line-height: 16px;
            display: inline-block; vertical-align: middle;
        }
    `;
    document.head.appendChild(style);
    applyTheme();

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    async function waitForElement(selector, timeout = 1200) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const el = document.querySelector(selector);
            if (el) return el;
            await sleep(40);
        }
        return null;
    }

    function isFollowingBack(userCell) {
        if (userCell.querySelector('[data-testid="userFollowIndicator"]')) {
            return true;
        }
        const text = userCell.innerText || "";
        const followBackPhrases = [
            'seni takip ediyor',
            'follows you',
            'te sigue',
            'folgt dir',
            'vous suit',
            'ti segue',
            'segue você',
            'seguindo você',
            'читает вас',
            'フォローされています',
            '나를 팔로우합니다',
            '팔로우 중',
            'يتابعك'
        ];
        const lowerText = text.toLowerCase();
        return followBackPhrases.some(phrase => lowerText.includes(phrase));
    }

    let panelCreated = false;

    function initPanel() {
        if (!window.location.href.includes('/following')) {
            const existing = document.getElementById('kiwano-bot-panel');
            if (existing) existing.style.display = 'none';
            return;
        }

        const existing = document.getElementById('kiwano-bot-panel');
        if (existing) {
            existing.style.display = 'block';
            return;
        }

        if (panelCreated) return;
        panelCreated = true;

        const panel = document.createElement('div');
        panel.id = 'kiwano-bot-panel';
        panel.innerHTML = `
            <div class="kiwano-header">
                <div class="kiwano-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--kiwano-primary)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="9"/>
                        <path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>
                        <circle cx="12" cy="12" r="2.5" fill="var(--kiwano-primary)"/>
                    </svg>
                    <span>Kiwano</span>
                    <span class="kiwano-brand-tag">Assistant</span>
                </div>
                <div class="kiwano-header-actions">
                    <button class="kiwano-icon-btn" id="kiwano-settings-btn" title="Ayarlar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </button>
                    <button class="kiwano-icon-btn kiwano-toggle-btn" id="kiwano-toggle" title="Küçült/Büyüt">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="kiwano-body">
                <div class="kiwano-modal-overlay" id="kiwano-confirm-modal">
                    <div class="kiwano-modal-card">
                        <div class="kiwano-modal-title" id="kiwano-modal-title">İşlem Onayı</div>
                        <div class="kiwano-modal-desc" id="kiwano-modal-desc"></div>
                        <div class="kiwano-modal-actions">
                            <button class="kiwano-modal-btn cancel" id="kiwano-modal-cancel">İptal</button>
                            <button class="kiwano-modal-btn confirm" id="kiwano-modal-ok">Onayla</button>
                        </div>
                    </div>
                </div>

                <div class="kiwano-modal-overlay" id="kiwano-settings-modal">
                    <div class="kiwano-modal-card" style="text-align: left;">
                        <div class="kiwano-modal-title" style="margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">Ayarlar</div>
                        
                        <div class="kiwano-row" style="margin-bottom: 16px;">
                            <span class="kiwano-label" style="color: #f4f4f5;">Tema Rengi</span>
                            <div class="kiwano-theme-selector">
                                <label class="kiwano-theme-dot" style="background: #f59e0b;" title="Kiwano Altın">
                                    <input type="radio" name="kiwano-theme" value="kiwano" ${settings.theme === 'kiwano' ? 'checked' : ''}>
                                </label>
                                <label class="kiwano-theme-dot" style="background: #ffffff;" title="Klasik Beyaz">
                                    <input type="radio" name="kiwano-theme" value="zinc" ${settings.theme === 'zinc' ? 'checked' : ''}>
                                </label>
                                <label class="kiwano-theme-dot" style="background: #1d9bf0;" title="X Mavisi">
                                    <input type="radio" name="kiwano-theme" value="blue" ${settings.theme === 'blue' ? 'checked' : ''}>
                                </label>
                                <label class="kiwano-theme-dot" style="background: #10b981;" title="Zümrüt Yeşili">
                                    <input type="radio" name="kiwano-theme" value="green" ${settings.theme === 'green' ? 'checked' : ''}>
                                </label>
                                <label class="kiwano-theme-dot" style="background: #8b5cf6;" title="Gece Moru">
                                    <input type="radio" name="kiwano-theme" value="purple" ${settings.theme === 'purple' ? 'checked' : ''}>
                                </label>
                            </div>
                        </div>

                        <label class="kiwano-switch-row" style="margin-bottom: 16px;">
                            <span>"Çıkarıldı" Rozetlerini Göster</span>
                            <div class="kiwano-switch">
                                <input type="checkbox" id="kiwano-show-badges" ${settings.showBadges ? 'checked' : ''}>
                                <span class="kiwano-slider"></span>
                            </div>
                        </label>

                        <div class="kiwano-row" style="margin-bottom: 16px;">
                            <span class="kiwano-label" style="margin-bottom: 4px;">24 Saatlik Sayaç Hafızası</span>
                            <button class="kiwano-btn-danger" id="kiwano-reset-stats" style="width: 100%;">Geçmişi Sıfırla</button>
                        </div>

                        <div class="kiwano-modal-actions">
                            <button class="kiwano-modal-btn cancel" id="kiwano-settings-close" style="width: 100%;">Kapat</button>
                        </div>
                    </div>
                </div>

                <label class="kiwano-switch-row">
                    <span>Mavi Tikli Hesapları Atla</span>
                    <div class="kiwano-switch">
                        <input type="checkbox" id="kiwano-skip-verified" ${settings.skipVerified ? 'checked' : ''}>
                        <span class="kiwano-slider"></span>
                    </div>
                </label>

                <div class="kiwano-row">
                    <div class="kiwano-label-info-row">
                        <span class="kiwano-label">Bu kullanıcıya gelince dur (@ ile)</span>
                        <span class="kiwano-info-trigger">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                        </span>
                        <div class="kiwano-tooltip-box">
                            Listenin en üstünden aşağı doğru tarar. Bu kullanıcı adını gördüğünde durur ve daha eski takip ettiklerinize dokunmaz.
                        </div>
                    </div>
                    <input type="text" class="kiwano-input" id="kiwano-stop-user" placeholder="@kullaniciadi" value="${settings.stopUser}">
                </div>

                <div class="kiwano-grid-2">
                    <div class="kiwano-row">
                        <span class="kiwano-label">Çıkarma Limiti</span>
                        <input type="number" class="kiwano-input" id="kiwano-limit" value="${settings.limit}" min="1" max="500">
                    </div>
                    <div class="kiwano-row">
                        <span class="kiwano-label">İşlem Hızı</span>
                        <select class="kiwano-select" id="kiwano-speed">
                            <option value="normal" ${settings.speed === 'normal' ? 'selected' : ''}>Normal (Güvenli)</option>
                            <option value="fast" ${settings.speed === 'fast' ? 'selected' : ''}>Hızlı</option>
                            <option value="turbo" ${settings.speed === 'turbo' ? 'selected' : ''}>Turbo</option>
                        </select>
                    </div>
                </div>

                <button class="kiwano-btn-primary" id="kiwano-start-btn">Başlat</button>

                <div class="kiwano-progress-wrap">
                    <div class="kiwano-progress-info">
                        <span id="kiwano-status-state">Hazır</span>
                        <span id="kiwano-status-count">0 / ${settings.limit}</span>
                    </div>
                    <div class="kiwano-progress-bar">
                        <div class="kiwano-progress-fill" id="kiwano-progress-fill"></div>
                    </div>
                </div>

                <div class="kiwano-toast" id="kiwano-toast"></div>

                <div class="kiwano-accordion collapsed" id="kiwano-acc-white">
                    <div class="kiwano-accordion-header">
                        <div class="kiwano-label-info-row">
                            <span class="kiwano-label" style="font-size: 13px; font-weight: 600; color: inherit;">Beyaz Liste (Korunanlar)</span>
                        </div>
                        <svg class="kiwano-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="kiwano-accordion-content">
                        <div class="kiwano-input-group">
                            <input type="text" class="kiwano-input" id="kiwano-white-user" placeholder="@kullaniciadi">
                            <button class="kiwano-btn-secondary" id="kiwano-add-white">Ekle</button>
                            <button class="kiwano-btn-danger" id="kiwano-remove-white">Sil</button>
                        </div>
                        <div class="kiwano-footer-row">
                            <span id="kiwano-whitelist-count" style="font-size: 12px; font-weight: 500; color: #a1a1aa;">Listede: <strong style="color: #f4f4f5;">${whitelist.length}</strong></span>
                            <div class="kiwano-footer-actions">
                                <input type="file" id="kiwano-file-white" accept=".txt" style="display:none">
                                <button class="kiwano-btn-secondary" id="kiwano-upload-white">Yükle</button>
                                <button class="kiwano-btn-secondary" id="kiwano-download-white">İndir</button>
                                <button class="kiwano-btn-danger" id="kiwano-clear-white">Sıfırla</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="kiwano-accordion collapsed" id="kiwano-acc-black">
                    <div class="kiwano-accordion-header">
                        <div class="kiwano-label-info-row">
                            <span class="kiwano-label" style="font-size: 13px; font-weight: 600; color: inherit;">Kara Liste (Çıkarılanlar)</span>
                        </div>
                        <svg class="kiwano-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="kiwano-accordion-content">
                        <div class="kiwano-input-group">
                            <input type="text" class="kiwano-input" id="kiwano-manual-user" placeholder="@kullaniciadi">
                            <button class="kiwano-btn-secondary" id="kiwano-add-manual">Ekle</button>
                            <button class="kiwano-btn-danger" id="kiwano-remove-manual">Sil</button>
                        </div>
                        <div class="kiwano-footer-row">
                            <span id="kiwano-blacklist-count" style="font-size: 12px; font-weight: 500; color: #a1a1aa;">Listede: <strong style="color: #f4f4f5;">${blacklist.length}</strong></span>
                            <div class="kiwano-footer-actions">
                                <input type="file" id="kiwano-file-input" accept=".txt" style="display:none">
                                <button class="kiwano-btn-secondary" id="kiwano-upload-btn">Yükle</button>
                                <button class="kiwano-btn-secondary" id="kiwano-download-btn">İndir</button>
                                <button class="kiwano-btn-danger" id="kiwano-clear-btn">Sıfırla</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        const confirmModal = document.getElementById('kiwano-confirm-modal');
        const cTitle = document.getElementById('kiwano-modal-title');
        const cDesc = document.getElementById('kiwano-modal-desc');
        const cOkBtn = document.getElementById('kiwano-modal-ok');
        const cCancelBtn = document.getElementById('kiwano-modal-cancel');

        let pendingConfirmAction = null;

        function showConfirm(title, desc, confirmText, danger = false, onConfirm) {
            cTitle.innerHTML = title;
            cTitle.style.color = danger ? '#ef4444' : '#f4f4f5';
            cDesc.innerHTML = desc;
            cOkBtn.innerText = confirmText;
            cOkBtn.style.background = danger ? '#ef4444' : 'var(--kiwano-primary)';
            cOkBtn.style.color = danger ? '#ffffff' : 'var(--kiwano-primary-fg)';

            pendingConfirmAction = onConfirm;
            confirmModal.classList.add('active');
        }

        cCancelBtn.addEventListener('click', () => {
            confirmModal.classList.remove('active');
            pendingConfirmAction = null;
        });

        cOkBtn.addEventListener('click', () => {
            confirmModal.classList.remove('active');
            if (pendingConfirmAction) pendingConfirmAction();
            pendingConfirmAction = null;
        });

        let toastTimeout;
        function showToast(msg, isError = false) {
            const toast = document.getElementById('kiwano-toast');
            toast.style.display = 'block';
            toast.style.color = isError ? '#f87171' : '#f4f4f5';
            toast.style.borderColor = isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.08)';
            toast.innerText = msg;
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => { toast.style.display = 'none'; }, 3000);
        }

        document.querySelectorAll('.kiwano-accordion-header').forEach(header => {
            header.addEventListener('click', () => { header.parentElement.classList.toggle('collapsed'); });
        });

        const handleValidation = (e) => {
            let val = e.target.value;
            let cleaned = val.replace(/[^a-zA-Z0-9_@]/g, '');
            if (cleaned !== val) {
                e.target.value = cleaned;
                showToast('Geçersiz karakterler temizlendi.', true);
            }
        };
        document.getElementById('kiwano-stop-user').addEventListener('input', handleValidation);
        document.getElementById('kiwano-manual-user').addEventListener('input', handleValidation);
        document.getElementById('kiwano-white-user').addEventListener('input', handleValidation);

        document.getElementById('kiwano-toggle').addEventListener('click', () => { panel.classList.toggle('minimized'); });

        const settingsModal = document.getElementById('kiwano-settings-modal');
        document.getElementById('kiwano-settings-btn').addEventListener('click', () => { settingsModal.classList.add('active'); });
        document.getElementById('kiwano-settings-close').addEventListener('click', () => { settingsModal.classList.remove('active'); });

        document.querySelectorAll('input[name="kiwano-theme"]').forEach(radio => {
            radio.addEventListener('change', saveSettings);
        });
        document.getElementById('kiwano-show-badges').addEventListener('change', saveSettings);

        document.getElementById('kiwano-reset-stats').addEventListener('click', () => {
            showConfirm(
                'Geçmişi Sıfırla',
                'Son 24 saat içinde çıkarılanların sayısı sıfırlanacak. Devam etmek istiyor musunuz?',
                'Sıfırla',
                true,
                () => {
                    unfollowHistory = [];
                    localStorage.setItem('kiwano_unfollow_history', JSON.stringify([]));
                    settingsModal.classList.remove('active');
                    showToast('Sayaç sıfırlandı.');
                }
            );
        });

        ['kiwano-skip-verified', 'kiwano-stop-user', 'kiwano-limit', 'kiwano-speed'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                saveSettings();
                if (id === 'kiwano-limit') updateProgressUI();
            });
        });

        function updateListUI(type) {
            if (type === 'black') {
                localStorage.setItem('kiwano_blacklist', JSON.stringify(blacklist));
                document.getElementById('kiwano-blacklist-count').innerHTML = `Listede: <strong style="color: #f4f4f5;">${blacklist.length}</strong>`;
                document.getElementById('kiwano-manual-user').value = '';
            } else {
                localStorage.setItem('kiwano_whitelist', JSON.stringify(whitelist));
                document.getElementById('kiwano-whitelist-count').innerHTML = `Listede: <strong style="color: #f4f4f5;">${whitelist.length}</strong>`;
                document.getElementById('kiwano-white-user').value = '';
            }
        }

        function updateProgressUI(stateText = null) {
            const limit = parseInt(document.getElementById('kiwano-limit').value, 10) || 50;
            if (stateText) document.getElementById('kiwano-status-state').innerText = stateText;
            document.getElementById('kiwano-status-count').innerText = `${unfollowedCount} / ${limit}`;
            const pct = Math.min(100, Math.round((unfollowedCount / limit) * 100));
            document.getElementById('kiwano-progress-fill').style.width = `${pct}%`;
        }

        document.getElementById('kiwano-add-white').addEventListener('click', () => {
            let u = document.getElementById('kiwano-white-user').value.trim().toLowerCase();
            if (!u) return showToast('Kullanıcı adı girin.', true);
            if (!u.startsWith('@')) u = '@' + u;
            if (!whitelist.includes(u)) {
                whitelist.push(u);
                updateListUI('white');
                showToast(`${u} listeye eklendi.`);
            } else {
                showToast('Bu kullanıcı zaten listede.', true);
            }
        });

        document.getElementById('kiwano-remove-white').addEventListener('click', () => {
            let u = document.getElementById('kiwano-white-user').value.trim().toLowerCase();
            if (!u) return showToast('Kullanıcı adı girin.', true);
            if (!u.startsWith('@')) u = '@' + u;
            if (whitelist.includes(u)) {
                whitelist = whitelist.filter(item => item !== u);
                updateListUI('white');
                showToast(`${u} listeden çıkarıldı.`);
            } else {
                showToast('Bu kullanıcı listede bulunamadı.', true);
            }
        });

        document.getElementById('kiwano-download-white').addEventListener('click', () => {
            if (whitelist.length === 0) return showToast('Beyaz liste boş.', true);
            const fileContent = [FILE_HEADER_WL, ...whitelist].join('\n');
            const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `Kiwano_Whitelist_${whitelist.length}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast('Beyaz liste indirildi.');
        });

        const fileWhite = document.getElementById('kiwano-file-white');
        document.getElementById('kiwano-upload-white').addEventListener('click', () => fileWhite.click());
        fileWhite.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file || !file.name.endsWith('.txt')) {
                showToast('Yalnızca .txt dosyası kabul edilir.', true);
                fileWhite.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                const lines = ev.target.result.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                if (lines.length === 0 || (lines[0] !== FILE_HEADER_WL && lines[0] !== LEGACY_HEADER_WL)) {
                    showToast('Geçersiz dosya biçimi.', true);
                    fileWhite.value = '';
                    return;
                }
                const dataLines = lines.slice(1);
                let addedCount = 0;
                dataLines.forEach(handle => {
                    const clean = handle.toLowerCase();
                    if (/^@[a-z0-9_]{1,15}$/.test(clean) && !whitelist.includes(clean)) {
                        whitelist.push(clean);
                        addedCount++;
                    }
                });
                updateListUI('white');
                showToast(`${addedCount} kullanıcı eklendi.`);
                fileWhite.value = '';
            };
            reader.readAsText(file);
        });

        document.getElementById('kiwano-clear-white').addEventListener('click', () => {
            if (whitelist.length === 0) return;
            showConfirm(
                'Beyaz Listeyi Sıfırla',
                `Listedeki <b>${whitelist.length}</b> kullanıcı silinecek. Onaylıyor musunuz?`,
                'Sıfırla',
                true,
                () => {
                    whitelist = [];
                    updateListUI('white');
                    showToast('Beyaz liste sıfırlandı.');
                }
            );
        });

        document.getElementById('kiwano-add-manual').addEventListener('click', () => {
            let u = document.getElementById('kiwano-manual-user').value.trim().toLowerCase();
            if (!u) return showToast('Kullanıcı adı girin.', true);
            if (!u.startsWith('@')) u = '@' + u;
            if (!blacklist.includes(u)) {
                blacklist.push(u);
                updateListUI('black');
                clearBadgeCache();
                markBlacklistedUsers();
                showToast(`${u} kara listeye eklendi.`);
            } else {
                showToast('Bu kullanıcı zaten listede.', true);
            }
        });

        document.getElementById('kiwano-remove-manual').addEventListener('click', () => {
            let u = document.getElementById('kiwano-manual-user').value.trim().toLowerCase();
            if (!u) return showToast('Kullanıcı adı girin.', true);
            if (!u.startsWith('@')) u = '@' + u;
            if (blacklist.includes(u)) {
                blacklist = blacklist.filter(item => item !== u);
                updateListUI('black');
                clearBadgeCache();
                document.querySelectorAll('.kiwano-badge').forEach(b => {
                    if (b.parentElement && b.parentElement.innerText.toLowerCase().includes(u)) b.remove();
                });
                showToast(`${u} listeden çıkarıldı.`);
            } else {
                showToast('Bu kullanıcı listede bulunamadı.', true);
            }
        });

        document.getElementById('kiwano-download-btn').addEventListener('click', () => {
            if (blacklist.length === 0) return showToast('Kara liste boş.', true);
            const fileContent = [FILE_HEADER_BL, ...blacklist].join('\n');
            const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `Kiwano_Blacklist_${blacklist.length}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast('Kara liste indirildi.');
        });

        const fileInput = document.getElementById('kiwano-file-input');
        document.getElementById('kiwano-upload-btn').addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file || !file.name.endsWith('.txt')) {
                showToast('Yalnızca .txt dosyası kabul edilir.', true);
                fileInput.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                const lines = ev.target.result.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                if (lines.length === 0 || (lines[0] !== FILE_HEADER_BL && lines[0] !== LEGACY_HEADER_BL)) {
                    showToast('Geçersiz dosya biçimi.', true);
                    fileInput.value = '';
                    return;
                }
                const dataLines = lines.slice(1);
                let addedCount = 0;
                dataLines.forEach(handle => {
                    const clean = handle.toLowerCase();
                    if (/^@[a-z0-9_]{1,15}$/.test(clean) && !blacklist.includes(clean)) {
                        blacklist.push(clean);
                        addedCount++;
                    }
                });
                updateListUI('black');
                clearBadgeCache();
                markBlacklistedUsers();
                showToast(`${addedCount} kullanıcı eklendi.`);
                fileInput.value = '';
            };
            reader.readAsText(file);
        });

        document.getElementById('kiwano-clear-btn').addEventListener('click', () => {
            if (blacklist.length === 0) return;
            showConfirm(
                'Kara Listeyi Sıfırla',
                `Listedeki <b>${blacklist.length}</b> kullanıcı silinecek. Onaylıyor musunuz?`,
                'Sıfırla',
                true,
                () => {
                    blacklist = [];
                    updateListUI('black');
                    clearBadgeCache();
                    document.querySelectorAll('.kiwano-badge').forEach(b => b.remove());
                    showToast('Kara liste sıfırlandı.');
                }
            );
        });

        const startBtn = document.getElementById('kiwano-start-btn');

        startBtn.addEventListener('click', () => {
            if (isRunning) {
                stopBotUI('Durduruldu');
            } else {
                cleanOldHistory();
                const limit = parseInt(document.getElementById('kiwano-limit').value, 10) || 50;
                const projectedTotal = unfollowHistory.length + limit;
                const isRisky = limit > 200 || projectedTotal > 200;

                if (isRisky) {
                    showConfirm(
                        'Limit Uyarısı',
                        `Son 24 saat içindeki işlemlerle birlikte toplam <b>${projectedTotal}</b> hesabı takipten çıkarmak üzeresiniz. Günlük önerilen güvenli sınır genellikle 200'dür.<br><br>Bu sınırı aşmak hesabınızın kısıtlanmasına yol açabilir. Devam etmek istiyor musunuz?`,
                        'Devam Et',
                        true,
                        startBotProcess
                    );
                } else {
                    showConfirm(
                        'İşlem Başlatılıyor',
                        `İşlemin kesintisiz sürmesi için:
                        <ul style="margin: 8px 0 0 16px; padding: 0;">
                            <li>Takip Edilenler sayfasında kalın.</li>
                            <li>Sekmeyi simge durumuna küçültmeyin.</li>
                            <li>İşlem bitene kadar sayfada gezinmeyin.</li>
                        </ul>`,
                        'Başlat',
                        false,
                        startBotProcess
                    );
                }
            }
        });

        function startBotProcess() {
            unfollowedCount = 0;
            isRunning = true;
            saveSettings();
            updateProgressUI('Başlatılıyor...');
            startBtn.innerText = 'İşlemi Durdur';
            startBtn.classList.add('stop');
            runBot();
        }

        function stopBotUI(reason = 'Hazır') {
            isRunning = false;
            startBtn.innerText = 'Başlat';
            startBtn.classList.remove('stop');
            updateProgressUI(reason);
        }

        async function runBot() {
            const skipVerified = document.getElementById('kiwano-skip-verified').checked;
            const limit = parseInt(document.getElementById('kiwano-limit').value, 10) || 50;
            const speedMode = document.getElementById('kiwano-speed').value;
            let stopUserRaw = document.getElementById('kiwano-stop-user').value.trim().toLowerCase();
            if (stopUserRaw && !stopUserRaw.startsWith('@')) stopUserRaw = '@' + stopUserRaw;

            const delays = {
                normal: { scroll: 250, waitAfter: 1800, rand: 800, pageScroll: 1400 },
                fast: { scroll: 120, waitAfter: 750, rand: 400, pageScroll: 900 },
                turbo: { scroll: 60, waitAfter: 350, rand: 150, pageScroll: 600 }
            }[speedMode] || { scroll: 120, waitAfter: 750, rand: 400, pageScroll: 900 };

            updateProgressUI('Sayfa başına dönülüyor...');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            await sleep(800);
            window.scrollTo(0, 0);
            await sleep(500);

            const processedInSession = new Set();
            let consecutiveEmptyScrolls = 0;

            while (isRunning && unfollowedCount < limit) {
                updateProgressUI('Taranıyor...');
                const users = document.querySelectorAll('[data-testid="UserCell"]');
                let foundAction = false;

                for (let user of users) {
                    if (!isRunning || unfollowedCount >= limit) break;
                    const textContent = user.innerText || "";
                    const handleMatch = textContent.match(/@[a-zA-Z0-9_]+/);
                    const handle = handleMatch ? handleMatch[0].toLowerCase() : "";

                    if (!handle || processedInSession.has(handle)) continue;

                    if (stopUserRaw && handle === stopUserRaw) {
                        showToast(`Sınır hesaba (${stopUserRaw}) ulaşıldı.`);
                        stopBotUI('Hedefe Ulaşıldı');
                        return;
                    }

                    if (isFollowingBack(user)) {
                        processedInSession.add(handle);
                        continue;
                    }

                    if (whitelist.includes(handle)) {
                        processedInSession.add(handle);
                        continue;
                    }

                    const isVerified = user.querySelector('[data-testid="icon-verified"]');
                    if (skipVerified && isVerified) {
                        processedInSession.add(handle);
                        continue;
                    }

                    const unfollowBtn = user.querySelector('[data-testid$="-unfollow"]');
                    if (unfollowBtn) {
                        updateProgressUI(`Çıkarılıyor: ${handle}`);
                        unfollowBtn.scrollIntoView({ behavior: 'auto', block: 'center' });
                        await sleep(delays.scroll);
                        unfollowBtn.click();

                        const confirmBtn = await waitForElement('[data-testid="confirmationSheetConfirm"]', 1400);

                        if (confirmBtn) {
                            confirmBtn.click();
                            unfollowedCount++;
                            processedInSession.add(handle);

                            unfollowHistory.push(Date.now());
                            cleanOldHistory();

                            updateProgressUI('İşlem yapıldı');
                            foundAction = true;

                            if (!blacklist.includes(handle)) {
                                blacklist.push(handle);
                                updateListUI('black');
                                clearBadgeCache();
                                markBlacklistedUsers();
                            }

                            const extra = Math.floor(Math.random() * delays.rand);
                            await sleep(delays.waitAfter + extra);
                            break;
                        } else {
                            document.body.click();
                            processedInSession.add(handle);
                        }
                    }
                }

                if (unfollowedCount >= limit) {
                    showToast(`Belirlenen limit (${limit}) tamamlandı.`);
                    stopBotUI('Tamamlandı');
                    break;
                }

                if (!foundAction && isRunning) {
                    consecutiveEmptyScrolls++;
                    if (consecutiveEmptyScrolls > 6) {
                        updateProgressUI('Yeni hesaplar yükleniyor...');
                        await sleep(1800);
                    }
                    if (consecutiveEmptyScrolls > 12) {
                        showToast('Sayfa sonuna gelindi veya yeni veri alınamadı.', true);
                        stopBotUI('Sayfa Sonu');
                        break;
                    }

                    updateProgressUI('Aşağı kaydırılıyor...');
                    window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
                    await sleep(delays.pageScroll);
                } else if (foundAction) {
                    consecutiveEmptyScrolls = 0;
                }
            }
        }
    }

    function clearBadgeCache() {
        document.querySelectorAll('[data-testid="UserCell"]').forEach(cell => {
            delete cell.dataset.kiwanoBadged;
        });
    }

    function markBlacklistedUsers() {
        if (!settings.showBadges) {
            document.querySelectorAll('.kiwano-badge').forEach(b => b.remove());
            return;
        }

        if (blacklist.length === 0) return;

        const userCells = document.querySelectorAll('[data-testid="UserCell"]');
        for (const cell of userCells) {
            if (cell.dataset.kiwanoBadged) continue;
            const text = cell.innerText || "";
            const match = text.match(/@[a-zA-Z0-9_]+/);
            if (match) {
                const handle = match[0].toLowerCase();
                if (blacklist.includes(handle)) {
                    const spans = cell.querySelectorAll('span');
                    for (const span of spans) {
                        if (span.innerText && span.innerText.trim().toLowerCase() === handle) {
                            const parent = span.parentElement;
                            if (parent && !parent.querySelector('.kiwano-badge')) {
                                const badge = document.createElement('span');
                                badge.className = 'kiwano-badge';
                                badge.textContent = 'Çıkarıldı';
                                parent.appendChild(badge);
                            }
                            break;
                        }
                    }
                }
            }
            cell.dataset.kiwanoBadged = "true";
        }
    }

    setInterval(() => {
        initPanel();
        markBlacklistedUsers();
        if (!isRunning) {
            cleanOldHistory();
        }
    }, 1200);

    initPanel();
})();
