// 7TV Auto Case Opener - VERSÃO FINAL
// Clica em "Unlock Case" e depois em "CONFIRM" automaticamente

(function() {
    'use strict';
    
    console.log('%c🎁 7TV Auto Case Opener v3.0', 'color: #7c3aed; font-size: 16px; font-weight: bold');
    console.log('%c================================', 'color: #7c3aed');
    
    // CONFIGURAÇÕES
    const CONFIG = {
        maxCases: 10,              // Quantos cases abrir
        unlockDelay: 500,          // Delay inicial antes de clicar "Unlock" (0.5s)
        animationWait: 12000,      // Aguarda animação do case (12s - margem de segurança)
        confirmDelay: 500,         // Delay para clicar em "Confirm" (0.5s)
        nextCaseDelay: 2000,       // Delay antes de abrir próximo case (2s)
        debug: true
    };
    
    let casesOpened = 0;
    let isRunning = false;
    let currentStep = 'unlock'; // 'unlock' ou 'confirm'
    
    // Função de log
    function log(msg, type = 'info') {
        const styles = {
            info: 'color: #60a5fa',
            success: 'color: #34d399',
            error: 'color: #f87171',
            warn: 'color: #fbbf24'
        };
        console.log(`%c${msg}`, styles[type] || styles.info);
    }
    
    // Encontrar botão "Unlock Case"
    function findUnlockButton() {
        const buttons = Array.from(document.querySelectorAll('button'));
        
        for (let btn of buttons) {
            const text = btn.textContent.trim();
            // Procura por "Unlock Case" com ou sem preço
            if (text.includes('Unlock Case') || text.match(/Unlock Case.*\$\d+/)) {
                // Verifica se está visível
                const rect = btn.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    return btn;
                }
            }
        }
        return null;
    }
    
    // Encontrar botão "CONFIRM"
    function findConfirmButton() {
        const buttons = Array.from(document.querySelectorAll('button'));
        
        for (let btn of buttons) {
            const text = btn.textContent.trim().toUpperCase();
            if (text === 'CONFIRM') {
                // Verifica se está visível
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
            // Scroll até o botão
            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Clica no botão
            button.click();
            log(`✅ Clicado em "${buttonName}"`, 'success');
            return true;
        } catch (e) {
            log(`❌ Erro ao clicar em "${buttonName}": ${e.message}`, 'error');
            return false;
        }
    }
    
    // Abrir próximo case
    async function openCase() {
        if (casesOpened >= CONFIG.maxCases) {
            stopOpener();
            log(`\n🎉 FINALIZADO! ${casesOpened} cases foram abertos!`, 'success');
            log(`💰 Verifique seu inventário!`, 'info');
            return;
        }
        
        if (!isRunning) return;
        
        log(`\n📦 Case ${casesOpened + 1}/${CONFIG.maxCases}`, 'info');
        
        // Passo 1: Clicar em "Unlock Case"
        setTimeout(() => {
            const unlockBtn = findUnlockButton();
            if (clickButton(unlockBtn, 'Unlock Case')) {
                currentStep = 'confirm';
                log(`⏳ Aguardando animação (${CONFIG.animationWait/1000}s)...`, 'warn');
                
                // Passo 2: Aguardar a animação do case (11-12 segundos)
                setTimeout(() => {
                    log('🔍 Procurando botão CONFIRM...', 'info');
                    const confirmBtn = findConfirmButton();
                    
                    if (clickButton(confirmBtn, 'CONFIRM')) {
                        casesOpened++;
                        currentStep = 'unlock';
                        log(`✅ Case ${casesOpened}/${CONFIG.maxCases} confirmado!`, 'success');
                        
                        // Passo 3: Aguardar e abrir próximo case
                        setTimeout(() => {
                            openCase();
                        }, CONFIG.nextCaseDelay);
                    } else {
                        log('⚠️ CONFIRM não encontrado, aguardando mais 2s...', 'warn');
                        // Tenta confirmar novamente após mais delay
                        setTimeout(() => {
                            const confirmBtn = findConfirmButton();
                            if (clickButton(confirmBtn, 'CONFIRM')) {
                                casesOpened++;
                                currentStep = 'unlock';
                                log(`✅ Case ${casesOpened}/${CONFIG.maxCases} confirmado!`, 'success');
                                setTimeout(() => openCase(), CONFIG.nextCaseDelay);
                            } else {
                                log('❌ Falha ao confirmar após múltiplas tentativas. Parando...', 'error');
                                stopOpener();
                            }
                        }, 2000);
                    }
                }, CONFIG.animationWait);
            } else {
                log('❌ Botão "Unlock Case" não encontrado. Parando...', 'error');
                stopOpener();
            }
        }, CONFIG.unlockDelay);
    }
    
    // Iniciar o opener
    function startOpener() {
        if (isRunning) {
            log('⚠️ Já está rodando!', 'warn');
            return;
        }
        
        isRunning = true;
        casesOpened = 0;
        
        log(`\n🚀 INICIANDO...`, 'success');
        log(`📊 Configuração:`, 'info');
        log(`   • Cases: ${CONFIG.maxCases}`, 'info');
        log(`   • Tempo de animação: ${CONFIG.animationWait/1000}s`, 'info');
        log(`   • Delay entre cases: ${CONFIG.nextCaseDelay/1000}s`, 'info');
        log(`   • Tempo estimado total: ~${(CONFIG.maxCases * (CONFIG.animationWait + CONFIG.nextCaseDelay))/60000} minutos`, 'info');
        log(`\n⏳ Começando em 2 segundos...\n`, 'warn');
        
        setTimeout(() => {
            openCase();
        }, 2000);
    }
    
    // Parar o opener
    function stopOpener() {
        isRunning = false;
        log(`\n⏹️ PARADO! Cases abertos: ${casesOpened}`, 'warn');
    }
    
    // Criar interface de controle
    function createUI() {
        // Remove UI anterior se existir
        const oldUI = document.getElementById('case-opener-ui');
        if (oldUI) oldUI.remove();
        
        const ui = document.createElement('div');
        ui.id = 'case-opener-ui';
        ui.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
            color: white;
            padding: 20px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(124, 58, 237, 0.4);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            min-width: 280px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        
        ui.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <div style="font-size: 28px;">🎁</div>
                <div>
                    <div style="font-weight: bold; font-size: 18px;">Auto Opener</div>
                    <div style="font-size: 12px; opacity: 0.8;">7TV Cases</div>
                </div>
            </div>
            
            <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="opacity: 0.8;">Progresso:</span>
                    <span style="font-weight: bold;" id="case-count">0/${CONFIG.maxCases}</span>
                </div>
                <div style="background: rgba(0,0,0,0.3); height: 8px; border-radius: 4px; overflow: hidden;">
                    <div id="case-progress" style="background: linear-gradient(90deg, #34d399, #10b981); height: 100%; width: 0%; transition: width 0.3s;"></div>
                </div>
                <div id="status-text" style="font-size: 11px; opacity: 0.7; margin-top: 8px; text-align: center;">
                    Aguardando...
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                <button id="start-btn" style="
                    flex: 1;
                    padding: 12px;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    background: #10b981;
                    color: white;
                    font-size: 14px;
                    transition: all 0.2s;
                " onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                    ▶ INICIAR
                </button>
                <button id="stop-btn" style="
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
                " disabled onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">
                    ⏹ PARAR
                </button>
            </div>
            
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                <label style="font-size: 13px; opacity: 0.9;">Quantidade:</label>
                <input type="number" id="max-cases-input" value="${CONFIG.maxCases}" min="1" max="100" 
                    style="
                        flex: 1;
                        padding: 8px;
                        border: none;
                        border-radius: 6px;
                        background: rgba(0,0,0,0.2);
                        color: white;
                        font-size: 14px;
                        font-weight: bold;
                        text-align: center;
                    ">
            </div>
            
            <div style="font-size: 11px; opacity: 0.7; text-align: center; margin-top: 10px;">
                Pressione ESC para fechar
            </div>
        `;
        
        document.body.appendChild(ui);
        
        // Event listeners
        document.getElementById('start-btn').addEventListener('click', () => {
            const newMax = parseInt(document.getElementById('max-cases-input').value) || 10;
            CONFIG.maxCases = newMax;
            document.getElementById('case-count').textContent = `0/${CONFIG.maxCases}`;
            document.getElementById('start-btn').disabled = true;
            document.getElementById('stop-btn').disabled = false;
            document.getElementById('start-btn').style.opacity = '0.5';
            document.getElementById('stop-btn').style.opacity = '1';
            startOpener();
        });
        
        document.getElementById('stop-btn').addEventListener('click', () => {
            document.getElementById('start-btn').disabled = false;
            document.getElementById('stop-btn').disabled = true;
            document.getElementById('start-btn').style.opacity = '1';
            document.getElementById('stop-btn').style.opacity = '0.5';
            stopOpener();
        });
        
        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                ui.remove();
            }
        });
        
        // Atualizar UI periodicamente
        setInterval(() => {
            if (document.getElementById('case-count')) {
                document.getElementById('case-count').textContent = `${casesOpened}/${CONFIG.maxCases}`;
                const progress = (casesOpened / CONFIG.maxCases) * 100;
                document.getElementById('case-progress').style.width = `${progress}%`;
                
                // Atualizar texto de status
                const statusEl = document.getElementById('status-text');
                if (statusEl) {
                    if (isRunning) {
                        if (currentStep === 'unlock') {
                            statusEl.textContent = '🎯 Procurando case...';
                        } else {
                            statusEl.textContent = '⏳ Aguardando animação...';
                        }
                    } else {
                        statusEl.textContent = 'Pronto para iniciar';
                    }
                }
            }
        }, 500);
    }
    
    // Adicionar controles globais
    window.caseOpener = {
        start: startOpener,
        stop: stopOpener,
        setMax: (num) => { CONFIG.maxCases = num; log(`✅ Máximo alterado para ${num}`, 'success'); },
        config: CONFIG,
        status: () => {
            log(`\n📊 STATUS:`, 'info');
            log(`   • Rodando: ${isRunning ? 'Sim' : 'Não'}`, 'info');
            log(`   • Cases abertos: ${casesOpened}/${CONFIG.maxCases}`, 'info');
            log(`   • Passo atual: ${currentStep}`, 'info');
        }
    };
    
    // Inicializar
    log('\n✅ Script carregado com sucesso!', 'success');
    log('\n📝 COMANDOS DISPONÍVEIS:', 'info');
    log('   • caseOpener.start()  - Iniciar', 'info');
    log('   • caseOpener.stop()   - Parar', 'info');
    log('   • caseOpener.status() - Ver status', 'info');
    log('   • caseOpener.setMax(X) - Definir quantidade\n', 'info');
    
    // Criar UI automaticamente
    setTimeout(() => {
        createUI();
        log('🎨 Interface criada! Verifique no canto superior direito.', 'success');
    }, 1000);
    
})();
