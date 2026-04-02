// ==========================================
// 🚀 7TV AIO BOT v4.0 (Insta-Sell SuperScript)
// Ultra Fast AFK Farm Mode + Global Turbo
// ==========================================

(function() {
    'use strict';

    if (window._7TV_BOT_RUNNING) {
        console.warn('⚠️ Bot is already running! Refresh the page (F5) to restart.');
        return;
    }
    window._7TV_BOT_RUNNING = true;

    console.log('%c🚀 7TV AIO Bot v4.0 Started!', 'color: #8b5cf6; font-size: 20px; font-weight: bold;');

    // ==========================================
    // ⚙️ GLOBAL CONFIG & STATE
    // ==========================================
    const CONFIG = {
        turboMode: true,      // Skips animations globally
        
        // Auto-Sell Rarities
        sellBlue: true,
        sellPurple: true,
        sellPink: true,
        sellRed: false,
        sellGold: false,
    };

    const STATE = {
        isRunning: false,
        currentMode: 'idle',
        stats: {
            opened: 0,
            sold: 0,
            kept: 0,
            drops: { blue: 0, purple: 0, pink: 0, red: 0, gold: 0 }
        }
    };

    // ==========================================
    // 🛠️ UTILS & DOM
    // ==========================================
    const Utils = {
        log: (msg, type = 'info') => {
            const colors = { info: '#60a5fa', success: '#34d399', warn: '#fbbf24', error: '#f87171', turbo: '#c084fc' };
            console.log(`%c[7TV BOT] ${msg}`, `color: ${colors[type] || colors.info}; font-weight: bold;`);
        },
        
        sleep: (ms) => new Promise(resolve => {
            const timeoutFn = window._originalSetTimeout || window.setTimeout;
            timeoutFn(resolve, ms);
        }),
        
        waitForElement: (selector, timeout = 2000) => {
            return new Promise(resolve => {
                const el = document.querySelector(selector);
                if (el && el.offsetParent !== null) return resolve(el);
                
                const observer = new MutationObserver(() => {
                    const node = document.querySelector(selector);
                    if (node && node.offsetParent !== null) {
                        observer.disconnect();
                        resolve(node);
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
                
                const timeoutFn = window._originalSetTimeout || window.setTimeout;
                timeoutFn(() => { observer.disconnect(); resolve(null); }, timeout);
            });
        },

        findButtonByText: (searchText) => {
            const buttons = Array.from(document.querySelectorAll('button, .button'));
            return buttons.find(btn => btn.textContent.toLowerCase().includes(searchText.toLowerCase()) && btn.offsetParent !== null);
        }
    };

    // ==========================================
    // ⚡ TURBO MODULE
    // ==========================================
    const Turbo = {
        styleId: '7tv-turbo-css',
        
        enable() {
            if (!document.getElementById(this.styleId)) {
                const style = document.createElement('style');
                style.id = this.styleId;
                style.textContent = `
                    * {
                        animation-duration: 0.01s !important;
                        animation-delay: 0s !important;
                        transition-duration: 0.01s !important;
                        transition-delay: 0s !important;
                    }
                    #spinner-layer { opacity: 0 !important; pointer-events: none !important; }
                `;
                document.head.appendChild(style);
            }

            if (!window._originalSetTimeout) {
                window._originalSetTimeout = window.setTimeout;
                window._originalSetInterval = window.setInterval;
                
                window.setTimeout = function(callback, delay, ...args) {
                    return window._originalSetTimeout(callback, Math.min(delay / 100, 10), ...args);
                };
                window.setInterval = function(callback, delay, ...args) {
                    return window._originalSetInterval(callback, Math.min(delay / 100, 10), ...args);
                };
            }
        },

        disable() {
            const style = document.getElementById(this.styleId);
            if (style) style.remove();

            if (window._originalSetTimeout) {
                window.setTimeout = window._originalSetTimeout;
                window.setInterval = window._originalSetInterval;
                delete window._originalSetTimeout;
                delete window._originalSetInterval;
            }
        },
        
        skipInlineAnimations() {
            try {
                document.querySelectorAll('*').forEach(el => {
                    if (window.getComputedStyle(el).animationName !== 'none') {
                        el.style.animation = 'none';
                    }
                });
            } catch (e) {}
        }
    };

    // ==========================================
    // ⚙️ CORE PIPELINE (Unbox -> InstaSell)
    // ==========================================
    const Pipeline = {
        async executeFullCycle() {
            if (!STATE.isRunning) return false;

            // --- 1. OPEN CASE ---
            const unlockBtn = Utils.findButtonByText('Unlock Case');
            if (!unlockBtn) {
                Utils.log('Unlock button not found.', 'error');
                return false;
            }

            unlockBtn.scrollIntoView({ behavior: 'instant', block: 'center' });
            unlockBtn.click();
            
            if (CONFIG.turboMode) Turbo.skipInlineAnimations();

            const confirmBtn = await Utils.waitForElement('.confirm-btn', CONFIG.turboMode ? 2000 : 12000);
            if (confirmBtn) {
                confirmBtn.click();
                STATE.stats.opened++;
            } else {
                return false; // Error confirming
            }

            // Give the DOM a tiny fraction of a second to render the new item in the inventory grid
            await Utils.sleep(CONFIG.turboMode ? 30 : 500);

            // --- 2. INSTA-SELL (Check Unprocessed Inventory) ---
            const items = document.querySelectorAll('.inv-slot:not([data-7tvbot-processed])');
            
            for (let item of items) {
                if (!STATE.isRunning) break;
                
                item.dataset['7tvbotProcessed'] = 'true';
                
                let rarity = 'unknown';
                if (item.classList.contains('rarity-blue')) rarity = 'blue';
                else if (item.classList.contains('rarity-purple')) rarity = 'purple';
                else if (item.classList.contains('rarity-pink')) rarity = 'pink';
                else if (item.classList.contains('rarity-red')) rarity = 'red';
                else if (item.classList.contains('rarity-gold')) rarity = 'gold';

                if (STATE.stats.drops[rarity] !== undefined) STATE.stats.drops[rarity]++;

                const configKey = `sell${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`;
                
                // If it's configured to sell
                if (CONFIG[configKey] === true) {
                    item.scrollIntoView({ behavior: 'instant', block: 'center' });
                    item.click();

                    const sellBtn = await Utils.waitForElement('.confirm-sell-btn', 1000);
                    if (sellBtn) {
                        sellBtn.click();
                        STATE.stats.sold++;
                    } else {
                        const closeBtn = document.querySelector('.confirm-btn');
                        if (closeBtn) closeBtn.click();
                    }
                    
                    // Tiny wait to let modal close before opening next case
                    await Utils.sleep(CONFIG.turboMode ? 30 : 300);
                } else {
                    STATE.stats.kept++;
                }
            }

            UI.updateStats();
            return true;
        },

        async cleanInventory() {
            // Manual clean for the "Quick Sell Trash" button
            STATE.isRunning = true;
            if (CONFIG.turboMode) Turbo.enable();
            UI.updateStatus('🧹 Quick Selling...', '#f472b6');
            UI.toggleButtons(true);

            const items = document.querySelectorAll('.inv-slot:not([data-7tvbot-processed])');
            for (let item of items) {
                if (!STATE.isRunning) break;
                
                item.dataset['7tvbotProcessed'] = 'true';
                
                let rarity = 'unknown';
                if (item.classList.contains('rarity-blue')) rarity = 'blue';
                else if (item.classList.contains('rarity-purple')) rarity = 'purple';
                else if (item.classList.contains('rarity-pink')) rarity = 'pink';
                else if (item.classList.contains('rarity-red')) rarity = 'red';
                else if (item.classList.contains('rarity-gold')) rarity = 'gold';

                const configKey = `sell${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`;
                if (CONFIG[configKey] === true) {
                    item.click();
                    const sellBtn = await Utils.waitForElement('.confirm-sell-btn', 1000);
                    if (sellBtn) {
                        sellBtn.click();
                        STATE.stats.sold++;
                    } else {
                        const closeBtn = document.querySelector('.confirm-btn');
                        if (closeBtn) closeBtn.click();
                    }
                    await Utils.sleep(CONFIG.turboMode ? 30 : 300);
                } else {
                    STATE.stats.kept++;
                }
                UI.updateStats();
            }

            this.stop();
        },

        async startAFK() {
            if (STATE.isRunning) return;
            
            STATE.isRunning = true;
            STATE.currentMode = 'afk';
            if (CONFIG.turboMode) Turbo.enable();
            
            UI.updateStatus('🟢 Insta-Sell Loop', '#34d399');
            UI.toggleButtons(true);
            Utils.log('Starting Insta-Sell Loop...', 'success');

            // INFINITE LOOP
            while (STATE.isRunning && STATE.currentMode === 'afk') {
                const success = await this.executeFullCycle();
                if (!success) {
                    Utils.log('Pipeline error. Stopping loop.', 'error');
                    this.stop();
                    break;
                }
                // Delay between case unboxes
                await Utils.sleep(CONFIG.turboMode ? 10 : 500);
            }
        },

        stop() {
            STATE.isRunning = false;
            STATE.currentMode = 'idle';
            Turbo.disable();
            UI.updateStatus('🔴 Stopped', '#f87171');
            UI.toggleButtons(false);
            Utils.log('Bot Stopped.', 'warn');
        }
    };

    // ==========================================
    // 🎨 UI MODULE
    // ==========================================
    const UI = {
        init() {
            const oldUI = document.getElementById('7tv-aio-menu');
            if (oldUI) oldUI.remove();

            const menu = document.createElement('div');
            menu.id = '7tv-aio-menu';
            menu.style.cssText = `
                position: fixed; top: 20px; right: 20px; width: 320px;
                background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px);
                border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px;
                color: white; font-family: 'Segoe UI', system-ui, sans-serif;
                box-shadow: 0 10px 40px rgba(0,0,0,0.8); z-index: 999999;
                user-select: none; overflow: hidden;
            `;

            menu.innerHTML = `
                <div id="7tv-header" style="background: linear-gradient(90deg, #6d28d9, #8b5cf6); padding: 12px 15px; cursor: grab; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: bold; font-size: 16px;">💎 7TV Insta-Sell Bot</div>
                    <div id="7tv-status-badge" style="background: #f87171; font-size: 10px; padding: 3px 8px; border-radius: 10px; font-weight: bold;">STOPPED</div>
                </div>

                <div style="padding: 15px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 12px;">
                        <div style="font-size: 12px; color: #a78bfa; font-weight: bold; margin-bottom: 8px;">⚙️ PIPELINE SETTINGS</div>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: #fbbf24;">
                            <input type="checkbox" id="7tv-turbo" ${CONFIG.turboMode ? 'checked' : ''}> ⚡ Global Turbo Mode
                        </label>
                        <div style="font-size: 11px; opacity: 0.7; margin-top: 5px;">Opens cases and instantly sells trash without delays.</div>
                    </div>

                    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 12px;">
                        <div style="font-size: 12px; color: #f472b6; font-weight: bold; margin-bottom: 8px;">🧹 AUTO-SELL RARITIES</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 12px;">
                            <label style="color: #60a5fa;"><input type="checkbox" id="7tv-s-blue" ${CONFIG.sellBlue ? 'checked' : ''}> Blue</label>
                            <label style="color: #c084fc;"><input type="checkbox" id="7tv-s-purple" ${CONFIG.sellPurple ? 'checked' : ''}> Purple</label>
                            <label style="color: #f472b6;"><input type="checkbox" id="7tv-s-pink" ${CONFIG.sellPink ? 'checked' : ''}> Pink</label>
                            <label style="color: #f87171;"><input type="checkbox" id="7tv-s-red" ${CONFIG.sellRed ? 'checked' : ''}> Red</label>
                            <label style="color: #fbbf24; grid-column: span 2;"><input type="checkbox" id="7tv-s-gold" ${CONFIG.sellGold ? 'checked' : ''}> Gold (Careful!)</label>
                        </div>
                        <button id="7tv-btn-clean" style="width: 100%; margin-top: 8px; background: rgba(244, 114, 182, 0.2); color: #f472b6; border: 1px solid #f472b6; padding: 5px; border-radius: 4px; cursor: pointer; font-size: 11px;">Quick Sell Trash (No unbox)</button>
                    </div>

                    <div style="display: flex; justify-content: space-between; text-align: center; margin-bottom: 15px;">
                        <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; flex: 1; margin-right: 5px;">
                            <div style="font-size: 10px; color: #94a3b8;">OPENED</div>
                            <div id="7tv-stat-opened" style="font-size: 16px; font-weight: bold; color: #34d399;">0</div>
                        </div>
                        <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; flex: 1; margin-right: 5px;">
                            <div style="font-size: 10px; color: #94a3b8;">SOLD</div>
                            <div id="7tv-stat-sold" style="font-size: 16px; font-weight: bold; color: #f87171;">0</div>
                        </div>
                        <div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; flex: 1;">
                            <div style="font-size: 10px; color: #94a3b8;">KEPT</div>
                            <div id="7tv-stat-kept" style="font-size: 16px; font-weight: bold; color: #fbbf24;">0</div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 8px;">
                        <button id="7tv-btn-start" style="flex: 2; padding: 12px; background: #10b981; border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">▶ START INSTA-SELL</button>
                        <button id="7tv-btn-stop" style="flex: 1; padding: 12px; background: #ef4444; border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; opacity: 0.5;" disabled>⏹ STOP</button>
                    </div>
                </div>
            `;
            document.body.appendChild(menu);

            this.bindEvents(menu);
            this.makeDraggable(menu, document.getElementById('7tv-header'));
        },

        updateStatus(text, color) {
            const badge = document.getElementById('7tv-status-badge');
            if (badge) {
                badge.textContent = text.toUpperCase();
                badge.style.background = color;
            }
        },

        updateStats() {
            document.getElementById('7tv-stat-opened').textContent = STATE.stats.opened;
            document.getElementById('7tv-stat-sold').textContent = STATE.stats.sold;
            document.getElementById('7tv-stat-kept').textContent = STATE.stats.kept;
        },

        toggleButtons(isRunning) {
            const startBtn = document.getElementById('7tv-btn-start');
            const stopBtn = document.getElementById('7tv-btn-stop');
            const cleanBtn = document.getElementById('7tv-btn-clean');
            
            startBtn.disabled = isRunning;
            startBtn.style.opacity = isRunning ? '0.5' : '1';
            cleanBtn.disabled = isRunning;
            cleanBtn.style.opacity = isRunning ? '0.5' : '1';
            
            stopBtn.disabled = !isRunning;
            stopBtn.style.opacity = !isRunning ? '0.5' : '1';
        },

        bindEvents() {
            document.getElementById('7tv-btn-start').addEventListener('click', () => Pipeline.startAFK());
            document.getElementById('7tv-btn-stop').addEventListener('click', () => Pipeline.stop());
            document.getElementById('7tv-btn-clean').addEventListener('click', () => Pipeline.cleanInventory());

            document.getElementById('7tv-turbo').addEventListener('change', (e) => {
                CONFIG.turboMode = e.target.checked;
                if (STATE.isRunning) {
                    if (CONFIG.turboMode) Turbo.enable();
                    else Turbo.disable();
                }
            });

            document.getElementById('7tv-s-blue').addEventListener('change', (e) => CONFIG.sellBlue = e.target.checked);
            document.getElementById('7tv-s-purple').addEventListener('change', (e) => CONFIG.sellPurple = e.target.checked);
            document.getElementById('7tv-s-pink').addEventListener('change', (e) => CONFIG.sellPink = e.target.checked);
            document.getElementById('7tv-s-red').addEventListener('change', (e) => CONFIG.sellRed = e.target.checked);
            document.getElementById('7tv-s-gold').addEventListener('change', (e) => {
                CONFIG.sellGold = e.target.checked;
                if(e.target.checked) Utils.log('Careful: You have enabled auto-selling for GOLD items!', 'warn');
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && STATE.isRunning) {
                    Pipeline.stop();
                }
            });
        },

        makeDraggable(element, handle) {
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            handle.onmousedown = dragMouseDown;

            function dragMouseDown(e) {
                e = e || window.event;
                e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
                handle.style.cursor = 'grabbing';
            }

            function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                element.style.top = (element.offsetTop - pos2) + "px";
                element.style.left = (element.offsetLeft - pos1) + "px";
                element.style.right = 'auto'; 
            }

            function closeDragElement() {
                document.onmouseup = null;
                document.onmousemove = null;
                handle.style.cursor = 'grab';
            }
        }
    };

    UI.init();

    window.SevenTVBot = {
        Pipeline, UI, CONFIG, STATE
    };

})();
