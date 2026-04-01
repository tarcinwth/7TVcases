// 7TV Auto Case Opener - VERSÃO TURBO (Pula animação)
// Tenta acelerar/pular a animação de abertura

(function() {
    'use strict';
    
    console.log('%c🚀 7TV TURBO MODE - Skip Animation', 'color: #ff6b6b; font-size: 18px; font-weight: bold');
    console.log('%c=========================================', 'color: #ff6b6b');
    
    // CONFIGURAÇÕES
    const CONFIG = {
        maxCases: 10,
        unlockDelay: 300,
        confirmDelay: 500,
        nextCaseDelay: 1000,
        skipAnimation: true,        // Tentar pular animação
        fastMode: true,             // Modo rápido
        debug: true
    };
    
    let casesOpened = 0;
    let isRunning = false;
    let currentStep = 'unlock';
    
    // Função de log
    function log(msg, type = 'info') {
        const styles = {
            info: 'color: #60a5fa',
            success: 'color: #34d399',
            error: 'color: #f87171',
            warn: 'color: #fbbf24',
            turbo: 'color: #ff6b6b; font-weight: bold'
        };
        console.log(`%c${msg}`, styles[type] || styles.info);
    }
    
    // TÉCNICA 1: Acelerar animações CSS
    function speedUpAnimations() {
        try {
            // Cria estilo para acelerar TODAS as animações e transições
            const style = document.createElement('style');
            style.id = 'turbo-animations';
            style.textContent = `
                * {
                    animation-duration: 0.01s !important;
                    animation-delay: 0s !important;
                    transition-duration: 0.01s !important;
                    transition-delay: 0s !important;
                }
            `;
            
            // Remove estilo antigo se existir
            const oldStyle = document.getElementById('turbo-animations');
            if (oldStyle) oldStyle.remove();
            
            document.head.appendChild(style);
            log('✅ Animações CSS aceleradas', 'turbo');
            return true;
        } catch (e) {
            log('⚠️ Erro ao acelerar CSS: ' + e.message, 'warn');
            return false;
        }
    }
    
    // TÉCNICA 2: Manipular JavaScript timers
    function accelerateTimers() {
        try {
            // Salva as funções originais
            if (!window._originalSetTimeout) {
                window._originalSetTimeout = window.setTimeout;
                window._originalSetInterval = window.setInterval;
            }
            
            // Substitui setTimeout para dividir o tempo por 100
            window.setTimeout = function(callback, delay, ...args) {
                const newDelay = Math.min(delay / 100, 10); // Máximo 10ms
                return window._originalSetTimeout(callback, newDelay, ...args);
            };
            
            // Substitui setInterval
            window.setInterval = function(callback, delay, ...args) {
                const newDelay = Math.min(delay / 100, 10);
                return window._originalSetInterval(callback, newDelay, ...args);
            };
            
            log('✅ Timers JavaScript acelerados', 'turbo');
            return true;
        } catch (e) {
            log('⚠️ Erro ao acelerar timers: ' + e.message, 'warn');
            return false;
        }
    }
    
    // TÉCNICA 3: Forçar fim de animações
    function skipAnimations() {
        try {
            // Para todas as animações em elementos com animação
            const elements = document.querySelectorAll('*');
            elements.forEach(el => {
                const computed = window.getComputedStyle(el);
                if (computed.animationName !== 'none') {
                    el.style.animation = 'none';
                }
            });
            
            log('✅ Animações forçadamente encerradas', 'turbo');
            return true;
        } catch (e) {
            log('⚠️ Erro ao forçar fim de animações: ' + e.message, 'warn');
            return false;
        }
    }
    
    // TÉCNICA 4: Procurar e clicar no CONFIRM enquanto ainda está animando
    function findConfirmAggressively() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 150; // 15 segundos (150 x 100ms)
            
            const interval = setInterval(() => {
                attempts++;
                
                // Procura o botão CONFIRM
                const buttons = Array.from(document.querySelectorAll('button'));
                const confirmBtn = buttons.find(btn => 
                    btn.textContent.trim().toUpperCase() === 'CONFIRM' &&
                    btn.offsetParent !== null
                );
                
                if (confirmBtn) {
                    clearInterval(interval);
                    log(`🎯 CONFIRM encontrado após ${attempts * 100}ms`, 'success');
                    resolve(confirmBtn);
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    log('❌ CONFIRM não encontrado após timeout', 'error');
                    resolve(null);
                }
            }, 100); // Verifica a cada 100ms
        });
    }
    
    // Encontrar botão "Unlock Case"
    function findUnlockButton() {
        const buttons = Array.from(document.querySelectorAll('button'));
        
        for (let btn of buttons) {
            const text = btn.textContent.trim();
            if (text.includes('Unlock Case') || text.match(/Unlock Case.*\$\d+/)) {
                const rect = btn.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    return btn;
                }
            }
        }
        return null;
    }
    
    // Clicar em um botão
    function clickButton(button, buttonName) {
        if (!button) {
            log(`❌ Botão "${buttonName}" não encontrado`, 'error');
            return false;
        }
        
        try {
            button.scrollIntoView({ behavior: 'instant', block: 'center' });
            button.click();
            log(`✅ Clicado em "${buttonName}"`, 'success');
            return true;
        } catch (e) {
            log(`❌ Erro ao clicar em "${buttonName}": ${e.message}`, 'error');
            return false;
        }
    }
    
    // Ativar modo turbo
    function enableTurboMode() {
        log('\n🚀 ATIVANDO MODO TURBO...', 'turbo');
        
        if (CONFIG.skipAnimation) {
            speedUpAnimations();
            accelerateTimers();
        }
        
        log('⚡ MODO TURBO ATIVADO!\n', 'turbo');
    }
    
    // Desativar modo turbo
    function disableTurboMode() {
        try {
            // Remove estilo de animação rápida
            const style = document.getElementById('turbo-animations');
            if (style) style.remove();
            
            // Restaura timers originais
            if (window._originalSetTimeout) {
                window.setTimeout = window._originalSetTimeout;
                window.setInterval = window._originalSetInterval;
            }
            
            log('🔄 Modo turbo desativado', 'info');
        } catch (e) {
            log('⚠️ Erro ao desativar turbo: ' + e.message, 'warn');
        }
    }
    
    // Abrir próximo case
    async function openCase() {
        if (casesOpened >= CONFIG.maxCases) {
            stopOpener();
            log(`\n🎉 FINALIZADO! ${casesOpened} cases abertos!`, 'success');
            return;
        }
        
        if (!isRunning) return;
        
        log(`\n📦 Case ${casesOpened + 1}/${CONFIG.maxCases}`, 'info');
        
        // Passo 1: Clicar em "Unlock Case"
        setTimeout(async () => {
            const unlockBtn = findUnlockButton();
            if (clickButton(unlockBtn, 'Unlock Case')) {
                currentStep = 'confirm';
                
                // Aplica técnicas de skip
                if (CONFIG.skipAnimation) {
                    skipAnimations();
                }
                
                // Passo 2: Procurar CONFIRM agressivamente
                log('🔍 Procurando CONFIRM agressivamente...', 'turbo');
                const confirmBtn = await findConfirmAggressively();
                
                if (confirmBtn && clickButton(confirmBtn, 'CONFIRM')) {
                    casesOpened++;
                    currentStep = 'unlock';
                    log(`✅ Case ${casesOpened}/${CONFIG.maxCases} confirmado!`, 'success');
                    
                    // Passo 3: Próximo case
                    setTimeout(() => {
                        openCase();
                    }, CONFIG.nextCaseDelay);
                } else {
                    log('❌ Falha ao confirmar. Parando...', 'error');
                    stopOpener();
                }
            } else {
                log('❌ Botão "Unlock Case" não encontrado. Parando...', 'error');
                stopOpener();
            }
        }, CONFIG.unlockDelay);
    }
    
    // Iniciar
    function startOpener() {
        if (isRunning) {
            log('⚠️ Já está rodando!', 'warn');
            return;
        }
        
        isRunning = true;
        casesOpened = 0;
        
        log(`\n🚀 INICIANDO MODO TURBO...`, 'turbo');
        log(`📊 Configuração:`, 'info');
        log(`   • Cases: ${CONFIG.maxCases}`, 'info');
        log(`   • Skip Animation: ${CONFIG.skipAnimation ? 'SIM' : 'NÃO'}`, 'info');
        log(`   • Tempo estimado: ~${(CONFIG.maxCases * 2) / 60} minutos`, 'info');
        log(`\n⏳ Começando em 1 segundo...\n`, 'warn');
        
        enableTurboMode();
        
        setTimeout(() => {
            openCase();
        }, 1000);
    }
    
    // Parar
    function stopOpener() {
        isRunning = false;
        disableTurboMode();
        log(`\n⏹️ PARADO! Cases abertos: ${casesOpened}`, 'warn');
    }
    
    // Criar interface
    function createUI() {
        const oldUI = document.getElementById('case-opener-turbo-ui');
        if (oldUI) oldUI.remove();
        
        const ui = document.createElement('div');
        ui.id = 'case-opener-turbo-ui';
        ui.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
            color: white;
            padding: 20px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(255, 107, 107, 0.5);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            min-width: 280px;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
            animation: pulse 2s ease-in-out infinite;
        `;
        
        ui.innerHTML = `
            <style>
                @keyframes pulse {
                    0%, 100% { box-shadow: 0 8px 32px rgba(255, 107, 107, 0.5); }
                    50% { box-shadow: 0 8px 40px rgba(255, 107, 107, 0.8); }
                }
            </style>
            
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <div style="font-size: 28px;">🚀</div>
                <div>
                    <div style="font-weight: bold; font-size: 18px;">TURBO MODE</div>
                    <div style="font-size: 12px; opacity: 0.9;">Skip Animation</div>
                </div>
            </div>
            
            <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 10px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="opacity: 0.9;">Progresso:</span>
                    <span style="font-weight: bold;" id="turbo-count">0/${CONFIG.maxCases}</span>
                </div>
                <div style="background: rgba(0,0,0,0.4); height: 8px; border-radius: 4px; overflow: hidden;">
                    <div id="turbo-progress" style="background: linear-gradient(90deg, #fbbf24, #f59e0b); height: 100%; width: 0%; transition: width 0.3s;"></div>
                </div>
                <div id="turbo-status" style="font-size: 11px; opacity: 0.8; margin-top: 8px; text-align: center;">
                    Pronto para turbo!
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                <button id="turbo-start" style="
                    flex: 1;
                    padding: 12px;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    background: #fbbf24;
                    color: #000;
                    font-size: 14px;
                    transition: all 0.2s;
                " onmouseover="this.style.background='#f59e0b'" onmouseout="this.style.background='#fbbf24'">
                    ⚡ TURBO START
                </button>
                <button id="turbo-stop" style="
                    flex: 1;
                    padding: 12px;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    background: #ef4444;
                    color: white;
                    font-size: 14px;
                    transition: all 0.2s;
                    opacity: 0.5;
                " disabled>
                    ⏹ PARAR
                </button>
            </div>
            
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                <label style="font-size: 13px; opacity: 0.9;">Quantidade:</label>
                <input type="number" id="turbo-max-input" value="${CONFIG.maxCases}" min="1" max="100" 
                    style="
                        flex: 1;
                        padding: 8px;
                        border: none;
                        border-radius: 6px;
                        background: rgba(0,0,0,0.3);
                        color: white;
                        font-size: 14px;
                        font-weight: bold;
                        text-align: center;
                    ">
            </div>
            
            <div style="background: rgba(251, 191, 36, 0.2); padding: 8px; border-radius: 6px; font-size: 11px; text-align: center; margin-bottom: 10px;">
                ⚡ Modo turbo tenta pular animação
            </div>
            
            <div style="font-size: 11px; opacity: 0.7; text-align: center;">
                ESC para fechar
            </div>
        `;
        
        document.body.appendChild(ui);
        
        // Event listeners
        document.getElementById('turbo-start').addEventListener('click', () => {
            const newMax = parseInt(document.getElementById('turbo-max-input').value) || 10;
            CONFIG.maxCases = newMax;
            document.getElementById('turbo-count').textContent = `0/${CONFIG.maxCases}`;
            document.getElementById('turbo-start').disabled = true;
            document.getElementById('turbo-stop').disabled = false;
            document.getElementById('turbo-start').style.opacity = '0.5';
            document.getElementById('turbo-stop').style.opacity = '1';
            startOpener();
        });
        
        document.getElementById('turbo-stop').addEventListener('click', () => {
            document.getElementById('turbo-start').disabled = false;
            document.getElementById('turbo-stop').disabled = true;
            document.getElementById('turbo-start').style.opacity = '1';
            document.getElementById('turbo-stop').style.opacity = '0.5';
            stopOpener();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') ui.remove();
        });
        
        // Atualizar UI
        setInterval(() => {
            const countEl = document.getElementById('turbo-count');
            const progressEl = document.getElementById('turbo-progress');
            const statusEl = document.getElementById('turbo-status');
            
            if (countEl) countEl.textContent = `${casesOpened}/${CONFIG.maxCases}`;
            if (progressEl) {
                const progress = (casesOpened / CONFIG.maxCases) * 100;
                progressEl.style.width = `${progress}%`;
            }
            if (statusEl) {
                if (isRunning) {
                    if (currentStep === 'unlock') {
                        statusEl.textContent = '⚡ Procurando case...';
                    } else {
                        statusEl.textContent = '🔥 Pulando animação...';
                    }
                } else {
                    statusEl.textContent = 'Pronto para turbo!';
                }
            }
        }, 100);
    }
    
    // Controles globais
    window.turboOpener = {
        start: startOpener,
        stop: stopOpener,
        enableTurbo: enableTurboMode,
        disableTurbo: disableTurboMode,
        config: CONFIG,
        status: () => {
            log(`\n📊 STATUS TURBO:`, 'info');
            log(`   • Rodando: ${isRunning}`, 'info');
            log(`   • Cases: ${casesOpened}/${CONFIG.maxCases}`, 'info');
            log(`   • Turbo ativo: ${CONFIG.skipAnimation}`, 'info');
        }
    };
    
    // Inicializar
    log('\n✅ TURBO MODE carregado!', 'success');
    log('\n📝 COMANDOS:', 'info');
    log('   • turboOpener.start()  - Iniciar', 'info');
    log('   • turboOpener.stop()   - Parar', 'info');
    log('   • turboOpener.status() - Status\n', 'info');
    
    setTimeout(() => {
        createUI();
        log('🎨 Interface TURBO criada!', 'turbo');
    }, 1000);
    
})();
