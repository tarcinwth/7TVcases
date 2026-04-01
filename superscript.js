// ==========================================
// 🚀 7TV AIO BOT (All-In-One SuperScript)
// Auto Opener + Auto Seller + AFK Farm Mode + Turbo
// ==========================================

(function() {
    'use strict';

    // Evita rodar múltiplas vezes
    if (window._7TV_BOT_RUNNING) {
        console.warn('⚠️ Bot is already running! Refresh the page (F5) to restart.');
        return;
    }
    window._7TV_BOT_RUNNING = true;

    console.log('%c🚀 7TV AIO Bot Started!', 'color: #8b5cf6; font-size: 20px; font-weight: bold;');

    // ==========================================
    // ⚙️ CONFIGURAÇÕES GLOBAIS E ESTADO
    // ==========================================
    const CONFIG = {
        // Opener
        batchSize: 10,        // Quantas caixas abrir no modo AFK antes de limpar o inventário
        turboMode: true,      // Pula animações globalmente
        
        // Seller (Quais cores vender automaticamente)
        sellBlue: true,
        sellPurple: true,
        sellPink: true,
        sellRed: false,
        sellGold: false,
        
        // Delays (em ms)
        delayOpener: 400,
        delaySeller: 250,     // Muito mais rápido por causa do Turbo Mode
    };

    const STATE = {
        isRunning: false,
        currentMode: 'idle',  // 'idle', 'opening', 'selling', 'afk'
        casesOpenedCurrentBatch: 0,
        stats: {
            opened: 0,
            sold: 0,
            kept: 0,
            drops: { blue: 0, purple: 0, pink: 0, red: 0, gold: 0 }
        }
    };

    // ==========================================
    // 🛠️ FUNÇÕES UTILITÁRIAS E DOM
    // ==========================================
    const Utils = {
        log: (msg, type = 'info') => {
            const colors = { info: '#60a5fa', success: '#34d399', warn: '#fbbf24', error: '#f87171', turbo: '#c084fc' };
            console.log(`%c[7TV BOT] ${msg}`, `color: ${colors[type] || colors.info}; font-weight: bold;`);
        },
        
        sleep: (ms) => new Promise(resolve => {
            // Usa o timeout original se o Turbo estiver ativo, para não acelerar o próprio bot
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
                
                // Usa o timeout original
                const timeoutFn = window._originalSetTimeout || window.setTimeout;
                timeoutFn(() => { observer.disconnect(); resolve(null); }, timeout);
            });
        },

        // Acha um botão por texto (ignora maiúsculas/minúsculas)
        findButtonByText: (searchText) => {
            const buttons = Array.from(document.querySelectorAll('button, .button'));
            return buttons.find(btn => btn.textContent.toLowerCase().includes(searchText.toLowerCase()) && btn.offsetParent !== null);
        }
    };

    // ==========================================
    // ⚡ MÓDULO: TURBO (Acelerador Extremo)
    // ==========================================
    const Turbo = {
        styleId: '7tv-turbo-css',
        
        enable() {
            // TÉCNICA 1: Acelerar Animações CSS
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

            // TÉCNICA 2: Acelerar Timers JavaScript (A grande sacada)
            // Salva os originais e substitui por versões 100x mais rápidas
            if (!window._originalSetTimeout) {
                window._originalSetTimeout = window.setTimeout;
                window._originalSetInterval = window.setInterval;
                
                window.setTimeout = function(callback, delay, ...args) {
                    const newDelay = Math.min(delay / 100, 10); // Corta o delay por 100
                    return window._originalSetTimeout(callback, newDelay, ...args);
                };
                
                window.setInterval = function(callback, delay, ...args) {
                    const newDelay = Math.min(delay / 100, 10);
                    return window._originalSetInterval(callback, newDelay, ...args);
                };
            }
            
            Utils.log('⚡ Global Turbo Mode Enabled (CSS + JS Timers)', 'turbo');
        },

        disable() {
            // Remover CSS
            const style = document.getElementById(this.styleId);
            if (style) style.remove();

            // Restaurar Timers JavaScript originais
            if (window._originalSetTimeout) {
                window.setTimeout = window._originalSetTimeout;
                window.setInterval = window._originalSetInterval;
                delete window._originalSetTimeout;
                delete window._originalSetInterval;
            }

            Utils.log('🐌 Global Turbo Mode Disabled', 'info');
        },
        
        // TÉCNICA 3: Forçar encerramento de animações pendentes
        skipInlineAnimations() {
            try {
                const elements = document.querySelectorAll('*');
                elements.forEach(el => {
                    const computed = window.getComputedStyle(el);
                    if (computed.animationName !== 'none') {
                        el.style.animation = 'none';
                    }
                });
            } catch (e) {}
        }
    };

    // ==========================================
    // 📦 MÓDULO: OPENER (Abridor de Caixas)
    // ==========================================
    const Opener = {
        async openSingleCase() {
            if (!STATE.isRunning) return false;

            const unlockBtn = Utils.findButtonByText('Unlock Case');
            if (!unlockBtn) {
                Utils.log('Unlock button not found. Are you on the case page?', 'error');
                return false;
            }

            // Clica em Unlock
            unlockBtn.scrollIntoView({ behavior: 'instant', block: 'center' });
            unlockBtn.click();
            
            // Tenta forçar o fim das animações imediatamente após o clique
            if (CONFIG.turboMode) Turbo.skipInlineAnimations();

            // Espera o botão de Confirm aparecer
            const confirmBtn = await Utils.waitForElement('.confirm-btn', CONFIG.turboMode ? 2000 : 12000);
            
            if (confirmBtn) {
                confirmBtn.click();
                STATE.stats.opened++;
                STATE.casesOpenedCurrentBatch++;
                UI.updateStats();
                return true;
            } else {
                Utils.log('Failed to confirm unboxing.', 'error');
                return false;
            }
        },

        async loopOpener() {
            while (STATE.isRunning && STATE.currentMode === 'opening') {
                const success = await this.openSingleCase();
                if (!success) break;
                await Utils.sleep(CONFIG.delayOpener);
            }
        }
    };

    // ==========================================
    // 💰 MÓDULO: SELLER (Vendedor Automático)
    // ==========================================
    const Seller = {
        async processInventory() {
            Utils.log('Inspecting inventory...', 'info');
            
            const items = document.querySelectorAll('.inv-slot:not([data-7tvbot-processed])');
            let itemsProcessedThisRun = 0;

            for (let item of items) {
                if (!STATE.isRunning || STATE.currentMode !== 'selling') break;

                item.dataset['7tvbotProcessed'] = 'true'; // Marca item
                
                // Identifica Raridade
                let rarity = 'unknown';
                if (item.classList.contains('rarity-blue')) rarity = 'blue';
                else if (item.classList.contains('rarity-purple')) rarity = 'purple';
                else if (item.classList.contains('rarity-pink')) rarity = 'pink';
                else if (item.classList.contains('rarity-red')) rarity = 'red';
                else if (item.classList.contains('rarity-gold')) rarity = 'gold';

                // Atualiza estatísticas de Drops
                if (STATE.stats.drops[rarity] !== undefined) STATE.stats.drops[rarity]++;

                const configKey = `sell${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`;
                const shouldSell = CONFIG[configKey] === true;

                if (shouldSell) {
                    // Clica no item
                    item.scrollIntoView({ behavior: 'instant', block: 'center' });
                    item.click();

                    // Espera botão de venda
                    const sellBtn = await Utils.waitForElement('.confirm-sell-btn', 1500);
                    if (sellBtn) {
                        sellBtn.click();
                        STATE.stats.sold++;
                    } else {
                        // Se falhou, tenta fechar o modal
                        const closeBtn = document.querySelector('.confirm-btn');
                        if (closeBtn) closeBtn.click();
                    }
                    
                    itemsProcessedThisRun++;
                    UI.updateStats();
                    await Utils.sleep(CONFIG.delaySeller); // Espera o modal fechar
                } else {
                    STATE.stats.kept++;
                    UI.updateStats();
                }
            }

            Utils.log(`Inventory clean completed. ${itemsProcessedThisRun} items sold.`, 'success');
            return true;
        }
    };

    // ==========================================
    // 🤖 MÓDULO: AFK FARM (O Cérebro)
    // ==========================================
    const Core = {
        async startAFK() {
            if (STATE.isRunning) return;
            
            STATE.isRunning = true;
            STATE.currentMode = 'afk';
            if (CONFIG.turboMode) Turbo.enable();
            UI.updateStatus('🟢 AFK Farm Active', '#34d399');
            UI.toggleButtons(true);

            Utils.log('Starting AFK Farm mode...', 'success');

            while (STATE.isRunning && STATE.currentMode === 'afk') {
                // FASE 1: ABRIR CAIXAS
                STATE.casesOpenedCurrentBatch = 0;
                UI.updateStatus(`📦 Unboxing (Batch of ${CONFIG.batchSize})`, '#60a5fa');
                
                while (STATE.casesOpenedCurrentBatch < CONFIG.batchSize && STATE.isRunning) {
                    const success = await Opener.openSingleCase();
                    if (!success) {
                        Utils.log('Unbox error. Pausing AFK.', 'error');
                        this.stop();
                        return;
                    }
                    await Utils.sleep(CONFIG.delayOpener);
                }

                if (!STATE.isRunning) break;

                // FASE 2: VENDER LIXO
                UI.updateStatus('🧹 Selling Trash...', '#f472b6');
                STATE.currentMode = 'selling'; // Muda o sub-estado temporariamente
                
                await Seller.processInventory();
                
                if (!STATE.isRunning) break;
                
                // Retorna ao estado principal
                STATE.currentMode = 'afk';
                await Utils.sleep(1000); // Pausa breve antes do próximo ciclo
            }
        },

        async startOnlySeller() {
            if (STATE.isRunning) return;
            STATE.isRunning = true;
            STATE.currentMode = 'selling';
            if (CONFIG.turboMode) Turbo.enable();
            UI.updateStatus('🧹 Manual Sell Active', '#f472b6');
            UI.toggleButtons(true);
            
            await Seller.processInventory();
            this.stop();
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
    // 🎨 MÓDULO: INTERFACE DO USUÁRIO (Mod Menu)
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
                <!-- Header (Arrastável) -->
                <div id="7tv-header" style="background: linear-gradient(90deg, #6d28d9, #8b5cf6); padding: 12px 15px; cursor: grab; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: bold; font-size: 16px;">💎 7TV AIO Bot</div>
                    <div id="7tv-status-badge" style="background: #f87171; font-size: 10px; padding: 3px 8px; border-radius: 10px; font-weight: bold;">STOPPED</div>
                </div>

                <div style="padding: 15px;">
                    <!-- Seção AFK -->
                    <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 12px;">
                        <div style="font-size: 12px; color: #a78bfa; font-weight: bold; margin-bottom: 8px;">⚙️ AFK FARM MODE</div>
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 13px;">Cases per Batch:</span>
                            <input type="number" id="7tv-batch" value="${CONFIG.batchSize}" style="width: 60px; background: rgba(0,0,0,0.5); border: 1px solid #4c1d95; color: white; border-radius: 4px; padding: 4px; text-align: center;">
                        </div>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; color: #fbbf24;">
                            <input type="checkbox" id="7tv-turbo" ${CONFIG.turboMode ? 'checked' : ''}> ⚡ Global Turbo Mode
                        </label>
                    </div>

                    <!-- Seção Auto Seller -->
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

                    <!-- Estatísticas -->
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

                    <!-- Botões Principais -->
                    <div style="display: flex; gap: 8px;">
                        <button id="7tv-btn-start" style="flex: 2; padding: 12px; background: #10b981; border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">▶ START AFK</button>
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
            // Controles Principais
            document.getElementById('7tv-btn-start').addEventListener('click', () => Core.startAFK());
            document.getElementById('7tv-btn-stop').addEventListener('click', () => Core.stop());
            document.getElementById('7tv-btn-clean').addEventListener('click', () => Core.startOnlySeller());

            // Inputs AFK
            document.getElementById('7tv-batch').addEventListener('change', (e) => CONFIG.batchSize = parseInt(e.target.value) || 10);
            document.getElementById('7tv-turbo').addEventListener('change', (e) => {
                CONFIG.turboMode = e.target.checked;
                if(STATE.isRunning) {
                    if (CONFIG.turboMode) Turbo.enable();
                    else Turbo.disable();
                }
            });

            // Inputs Cores
            document.getElementById('7tv-s-blue').addEventListener('change', (e) => CONFIG.sellBlue = e.target.checked);
            document.getElementById('7tv-s-purple').addEventListener('change', (e) => CONFIG.sellPurple = e.target.checked);
            document.getElementById('7tv-s-pink').addEventListener('change', (e) => CONFIG.sellPink = e.target.checked);
            document.getElementById('7tv-s-red').addEventListener('change', (e) => CONFIG.sellRed = e.target.checked);
            document.getElementById('7tv-s-gold').addEventListener('change', (e) => {
                CONFIG.sellGold = e.target.checked;
                if(e.target.checked) Utils.log('Careful: You have enabled auto-selling for GOLD items!', 'warn');
            });

            // Atalho de Teclado
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && STATE.isRunning) {
                    Utils.log('ESC key pressed. Stopping bot...', 'warn');
                    Core.stop();
                }
            });
        },

        // Função para tornar o menu arrastável
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
                element.style.right = 'auto'; // Remove o alinhamento à direita original
            }

            function closeDragElement() {
                document.onmouseup = null;
                document.onmousemove = null;
                handle.style.cursor = 'grab';
            }
        }
    };

    // Inicializa Interface
    UI.init();

    // Expõe para debugging
    window.SevenTVBot = {
        Core, UI, CONFIG, STATE
    };

})();
