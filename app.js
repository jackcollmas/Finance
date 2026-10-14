// Finance App - Main JavaScript

// State Management
let state = {
    accounts: {},
    accountsMeta: {}, // Store account names and icons
    profits: [],
    debts: [],
    spendings: [],
    obligations: {
        tithe: 0,
        seed: 0
    },
    calcHistory: [],
    transactions: []
};

// Current action tracking
let currentAction = {
    type: null, // 'add' or 'subtract'
    account: null
};

let currentDebtId = null;
let currentProfitId = null;
let selectedIcon = '💰';
let currentObligation = null; // 'tithe' or 'seed'
let confirmAction = null; // Store the function to execute after confirmation
let currentSpendingId = null;

// Calculator state
let calcCurrent = '0';
let calcPrevious = null;
let calcOperator = null;
let calcNewNumber = true;
let currentTransactionFilter = 'all';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initializeDefaultAccounts();
    initializeSectionStates();
    render();
    setupEventListeners();
    registerServiceWorker();
});

// Initialize section collapse states
function initializeSectionStates() {
    const savedStates = localStorage.getItem('sectionStates');
    if (savedStates) {
        const states = JSON.parse(savedStates);
        Object.keys(states).forEach(section => {
            if (states[section].collapsed) {
                const content = document.getElementById(`${section}Content`);
                const icon = document.getElementById(`${section}ToggleIcon`);
                if (content && icon) {
                    content.classList.add('collapsed');
                    icon.textContent = '▶';
                }
            }
        });
    }
}

// Initialize default accounts if none exist
function initializeDefaultAccounts() {
    if (Object.keys(state.accounts).length === 0) {
        state.accounts = {
            bank: 0,
            cash: 0,
            savings1: 0,
            savings2: 0
        };
        state.accountsMeta = {
            bank: { name: 'Bank', icon: '🏦', order: 0 },
            cash: { name: 'Cash', icon: '💵', order: 1 },
            savings1: { name: 'Savings 1', icon: '🔒', order: 2 },
            savings2: { name: 'Savings 2', icon: '🔐', order: 3 }
        };
        saveState();
    }
    // Ensure accountsMeta exists for legacy data
    if (!state.accountsMeta) {
        state.accountsMeta = {};
        Object.keys(state.accounts).forEach((key, index) => {
            state.accountsMeta[key] = {
                name: getAccountName(key),
                icon: getDefaultIcon(key),
                order: index
            };
        });
        saveState();
    }
    // Ensure obligations exists
    if (!state.obligations) {
        state.obligations = { tithe: 0, seed: 0 };
        saveState();
    }
}

function getDefaultIcon(accountKey) {
    const icons = {
        bank: '🏦',
        cash: '💵',
        savings1: '🔒',
        savings2: '🔐'
    };
    return icons[accountKey] || '💰';
}

// Setup event listeners
function setupEventListeners() {
    // Modal background click to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });

    // Icon picker
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('icon-option')) {
            document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedIcon = e.target.dataset.icon;
        }
    });

    // Profit paid checkbox
    const profitPaidCheck = document.getElementById('profitPaidCheck');
    if (profitPaidCheck) {
        profitPaidCheck.addEventListener('change', (e) => {
            document.getElementById('profitAccountSelect').style.display = 
                e.target.checked ? 'block' : 'none';
        });
    }

    // Payment type radio buttons
    document.querySelectorAll('input[name="paymentType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.getElementById('partialAmount').disabled = e.target.value === 'full';
        });
    });

    // Share button
    document.getElementById('shareBtn').addEventListener('click', openShareModal);

    // Enter key handlers
    document.getElementById('moneyInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') confirmMoneyAction();
    });

    document.getElementById('profitAmount').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') confirmAddProfit();
    });
}

// LocalStorage functions
function saveState() {
    localStorage.setItem('financialLifeData', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('financialLifeData');
    if (saved) {
        state = JSON.parse(saved);
    }
}

// Render functions
function render() {
    renderAccounts();
    renderProfits();
    renderSpendings();
    renderDebts();
    renderTotal();
    renderObligations();
}

function renderTotal() {
    const total = Object.values(state.accounts).reduce((sum, val) => sum + val, 0);
    document.getElementById('totalAmount').textContent = formatCurrency(total);
    
    // Calculate pending obligations
    const totalDebts = state.debts.reduce((sum, d) => sum + d.amount, 0);
    const pendingObligations = (state.obligations?.tithe || 0) + (state.obligations?.seed || 0);
    
    const totalOwed = totalDebts + pendingObligations;
    
    // Show "After Bills & Tithe" only if there are obligations
    if (totalOwed > 0) {
        const afterObligations = total - totalOwed;
        document.getElementById('afterObligationsAmount').textContent = formatCurrency(afterObligations);
        document.getElementById('afterObligations').style.display = 'block';
    } else {
        document.getElementById('afterObligations').style.display = 'none';
    }
}

function renderObligations() {
    const tithe = state.obligations?.tithe || 0;
    const seed = state.obligations?.seed || 0;
    const total = tithe + seed;
    
    document.getElementById('pendingTithe').textContent = formatCurrency(tithe);
    document.getElementById('pendingSeed').textContent = formatCurrency(seed);
    document.getElementById('totalPendingObligations').textContent = formatCurrency(total);
    
    // Show indicator if there are obligations
    const toggleBtn = document.getElementById('sidebarToggle');
    if (total > 0) {
        toggleBtn.style.background = 'var(--danger)';
    } else {
        toggleBtn.style.background = 'var(--warning)';
    }
}

function renderAccounts() {
    const accountsGrid = document.getElementById('accountsGrid');
    const accountEntries = Object.entries(state.accounts)
        .map(([key, value]) => ({
            key,
            value,
            meta: state.accountsMeta[key] || { name: key, icon: '💰', order: 999 }
        }))
        .sort((a, b) => a.meta.order - b.meta.order);

    accountsGrid.innerHTML = accountEntries.map(({ key, value, meta }) => `
        <div class="account-card" data-account="${key}">
            <button class="delete-btn" onclick="deleteAccount('${key}')" title="Delete account">×</button>
            <div class="account-icon">${meta.icon}</div>
            <div class="account-name">${meta.name}</div>
            <div class="account-amount">${formatCurrency(value)}</div>
            <div class="account-actions">
                <button class="btn-small btn-success" onclick="addMoney('${key}')">+</button>
                <button class="btn-small btn-danger" onclick="subtractMoney('${key}')">-</button>
            </div>
        </div>
    `).join('');
}

function renderProfits() {
    const profitsList = document.getElementById('profitsList');
    
    if (state.profits.length === 0) {
        profitsList.innerHTML = '<div class="empty-state">No profits recorded yet</div>';
    } else {
        profitsList.innerHTML = state.profits.map(profit => {
            const tithe = profit.amount * 0.1;
            const other = profit.amount * 0.1;
            const total = tithe + other;
            let paidToText = '';
            if (profit.paid) {
                if (profit.paidTo === 'multiple' && profit.splits) {
                    paidToText = `Split: ${profit.splits.map(s => `${getAccountName(s.account)} (${formatCurrency(s.amount)})`).join(', ')}`;
                } else {
                    paidToText = `Added to ${getAccountName(profit.paidTo)}`;
                }
            }
            return `
                <div class="profit-item ${profit.paid ? 'paid' : ''}">
                    <div class="profit-info">
                        <div class="profit-desc">${profit.description || 'Profit'}</div>
                        <div class="profit-details">
                            <span>Amount: ${formatCurrency(profit.amount)}</span>
                            <span class="profit-tithe">Tithe (10%): ${formatCurrency(tithe)}</span>
                            <span class="profit-tithe">Other (10%): ${formatCurrency(other)}</span>
                        </div>
                        ${profit.paid ? `<div class="profit-status">✓ ${paidToText}</div>` : ''}
                    </div>
                    <div class="profit-actions">
                        ${!profit.paid ? `<button class="btn-small btn-success" onclick="markProfitPaid('${profit.id}')">Mark Paid</button>` : ''}
                        <button class="btn-small btn-danger" onclick="deleteProfit('${profit.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Update totals
    const totalProfits = state.profits.reduce((sum, p) => sum + p.amount, 0);
    const totalTithe = totalProfits * 0.1;
    const totalOther = totalProfits * 0.1;
    const totalSetAside = totalTithe + totalOther;
    
    document.getElementById('totalProfits').textContent = formatCurrency(totalProfits);
    document.getElementById('totalTithe').textContent = formatCurrency(totalTithe);
    document.getElementById('totalOther').textContent = formatCurrency(totalOther);
    document.getElementById('totalSetAside').textContent = formatCurrency(totalSetAside);
}

function renderDebts() {
    const debtsList = document.getElementById('debtsList');
    
    if (state.debts.length === 0) {
        debtsList.innerHTML = '<div class="empty-state">No debts or bills to track</div>';
        document.getElementById('debtsTotal').style.display = 'none';
    } else {
        debtsList.innerHTML = state.debts.map(debt => `
            <div class="debt-item">
                <div class="debt-header">
                    <div class="debt-info">
                        <h4>${debt.description}</h4>
                        <div class="debt-amount">${formatCurrency(debt.amount)}</div>
                    </div>
                    <div class="debt-actions">
                        <button class="btn-small btn-success" onclick="openPayDebtModal('${debt.id}')">Pay</button>
                        <button class="btn-small btn-danger" onclick="deleteDebt('${debt.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Show total debts
        const totalDebts = state.debts.reduce((sum, d) => sum + d.amount, 0);
        document.getElementById('totalDebts').textContent = formatCurrency(totalDebts);
        document.getElementById('debtsTotal').style.display = 'block';
    }
}

// Spending Tracker
function renderSpendings() {
    const spendingsList = document.getElementById('spendingsList');
    
    if (!state.spendings || state.spendings.length === 0) {
        spendingsList.innerHTML = '<div class="empty-state">No spending recorded yet</div>';
        document.getElementById('spendingsTotal').style.display = 'none';
    } else {
        spendingsList.innerHTML = state.spendings.map(spending => {
            const isPending = !spending.paid;
            return `
            <div class="spending-item ${isPending ? 'pending-spending' : ''}">
                <div class="spending-header">
                    <div class="spending-info">
                        <h4>${spending.description}</h4>
                        <div class="spending-details">
                            <span class="spending-amount">${formatCurrency(spending.amount)}</span>
                            ${spending.account ? 
                                `<span class="spending-from">from ${getAccountName(spending.account)}</span>` :
                                `<span class="spending-pending">⏳ Not assigned</span>`
                            }
                        </div>
                        <div class="spending-date">${formatDate(spending.date)}</div>
                    </div>
                    <div class="spending-actions">
                        ${isPending ? 
                            `<button class="btn-small btn-success" onclick="assignSpendingAccount('${spending.id}')">Assign</button>` : 
                            ''
                        }
                        <button class="btn-small btn-danger" onclick="deleteSpending('${spending.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
        }).join('');
        
        // Show total spending (only paid ones)
        const totalSpending = state.spendings
            .filter(s => s.paid)
            .reduce((sum, s) => sum + s.amount, 0);
        const pendingSpending = state.spendings
            .filter(s => !s.paid)
            .reduce((sum, s) => sum + s.amount, 0);
            
        document.getElementById('totalSpending').textContent = formatCurrency(totalSpending);
        
        if (pendingSpending > 0) {
            document.getElementById('pendingSpending').textContent = formatCurrency(pendingSpending);
            document.getElementById('pendingSpendingRow').style.display = 'flex';
        } else {
            document.getElementById('pendingSpendingRow').style.display = 'none';
        }
        
        document.getElementById('spendingsTotal').style.display = 'block';
    }
}

function assignSpendingAccount(spendingId) {
    const spending = state.spendings.find(s => s.id === spendingId);
    if (!spending) return;
    
    document.getElementById('assignSpendingDescription').textContent = `"${spending.description}" - ${formatCurrency(spending.amount)}`;
    
    const select = document.getElementById('assignSpendingAccountSelect');
    select.innerHTML = generateAccountSelect();
    
    currentSpendingId = spendingId;
    showModal('assignSpendingModal');
}

function confirmAssignSpending() {
    const spending = state.spendings.find(s => s.id === currentSpendingId);
    if (!spending) return;
    
    const account = document.getElementById('assignSpendingAccountSelect').value;
    
    // Check if account has sufficient funds
    if (state.accounts[account] < spending.amount) {
        const accountName = getAccountName(account);
        showConfirmModal(
            'Insufficient Funds',
            `${accountName} has ${formatCurrency(state.accounts[account])} but you're assigning ${formatCurrency(spending.amount)}.`,
            'Continue anyway?',
            () => {
                spending.account = account;
                spending.paid = true;
                state.accounts[account] -= spending.amount;
                saveState();
                render();
                closeAssignSpendingModal();
            },
            'Continue'
        );
        return;
    }
    
    spending.account = account;
    spending.paid = true;
    state.accounts[account] -= spending.amount;
    
    saveState();
    render();
    closeAssignSpendingModal();
}

function closeAssignSpendingModal() {
    closeAllModals();
    currentSpendingId = null;
}

function addSpending() {
    document.getElementById('spendingDescription').value = '';
    document.getElementById('spendingAmount').value = '';
    document.getElementById('spendingAccountCheck').checked = false;
    document.getElementById('spendingAccountSelectDiv').style.display = 'none';
    
    // Populate account select
    const select = document.getElementById('spendingAccountSelect');
    select.innerHTML = generateAccountSelect();
    
    showModal('spendingModal');
    setTimeout(() => document.getElementById('spendingDescription').focus(), 100);
}

function confirmAddSpending() {
    const description = document.getElementById('spendingDescription').value.trim();
    const amount = parseFloat(document.getElementById('spendingAmount').value);
    const assignNow = document.getElementById('spendingAccountCheck').checked;
    const account = assignNow ? document.getElementById('spendingAccountSelect').value : null;

    if (!description) {
        alert('Please enter a description');
        return;
    }

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    // If assigning now, check if account has sufficient funds
    if (assignNow && state.accounts[account] < amount) {
        const accountName = getAccountName(account);
        showConfirmModal(
            'Insufficient Funds',
            `${accountName} has ${formatCurrency(state.accounts[account])} but you're spending ${formatCurrency(amount)}.`,
            'Continue anyway?',
            () => {
                recordSpending(description, amount, account);
            },
            'Continue'
        );
        return;
    }

    recordSpending(description, amount, account);
}

function recordSpending(description, amount, account) {
    const spending = {
        id: generateId(),
        description: description,
        amount: amount,
        account: account,
        paid: account !== null,
        date: new Date().toISOString()
    };

    if (!state.spendings) {
        state.spendings = [];
    }

    state.spendings.push(spending);
    
    // Only debit if account is assigned
    if (account) {
        state.accounts[account] -= amount;
    }

    saveState();
    render();
    closeSpendingModal();
}

function deleteSpending(spendingId) {
    const spending = state.spendings.find(s => s.id === spendingId);
    
    showConfirmModal(
        'Delete Spending',
        `Delete "${spending.description}" (${formatCurrency(spending.amount)})?`,
        '',
        () => {
            state.spendings = state.spendings.filter(s => s.id !== spendingId);
            saveState();
            render();
        }
    );
}

function closeSpendingModal() {
    closeAllModals();
}

function toggleSpendingAccountSelect() {
    const checkbox = document.getElementById('spendingAccountCheck');
    const div = document.getElementById('spendingAccountSelectDiv');
    div.style.display = checkbox.checked ? 'block' : 'none';
}

// Account Management
function openAddAccountModal() {
    document.getElementById('accountName').value = '';
    selectedIcon = '💰';
    document.querySelectorAll('.icon-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.icon === '💰');
    });
    showModal('addAccountModal');
    setTimeout(() => document.getElementById('accountName').focus(), 100);
}

function confirmAddAccount() {
    const name = document.getElementById('accountName').value.trim();
    
    if (!name) {
        alert('Please enter an account name');
        return;
    }

    // Create a unique key from the name
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();

    state.accounts[key] = 0;
    state.accountsMeta[key] = {
        name: name,
        icon: selectedIcon,
        order: Object.keys(state.accounts).length
    };

    saveState();
    render();
    closeAddAccountModal();
}

function deleteAccount(accountKey) {
    const meta = state.accountsMeta[accountKey];
    const balance = state.accounts[accountKey];
    
    const message = balance !== 0 
        ? `"${meta.name}" has a balance of ${formatCurrency(balance)}.`
        : `Delete "${meta.name}"?`;
    
    const warning = balance !== 0 
        ? 'This account has a balance. Deleting it will remove this amount from your total.'
        : '';
    
    showConfirmModal(
        'Delete Account',
        message,
        warning,
        () => {
            delete state.accounts[accountKey];
            delete state.accountsMeta[accountKey];
            saveState();
            render();
        }
    );
}

function addMoney(account) {
    currentAction = { type: 'add', account };
    const accountName = state.accountsMeta[account]?.name || account;
    document.getElementById('moneyModalTitle').textContent = `Add Money to ${accountName}`;
    document.getElementById('moneyInput').value = '';
    showModal('moneyModal');
    setTimeout(() => document.getElementById('moneyInput').focus(), 100);
}

function subtractMoney(account) {
    currentAction = { type: 'subtract', account };
    const accountName = state.accountsMeta[account]?.name || account;
    document.getElementById('moneyModalTitle').textContent = `Subtract Money from ${accountName}`;
    document.getElementById('moneyInput').value = '';
    showModal('moneyModal');
    setTimeout(() => document.getElementById('moneyInput').focus(), 100);
}

function confirmMoneyAction() {
    const amount = parseFloat(document.getElementById('moneyInput').value);
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    if (currentAction.type === 'add') {
        state.accounts[currentAction.account] += amount;
    } else {
        if (state.accounts[currentAction.account] < amount) {
            const accountName = state.accountsMeta[currentAction.account]?.name || currentAction.account;
            showConfirmModal(
                'Insufficient Funds',
                `${accountName} has ${formatCurrency(state.accounts[currentAction.account])} but you're trying to subtract ${formatCurrency(amount)}.`,
                'This will result in a negative balance. Continue anyway?',
                () => {
                    state.accounts[currentAction.account] -= amount;
                    saveState();
                    render();
                    closeMoneyModal();
                },
                'Continue'
            );
            return;
        }
        state.accounts[currentAction.account] -= amount;
    }

    saveState();
    render();
    closeMoneyModal();
}

// Profit Management
function addProfit() {
    document.getElementById('profitDescription').value = '';
    document.getElementById('profitAmount').value = '';
    showModal('profitModal');
    setTimeout(() => document.getElementById('profitDescription').focus(), 100);
}

function confirmAddProfit() {
    const description = document.getElementById('profitDescription').value.trim();
    const amount = parseFloat(document.getElementById('profitAmount').value);

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    const profit = {
        id: generateId(),
        description: description || 'Profit',
        amount: amount,
        paid: false,
        paidTo: null,
        date: new Date().toISOString()
    };

    state.profits.push(profit);
    
    // Add 10% to tithe and 10% to seed
    const tithe = amount * 0.1;
    const seed = amount * 0.1;
    
    if (!state.obligations) {
        state.obligations = { tithe: 0, seed: 0 };
    }
    
    state.obligations.tithe += tithe;
    state.obligations.seed += seed;
    
    saveState();
    render();
    closeProfitModal();
}

function markProfitPaid(profitId) {
    const profit = state.profits.find(p => p.id === profitId);
    if (!profit) return;

    currentProfitId = profitId;
    const tithe = profit.amount * 0.1;
    const other = profit.amount * 0.1;

    document.getElementById('markProfitDescription').textContent = profit.description;
    document.getElementById('markProfitAmount').textContent = formatCurrency(profit.amount);
    document.getElementById('markProfitTithe').textContent = formatCurrency(tithe + other) + ' (already tracked in sidebar)';

    // Reset splits with dynamic accounts
    const splitsContainer = document.getElementById('profitAccountSplits');
    splitsContainer.innerHTML = `
        <div class="split-row">
            ${generateAccountSelect()}
            <input type="number" class="split-amount" placeholder="Amount" min="0" step="0.01">
            <button class="btn-icon-small" onclick="removeProfitSplit(this)" style="display: none;">×</button>
        </div>
    `;

    showModal('markProfitPaidModal');
}

function addProfitSplit() {
    const splitsContainer = document.getElementById('profitAccountSplits');
    const splitRow = document.createElement('div');
    splitRow.className = 'split-row';
    splitRow.innerHTML = `
        ${generateAccountSelect()}
        <input type="number" class="split-amount" placeholder="Amount" min="0" step="0.01">
        <button class="btn-icon-small" onclick="removeProfitSplit(this)">×</button>
    `;
    splitsContainer.appendChild(splitRow);

    // Show remove button on all rows if more than one
    const removeButtons = splitsContainer.querySelectorAll('.btn-icon-small');
    if (removeButtons.length > 1) {
        removeButtons.forEach(btn => btn.style.display = 'flex');
    }
}

function removeProfitSplit(button) {
    const splitsContainer = document.getElementById('profitAccountSplits');
    const splitRow = button.closest('.split-row');
    splitRow.remove();

    // Hide remove buttons if only one row left
    const removeButtons = splitsContainer.querySelectorAll('.btn-icon-small');
    if (removeButtons.length === 1) {
        removeButtons[0].style.display = 'none';
    }
}

function confirmMarkProfitPaid() {
    const profit = state.profits.find(p => p.id === currentProfitId);
    if (!profit) return;

    // Get splits
    const splits = [];
    const splitRows = document.querySelectorAll('#profitAccountSplits .split-row');
    
    splitRows.forEach(row => {
        const account = row.querySelector('.account-select').value;
        const amount = parseFloat(row.querySelector('.split-amount').value);
        if (amount && amount > 0) {
            splits.push({ account, amount });
        }
    });

    if (splits.length === 0) {
        alert('Please enter amounts to add to your accounts');
        return;
    }

    // Verify total matches profit amount
    const totalSplits = splits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(totalSplits - profit.amount) > 0.01) {
        alert(`Total amounts (${formatCurrency(totalSplits)}) must equal profit amount (${formatCurrency(profit.amount)})`);
        return;
    }

    // Add money to accounts
    splits.forEach(split => {
        state.accounts[split.account] += split.amount;
    });

    // Mark profit as paid
    profit.paid = true;
    profit.paidTo = splits.length === 1 ? splits[0].account : 'multiple';
    profit.splits = splits;

    saveState();
    render();
    closeMarkProfitPaidModal();
}

function deleteProfit(profitId) {
    const profit = state.profits.find(p => p.id === profitId);
    const tithe = profit.amount * 0.1;
    const seed = profit.amount * 0.1;
    
    showConfirmModal(
        'Delete Profit Entry',
        `Delete "${profit.description || 'Profit'}" (${formatCurrency(profit.amount)})?`,
        '',
        () => {
            state.profits = state.profits.filter(p => p.id !== profitId);
            saveState();
            render();
        }
    );
}

// Debt Management
function addDebt() {
    document.getElementById('debtDescription').value = '';
    document.getElementById('debtAmount').value = '';
    showModal('debtModal');
    setTimeout(() => document.getElementById('debtDescription').focus(), 100);
}

function confirmAddDebt() {
    const description = document.getElementById('debtDescription').value.trim();
    const amount = parseFloat(document.getElementById('debtAmount').value);

    if (!description) {
        alert('Please enter a description');
        return;
    }

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    const debt = {
        id: generateId(),
        description: description,
        amount: amount,
        date: new Date().toISOString()
    };

    state.debts.push(debt);
    saveState();
    render();
    closeDebtModal();
}

function openPayDebtModal(debtId) {
    const debt = state.debts.find(d => d.id === debtId);
    if (!debt) return;

    currentDebtId = debtId;
    document.getElementById('payDebtTitle').textContent = 'Pay Debt';
    document.getElementById('payDebtDescription').textContent = debt.description;
    document.getElementById('payFullAmount').textContent = formatCurrency(debt.amount);
    
    // Reset form
    document.querySelector('input[value="full"]').checked = true;
    document.getElementById('partialAmount').value = '';
    document.getElementById('partialAmount').disabled = true;
    
    // Reset splits with dynamic accounts
    const splitsContainer = document.getElementById('accountSplits');
    splitsContainer.innerHTML = `
        <div class="split-row">
            ${generateAccountSelect()}
            <input type="number" class="split-amount" placeholder="Amount" min="0" step="0.01">
            <button class="btn-icon-small" onclick="removeSplit(this)" style="display: none;">×</button>
        </div>
    `;

    showModal('payDebtModal');
}

function generateAccountSelect() {
    const accounts = Object.entries(state.accountsMeta)
        .map(([key, meta]) => ({ key, ...meta }))
        .sort((a, b) => a.order - b.order);
    
    const options = accounts.map(acc => 
        `<option value="${acc.key}">${acc.icon} ${acc.name}</option>`
    ).join('');
    
    return `<select class="account-select">${options}</select>`;
}

function addSplit() {
    const splitsContainer = document.getElementById('accountSplits');
    const splitRow = document.createElement('div');
    splitRow.className = 'split-row';
    splitRow.innerHTML = `
        ${generateAccountSelect()}
        <input type="number" class="split-amount" placeholder="Amount" min="0" step="0.01">
        <button class="btn-icon-small" onclick="removeSplit(this)">×</button>
    `;
    splitsContainer.appendChild(splitRow);

    // Show remove button on all rows if more than one
    const removeButtons = splitsContainer.querySelectorAll('.btn-icon-small');
    if (removeButtons.length > 1) {
        removeButtons.forEach(btn => btn.style.display = 'flex');
    }
}

function removeSplit(button) {
    const splitsContainer = document.getElementById('accountSplits');
    const splitRow = button.closest('.split-row');
    splitRow.remove();

    // Hide remove buttons if only one row left
    const removeButtons = splitsContainer.querySelectorAll('.btn-icon-small');
    if (removeButtons.length === 1) {
        removeButtons[0].style.display = 'none';
    }
}

function confirmPayDebt() {
    const debt = state.debts.find(d => d.id === currentDebtId);
    if (!debt) return;

    const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
    let paymentAmount;

    if (paymentType === 'full') {
        paymentAmount = debt.amount;
    } else {
        paymentAmount = parseFloat(document.getElementById('partialAmount').value);
        if (!paymentAmount || paymentAmount <= 0) {
            alert('Please enter a valid payment amount');
            return;
        }
        if (paymentAmount > debt.amount) {
            alert('Payment amount cannot exceed debt amount');
            return;
        }
    }

    // Get payment splits
    const splits = [];
    const splitRows = document.querySelectorAll('#accountSplits .split-row');
    
    splitRows.forEach(row => {
        const account = row.querySelector('.account-select').value;
        const amount = parseFloat(row.querySelector('.split-amount').value);
        if (amount && amount > 0) {
            splits.push({ account, amount });
        }
    });

    if (splits.length === 0) {
        alert('Please enter payment amounts');
        return;
    }

    // Verify total matches payment amount
    const totalSplits = splits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(totalSplits - paymentAmount) > 0.01) {
        alert(`Payment splits (${formatCurrency(totalSplits)}) must equal payment amount (${formatCurrency(paymentAmount)})`);
        return;
    }

    // Check if accounts have sufficient funds
    for (const split of splits) {
        if (state.accounts[split.account] < split.amount) {
            if (!confirm(`${getAccountName(split.account)} has insufficient funds. Continue anyway?`)) {
                return;
            }
        }
    }

    // Process payment
    splits.forEach(split => {
        state.accounts[split.account] -= split.amount;
        // Log transaction for each split
        logTransaction('debt_payment', debt.description, split.amount, getAccountName(split.account));
    });

    // Update or remove debt
    if (paymentType === 'full' || paymentAmount >= debt.amount) {
        state.debts = state.debts.filter(d => d.id !== currentDebtId);
    } else {
        debt.amount -= paymentAmount;
    }

    saveState();
    render();
    closePayDebtModal();
}

function deleteDebt(debtId) {
    const debt = state.debts.find(d => d.id === debtId);
    
    showConfirmModal(
        'Delete Debt',
        `Delete "${debt.description}" (${formatCurrency(debt.amount)})?`,
        '',
        () => {
            state.debts = state.debts.filter(d => d.id !== debtId);
            saveState();
            render();
        }
    );
}

// Export/Import
function openShareModal() {
    showModal('shareModal');
}

function exportData() {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-life-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

function resetAllData() {
    showConfirmModal(
        '⚠️ Reset All Data',
        'This will permanently delete ALL your data including accounts, profits, debts, spending, tithe, and seed.',
        'This action cannot be undone! Are you absolutely sure?',
        () => {
            localStorage.removeItem('financialLifeData');
            state = {
                accounts: {},
                accountsMeta: {},
                profits: [],
                debts: [],
                spendings: [],
                obligations: { tithe: 0, seed: 0 }
            };
            initializeDefaultAccounts();
            render();
            closeShareModal();
        },
        'Reset Everything'
    );
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedState = JSON.parse(e.target.result);
            
            if (!importedState.accounts || !importedState.profits || !importedState.debts) {
                throw new Error('Invalid data format');
            }

            if (confirm('This will replace all current data. Continue?')) {
                state = importedState;
                saveState();
                render();
                closeShareModal();
                alert('Data imported successfully!');
            }
        } catch (error) {
            alert('Error importing data. Please check the file format.');
            console.error(error);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Modal helpers
function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

function closeMoneyModal() {
    closeAllModals();
    currentAction = { type: null, account: null };
}

function closeAddAccountModal() {
    closeAllModals();
}

function closeProfitModal() {
    closeAllModals();
}

function closeMarkProfitPaidModal() {
    closeAllModals();
    currentProfitId = null;
}

function closeDebtModal() {
    closeAllModals();
}

function closePayDebtModal() {
    closeAllModals();
    currentDebtId = null;
}

function closeShareModal() {
    closeAllModals();
}

// Obligations Management
function toggleSidebar() {
    const sidebar = document.getElementById('obligationsSidebar');
    const arrow = document.getElementById('toggleArrow');
    sidebar.classList.toggle('open');
    arrow.textContent = sidebar.classList.contains('open') ? '▶' : '◀';
}

function toggleSection(sectionName) {
    const content = document.getElementById(`${sectionName}Content`);
    const icon = document.getElementById(`${sectionName}ToggleIcon`);
    
    if (!content || !icon) return;
    
    content.classList.toggle('collapsed');
    icon.textContent = content.classList.contains('collapsed') ? '▶' : '▼';
    
    // Save state
    const savedStates = localStorage.getItem('sectionStates');
    const states = savedStates ? JSON.parse(savedStates) : {};
    states[sectionName] = { collapsed: content.classList.contains('collapsed') };
    localStorage.setItem('sectionStates', JSON.stringify(states));
}

function editObligation(type) {
    currentObligation = type;
    const amount = state.obligations[type] || 0;
    const title = type === 'tithe' ? 'Tithe' : 'Seed';
    
    document.getElementById('editObligationTitle').textContent = `Edit ${title} Amount`;
    document.getElementById('currentObligationAmount').textContent = formatCurrency(amount);
    document.getElementById('editObligationInput').value = amount;
    
    showModal('editObligationModal');
    setTimeout(() => document.getElementById('editObligationInput').focus(), 100);
}

function confirmEditObligation() {
    const amount = parseFloat(document.getElementById('editObligationInput').value);
    
    if (isNaN(amount) || amount < 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (!state.obligations) {
        state.obligations = { tithe: 0, seed: 0 };
    }
    
    state.obligations[currentObligation] = amount;
    saveState();
    render();
    closeEditObligationModal();
}

function payObligation(type) {
    currentObligation = type;
    const amount = state.obligations[type] || 0;
    
    if (amount <= 0) {
        alert('No pending amount to pay');
        return;
    }
    
    const title = type === 'tithe' ? '🙏 Tithe' : '🌱 Seed';
    
    document.getElementById('payObligationTitle').textContent = `Pay ${title}`;
    document.getElementById('payObligationDescription').textContent = `Amount to pay: ${formatCurrency(amount)}`;
    
    // Reset splits with dynamic accounts
    const splitsContainer = document.getElementById('obligationAccountSplits');
    splitsContainer.innerHTML = `
        <div class="split-row">
            ${generateAccountSelect()}
            <input type="number" class="split-amount" placeholder="Amount" min="0" step="0.01" value="${amount}">
            <button class="btn-icon-small" onclick="removeObligationSplit(this)" style="display: none;">×</button>
        </div>
    `;
    
    showModal('payObligationModal');
}

function addObligationSplit() {
    const splitsContainer = document.getElementById('obligationAccountSplits');
    const splitRow = document.createElement('div');
    splitRow.className = 'split-row';
    splitRow.innerHTML = `
        ${generateAccountSelect()}
        <input type="number" class="split-amount" placeholder="Amount" min="0" step="0.01">
        <button class="btn-icon-small" onclick="removeObligationSplit(this)">×</button>
    `;
    splitsContainer.appendChild(splitRow);

    const removeButtons = splitsContainer.querySelectorAll('.btn-icon-small');
    if (removeButtons.length > 1) {
        removeButtons.forEach(btn => btn.style.display = 'flex');
    }
}

function removeObligationSplit(button) {
    const splitsContainer = document.getElementById('obligationAccountSplits');
    const splitRow = button.closest('.split-row');
    splitRow.remove();

    const removeButtons = splitsContainer.querySelectorAll('.btn-icon-small');
    if (removeButtons.length === 1) {
        removeButtons[0].style.display = 'none';
    }
}

function confirmPayObligation() {
    const obligationAmount = state.obligations[currentObligation] || 0;
    
    // Get splits
    const splits = [];
    const splitRows = document.querySelectorAll('#obligationAccountSplits .split-row');
    
    splitRows.forEach(row => {
        const account = row.querySelector('.account-select').value;
        const amount = parseFloat(row.querySelector('.split-amount').value);
        if (amount && amount > 0) {
            splits.push({ account, amount });
        }
    });

    if (splits.length === 0) {
        alert('Please enter payment amounts');
        return;
    }

    const totalSplits = splits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(totalSplits - obligationAmount) > 0.01) {
        alert(`Payment amounts (${formatCurrency(totalSplits)}) must equal obligation amount (${formatCurrency(obligationAmount)})`);
        return;
    }

    // Check sufficient funds
    for (const split of splits) {
        if (state.accounts[split.account] < split.amount) {
            const accountName = state.accountsMeta[split.account]?.name || split.account;
            if (!confirm(`${accountName} has insufficient funds. Continue anyway?`)) {
                return;
            }
        }
    }

    // Process payment
    splits.forEach(split => {
        state.accounts[split.account] -= split.amount;
    });

    // Clear obligation
    state.obligations[currentObligation] = 0;

    saveState();
    render();
    closePayObligationModal();
}

function closeEditObligationModal() {
    closeAllModals();
    currentObligation = null;
}

function closePayObligationModal() {
    closeAllModals();
    currentObligation = null;
}

// Confirmation Modal
function showConfirmModal(title, message, warning, onConfirm, buttonText = 'Delete') {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmWarning').textContent = warning;
    document.getElementById('confirmButton').textContent = buttonText;
    
    confirmAction = onConfirm;
    showModal('confirmModal');
}

function executeConfirmAction() {
    if (confirmAction) {
        confirmAction();
        confirmAction = null;
    }
    closeConfirmModal();
}

function closeConfirmModal() {
    closeAllModals();
    confirmAction = null;
}

// Calculator Functions
function openCalculator() {
    renderCalcHistory();
    showModal('calculatorModal');
}

function closeCalculator() {
    closeAllModals();
}

function numberCalc(num) {
    if (calcNewNumber) {
        calcCurrent = num;
        calcNewNumber = false;
    } else {
        calcCurrent = calcCurrent === '0' ? num : calcCurrent + num;
    }
    updateCalcDisplay();
}

function operatorCalc(op) {
    if (calcOperator && !calcNewNumber) {
        equalsCalc();
    }
    calcPrevious = calcCurrent;
    calcOperator = op;
    calcNewNumber = true;
}

function equalsCalc() {
    if (!calcOperator || !calcPrevious) return;
    
    const prev = parseFloat(calcPrevious);
    const curr = parseFloat(calcCurrent);
    let result;
    
    switch (calcOperator) {
        case '+': result = prev + curr; break;
        case '-': result = prev - curr; break;
        case '*': result = prev * curr; break;
        case '/': result = prev / curr; break;
        default: return;
    }
    
    // Save to history
    const calculation = {
        expression: `${prev} ${getOperatorSymbol(calcOperator)} ${curr}`,
        result: result,
        timestamp: new Date().toISOString()
    };
    
    if (!state.calcHistory) state.calcHistory = [];
    state.calcHistory.unshift(calculation);
    if (state.calcHistory.length > 10) state.calcHistory.pop();
    
    saveState();
    renderCalcHistory();
    
    calcCurrent = result.toString();
    calcPrevious = null;
    calcOperator = null;
    calcNewNumber = true;
    updateCalcDisplay();
}

function clearCalc() {
    calcCurrent = '0';
    calcPrevious = null;
    calcOperator = null;
    calcNewNumber = true;
    updateCalcDisplay();
}

function deleteCalc() {
    if (calcCurrent.length > 1) {
        calcCurrent = calcCurrent.slice(0, -1);
    } else {
        calcCurrent = '0';
    }
    updateCalcDisplay();
}

function percentCalc() {
    calcCurrent = (parseFloat(calcCurrent) / 100).toString();
    updateCalcDisplay();
}

function updateCalcDisplay() {
    const display = document.getElementById('calcDisplay');
    display.textContent = calcCurrent;
}

function getOperatorSymbol(op) {
    const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    return symbols[op] || op;
}

function renderCalcHistory() {
    const historyList = document.getElementById('calcHistoryList');
    
    if (!state.calcHistory || state.calcHistory.length === 0) {
        historyList.innerHTML = '<div class="calc-history-empty">No calculations yet</div>';
        return;
    }
    
    historyList.innerHTML = state.calcHistory.map(calc => `
        <div class="calc-history-item" onclick="useCalcResult('${calc.result}')">
            <span class="calc-expression">${calc.expression}</span>
            <span class="calc-result">= ${formatNumber(calc.result)}</span>
        </div>
    `).join('');
}

function useCalcResult(result) {
    calcCurrent = result;
    calcNewNumber = false;
    updateCalcDisplay();
}

function formatNumber(num) {
    const number = parseFloat(num);
    return number % 1 === 0 ? number.toFixed(0) : number.toFixed(2);
}

// Recent Transactions Functions
function openRecentTransactions() {
    currentTransactionFilter = 'all';
    renderRecentTransactions();
    showModal('transactionsModal');
}

function closeRecentTransactions() {
    closeAllModals();
}

function filterTransactions(filter) {
    currentTransactionFilter = filter;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    renderRecentTransactions();
}

function renderRecentTransactions() {
    const transactionsList = document.getElementById('transactionsList');
    
    // Gather all transactions
    let transactions = [];
    
    // Add paid profits
    if (state.profits) {
        state.profits.filter(p => p.paid).forEach(p => {
            transactions.push({
                type: 'profit',
                icon: '📈',
                description: p.description || 'Profit',
                amount: p.amount,
                account: p.paidTo === 'multiple' ? 'Multiple' : getAccountName(p.paidTo),
                date: p.date,
                color: 'success'
            });
        });
    }
    
    // Add assigned spendings
    if (state.spendings) {
        state.spendings.filter(s => s.paid).forEach(s => {
            transactions.push({
                type: 'spending',
                icon: '💸',
                description: s.description,
                amount: -s.amount,
                account: getAccountName(s.account),
                date: s.date,
                color: 'danger'
            });
        });
    }
    
    // Add debt payments (track in state from now on)
    if (state.transactions) {
        state.transactions.forEach(t => {
            if (t.type === 'debt_payment') {
                transactions.push({
                    type: 'debt',
                    icon: '📋',
                    description: t.description,
                    amount: -t.amount,
                    account: t.account,
                    date: t.date,
                    color: 'warning'
                });
            }
        });
    }
    
    // Filter by type
    if (currentTransactionFilter !== 'all') {
        if (currentTransactionFilter === 'profits') {
            transactions = transactions.filter(t => t.type === 'profit');
        } else if (currentTransactionFilter === 'spendings') {
            transactions = transactions.filter(t => t.type === 'spending');
        } else if (currentTransactionFilter === 'debts') {
            transactions = transactions.filter(t => t.type === 'debt');
        }
    }
    
    // Sort by date (newest first) and limit to 20
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    transactions = transactions.slice(0, 20);
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<div class="empty-state">No transactions found</div>';
        return;
    }
    
    transactionsList.innerHTML = transactions.map(t => `
        <div class="transaction-item transaction-${t.color}">
            <div class="transaction-icon">${t.icon}</div>
            <div class="transaction-info">
                <div class="transaction-desc">${t.description}</div>
                <div class="transaction-account">${t.account}</div>
            </div>
            <div class="transaction-right">
                <div class="transaction-amount ${t.amount > 0 ? 'positive' : 'negative'}">
                    ${t.amount > 0 ? '+' : ''}${formatCurrency(Math.abs(t.amount))}
                </div>
                <div class="transaction-date">${formatDate(t.date)}</div>
            </div>
        </div>
    `).join('');
}

// Helper to log debt payments as transactions
function logTransaction(type, description, amount, account) {
    if (!state.transactions) state.transactions = [];
    
    state.transactions.push({
        type: type,
        description: description,
        amount: amount,
        account: account,
        date: new Date().toISOString()
    });
    
    saveState();
}

// Utility functions
function formatCurrency(amount) {
    return '₦' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getAccountName(account) {
    return state.accountsMeta[account]?.name || account;
}

// Service Worker Registration
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed', err));
    }
}
