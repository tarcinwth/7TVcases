// 7TV Auto Case Opener - FINAL VERSION
// Automatically clicks "Unlock Case" and then "CONFIRM"

(function() {
    'use strict';
    
    console.log('%c🎁 7TV Auto Case Opener v3.0', 'color: #7c3aed; font-size: 16px; font-weight: bold');
    console.log('%c================================', 'color: #7c3aed');
    
    // CONFIGURATION
    const CONFIG = {
        maxCases: 10,              // Number of cases to open
        unlockDelay: 500,          // Initial delay before clicking "Unlock" (0.5s)
        animationWait: 12000,      // Wait for case animation (12s - safety margin)
        confirmDelay: 500,         // Delay before clicking "Confirm" (0.5s)
        nextCaseDelay: 2000,       // Delay before opening next case (2s)
        debug: true
    };
    
    let casesOpened = 0;
    let isRunning = false;
    let currentStep = 'unlock'; // 'unlock' or 'confirm'
    
    // Log function
    function log(msg, type = 'info') {
        const styles = {
            info: 'color: #60a5fa',
            success: 'color: #34d399',
            error: 'color: #f87171',
            warn: 'color: #fbbf24'
        };
        console.log(`%c${msg}`, styles[type] || styles.info);
    }
    
    // Find "Unlock Case" button
    function findUnlockButton() {
        const buttons = Array.from(document.querySelectorAll('button'));
        
        for (let btn of buttons) {
            const text = btn.textContent.trim();
            // Look for "Unlock Case" with or without price
            if (text.includes('Unlock Case') || text.match(/Unlock Case.*\$\d+/)) {
                // Check if visible
                const rect = btn.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    return btn;
                }
            }
        }
        return null;
    }
    
    // Find "CONFIRM" button
    function findConfirmButton() {
        const buttons = Array.from(document.querySelectorAll('button'));
        
        for (let btn of buttons) {
            const text = btn.textContent.trim().toUpperCase();
            if (text === 'CONFIRM') {
                // Check if visible
                const rect = btn.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    return btn;
                }
            }
        }
        return null;
    }
    
    // Click a button
    function clickButton(button, buttonName) {
        if (!button) {
            log(`❌ Button "${buttonName}" not found`, 'error');
            return false;
        }
        
        try {
            // Scroll to button
            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Click button
            button.click();
            log(`✅ Clicked "${buttonName}"`, 'success');
            return true;
        } catch (e) {
            log(`❌ Error clicking "${buttonName}": ${e.message}`, 'error');
            return false;
        }
    }
    
    // Open next case
    async function openCase() {
        if (casesOpened >= CONFIG.maxCases) {
            stopOpener();
            log(`\n🎉 FINISHED! ${casesOpened} cases opened!`, 'success');
            log(`💰 Check your inventory!`, 'info');
            return;
        }
        
        if (!isRunning) return;
        
        log(`\n📦 Case ${casesOpened + 1}/${CONFIG.maxCases}`, 'info');
        
        // Step 1: Click "Unlock Case"
        setTimeout(() => {
            const unlockBtn = findUnlockButton();
            if (clickButton(unlockBtn, 'Unlock Case')) {
                currentStep = 'confirm';
                log(`⏳ Waiting for animation (${CONFIG.animationWait/1000}s)...`, 'warn');
                
                // Step 2: Wait for animation
                setTimeout(() => {
                    log('🔍 Looking for CONFIRM button...', 'info');
                    const confirmBtn = findConfirmButton();
                    
                    if (clickButton(confirmBtn, 'CONFIRM')) {
                        casesOpened++;
                        currentStep = 'unlock';
                        log(`✅ Case ${casesOpened}/${CONFIG.maxCases} confirmed!`, 'success');
                        
                        // Step 3: Open next case
                        setTimeout(() => {
                            openCase();
                        }, CONFIG.nextCaseDelay);
                    } else {
                        log('⚠️ CONFIRM not found, waiting 2s...', 'warn');
                        // Retry confirm
                        setTimeout(() => {
                            const confirmBtn = findConfirmButton();
                            if (clickButton(confirmBtn, 'CONFIRM')) {
                                casesOpened++;
                                currentStep = 'unlock';
                                log(`✅ Case ${casesOpened}/${CONFIG.maxCases} confirmed!`, 'success');
                                setTimeout(() => openCase(), CONFIG.nextCaseDelay);
                            } else {
                                log('❌ Failed to confirm after multiple attempts. Stopping...', 'error');
                                stopOpener();
                            }
                        }, 2000);
                    }
                }, CONFIG.animationWait);
            } else {
                log('❌ "Unlock Case" button not found. Stopping...', 'error');
                stopOpener();
            }
        }, CONFIG.unlockDelay);
    }
    
    // Start opener
    function startOpener() {
        if (isRunning) {
            log('⚠️ Already running!', 'warn');
            return;
        }
        
        isRunning = true;
        casesOpened = 0;
        
        log(`\n🚀 STARTING...`, 'success');
        log(`📊 Configuration:`, 'info');
        log(`   • Cases: ${CONFIG.maxCases}`, 'info');
        log(`   • Animation time: ${CONFIG.animationWait/1000}s`, 'info');
        log(`   • Delay between cases: ${CONFIG.nextCaseDelay/1000}s`, 'info');
        log(`   • Estimated total time: ~${(CONFIG.maxCases * (CONFIG.animationWait + CONFIG.nextCaseDelay))/60000} minutes`, 'info');
        log(`\n⏳ Starting in 2 seconds...\n`, 'warn');
        
        setTimeout(() => {
            openCase();
        }, 2000);
    }
    
    // Stop opener
    function stopOpener() {
        isRunning = false;
        log(`\n⏹️ STOPPED! Cases opened: ${casesOpened}`, 'warn');
    }
    
    // Create UI
    function createUI() {
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
                    <span style="opacity: 0.8;">Progress:</span>
                    <span style="font-weight: bold;" id="case-count">0/${CONFIG.maxCases}</span>
                </div>
                <div style="background: rgba(0,0,0,0.3); height: 8px; border-radius: 4px; overflow: hidden;">
                    <div id="case-progress" style="background: linear-gradient(90deg, #34d399, #10b981); height: 100%; width: 0%; transition: width 0.3s;"></div>
                </div>
                <div id="status-text" style="font-size: 11px; opacity: 0.7; margin-top: 8px; text-align: center;">
                    Waiting...
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                <button id="start-btn" style="flex:1;padding:12px;border:none;border-radius:8px;font-weight:bold;cursor:pointer;background:#10b981;color:white;font-size:14px;">
                    ▶ START
                </button>
                <button id="stop-btn" disabled style="flex:1;padding:12px;border:none;border-radius:8px;font-weight:bold;cursor:pointer;background:#ef4444;color:white;font-size:14px;opacity:0.5;">
                    ⏹ STOP
                </button>
            </div>
            
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                <label style="font-size: 13px;">Amount:</label>
                <input type="number" id="max-cases-input" value="${CONFIG.maxCases}" min="1" max="100"
                    style="flex:1;padding:8px;border:none;border-radius:6px;background:rgba(0,0,0,0.2);color:white;text-align:center;">
            </div>
            
            <div style="font-size: 11px; text-align: center;">
                Press ESC to close
            </div>
        `;
        
        document.body.appendChild(ui);
    }
    
    // Global controls
    window.caseOpener = {
        start: startOpener,
        stop: stopOpener,
        setMax: (num) => { CONFIG.maxCases = num; log(`✅ Max set to ${num}`, 'success'); },
        config: CONFIG,
        status: () => {
            log(`\n📊 STATUS:`, 'info');
            log(`   • Running: ${isRunning ? 'Yes' : 'No'}`, 'info');
            log(`   • Cases opened: ${casesOpened}/${CONFIG.maxCases}`, 'info');
            log(`   • Current step: ${currentStep}`, 'info');
        }
    };
    
    log('\n✅ Script loaded successfully!', 'success');
    
    setTimeout(createUI, 1000);
    
})();
