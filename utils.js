// utils.js - Browser-kompatibel OHNE ES6 Exports

// =============================================================================
// BESTEHENDE DOM & HELPER UTILITIES
// =============================================================================

function on(id, event, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, fn);
}

function $(selector, scope = document) {
    return scope.querySelector(selector);
}

function $all(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

function debounce(fn, delay = 300) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

function throttle(fn, limit = 300) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Simple HTML escaping to prevent XSS when injecting dynamic values
function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return String(str).replace(/[&<>"']/g, m => map[m]);
}

// =============================================================================
// GLOBALER NAMESPACE (OHNE ES6 EXPORTS)
// =============================================================================

window.AppUtils = {
    // KORRIGIERT: IDENTISCHE Spalten-Mapping wie in app.js und riskmap.html
    COLUMN_MAPPINGS: {
        'LCSM': ['LCSM', 'lcsm', 'Lcsm', 'LcsM', 'SACHBEARBEITER', 'sachbearbeiter', 'Sachbearbeiter', 'CSM', 'csm', 'Manager', 'manager', 'MANAGER', 'Betreuer', 'betreuer', 'BETREUER'],
        'Customer Name': ['Customer Name', 'customer name', 'CUSTOMER NAME', 'CustomerName', 'customername', 'CUSTOMERNAME', 'Kunde', 'kunde', 'KUNDE', 'Kundenname', 'kundenname', 'KUNDENNAME', 'Name', 'name', 'NAME', 'Client', 'client', 'CLIENT'],
        'Customer Number': ['Customer Number', 'customer number', 'CUSTOMER NUMBER', 'CustomerNumber', 'customernumber', 'CUSTOMERNUMBER', 'Customer ID', 'customer id', 'CustomerID', 'CUSTOMERID', 'Kundennummer', 'kundennummer', 'KUNDENNUMMER'],
        'Total Risk': ['Total Risk', 'total risk', 'TOTAL RISK', 'TotalRisk', 'totalrisk', 'TOTALRISK', 'Risk', 'risk', 'RISK', 'Risiko', 'risiko', 'RISIKO', 'Score', 'score', 'SCORE', 'Risk Score', 'risk score', 'RISK SCORE', 'RiskScore', 'riskscore', 'RISKSCORE'],
        'ARR': ['ARR', 'arr', 'Arr', 'Annual Recurring Revenue', 'annual recurring revenue', 'ANNUAL RECURRING REVENUE', 'Revenue', 'revenue', 'REVENUE', 'Umsatz', 'umsatz', 'UMSATZ', 'Vertragswert', 'vertragswert', 'VERTRAGSWERT', 'Value', 'value', 'VALUE', 'Wert', 'wert', 'WERT', 'Amount', 'amount', 'AMOUNT']
    },

    // HTML escaping utility
    escapeHtml: escapeHtml,

    // KORRIGIERT: IDENTISCHE Spaltenerkennung wie in app.js und riskmap.html
    findColumnName: function(headers, targetColumn) {
        const possibleNames = this.COLUMN_MAPPINGS[targetColumn] || [targetColumn];
        
        for (const header of headers) {
            for (const possibleName of possibleNames) {
                if (header.toLowerCase().trim() === possibleName.toLowerCase().trim()) {
                    console.log(`UTILS: Found column mapping: "${header}" -> "${targetColumn}"`);
                    return header;
                }
            }
        }
        
        console.warn(`UTILS: Column not found for ${targetColumn}. Available headers:`, headers);
        return null;
    },

    // KORRIGIERT: IDENTISCHE ultra-robuste Zahlenextraktion wie in app.js und riskmap.html
    extractNumber: function(value) {
        console.log(`UTILS: Processing value: "${value}" (type: ${typeof value})`);
        
        if (typeof value === 'number' && !isNaN(value)) {
            console.log(`UTILS: Already a number: ${value}`);
            return value;
        }
        
        if (value === undefined || value === null || value === '') {
            console.log('UTILS: Empty value, returning 0');
            return 0;
        }
        
        let stringValue = String(value).trim();
        
        if (stringValue === '' || stringValue === 'N/A' || stringValue === 'n/a' || stringValue === 'NULL') {
            console.log('UTILS: Invalid string value, returning 0');
            return 0;
        }
        
        console.log(`UTILS: Processing string: "${stringValue}"`);
        
        let cleanValue = stringValue;
        
        // Entferne Währungszeichen, Buchstaben, Leerzeichen und Prozentzeichen
        cleanValue = cleanValue.replace(/[€$£¥₹₽¢₩₪₨₦₡₵₴₸₼₾₿]/g, '');
        cleanValue = cleanValue.replace(/[A-Za-z]/g, '');
        cleanValue = cleanValue.replace(/[\s]/g, '');
        cleanValue = cleanValue.replace(/[%]/g, '');
        
        console.log(`UTILS: After removing currency/letters: "${cleanValue}"`);
        
        // Behandle verschiedene Zahlenformate
        if (cleanValue.includes(',') && cleanValue.includes('.')) {
            const lastComma = cleanValue.lastIndexOf(',');
            const lastDot = cleanValue.lastIndexOf('.');
            
            if (lastDot > lastComma) {
                // Amerikanisches Format: 1,234.56
                cleanValue = cleanValue.replace(/,/g, '');
                console.log(`UTILS: American format detected: "${cleanValue}"`);
            } else {
                // Europäisches Format: 1.234,56
                cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
                console.log(`UTILS: European format detected: "${cleanValue}"`);
            }
        } else if (cleanValue.includes(',')) {
            const commaCount = (cleanValue.match(/,/g) || []).length;
            const commaPos = cleanValue.indexOf(',');
            const afterComma = cleanValue.substring(commaPos + 1);
            
            if (commaCount === 1 && afterComma.length <= 3 && /^\d+$/.test(afterComma)) {
                // Dezimaltrennzeichen: 123,45
                cleanValue = cleanValue.replace(',', '.');
                console.log(`UTILS: Comma as decimal separator: "${cleanValue}"`);
            } else {
                // Tausendertrennzeichen: 1,234
                cleanValue = cleanValue.replace(/,/g, '');
                console.log(`UTILS: Comma as thousand separator: "${cleanValue}"`);
            }
        } else if (cleanValue.includes('.')) {
            const dotCount = (cleanValue.match(/\./g) || []).length;
            const dotPos = cleanValue.lastIndexOf('.');
            const afterDot = cleanValue.substring(dotPos + 1);
            
            if (dotCount === 1 && afterDot.length <= 3 && /^\d+$/.test(afterDot)) {
                // Dezimaltrennzeichen: 123.45
                console.log(`UTILS: Dot as decimal separator: "${cleanValue}"`);
            } else {
                // Tausendertrennzeichen: 1.234
                cleanValue = cleanValue.replace(/\./g, '');
                console.log(`UTILS: Dot as thousand separator: "${cleanValue}"`);
            }
        }
        
        cleanValue = cleanValue.replace(/[^\d.\-]/g, '');
        
        console.log(`UTILS: Final cleaned value: "${cleanValue}"`);
        
        const result = parseFloat(cleanValue) || 0;
        console.log(`UTILS: Final extracted number: ${result}`);
        
        return result;
    },

    // KORRIGIERT: IDENTISCHE Datenextraktion wie in app.js und riskmap.html
    extractCustomerData: function(rawData, headers) {
        console.log('=== UTILS: Extracting customer data with ultra-robust number conversion ===');
        console.log('UTILS: Available headers:', headers);
        
        const lcsmColumn = window.AppUtils.findColumnName(headers, 'LCSM');
        const customerColumn = window.AppUtils.findColumnName(headers, 'Customer Name');
        const riskColumn = window.AppUtils.findColumnName(headers, 'Total Risk');
        const arrColumn = window.AppUtils.findColumnName(headers, 'ARR');
        
        console.log('UTILS: Column mappings found:', {
            LCSM: lcsmColumn,
            'Customer Name': customerColumn,
            'Total Risk': riskColumn,
            'ARR': arrColumn
        });
        
        return rawData.map((row, index) => {
            const customerName = customerColumn ? (row[customerColumn] || `Customer ${index + 1}`) : `Customer ${index + 1}`;
            const lcsm = lcsmColumn ? (row[lcsmColumn] || 'N/A') : 'N/A';
            
            const totalRisk = riskColumn ? window.AppUtils.extractNumber(row[riskColumn]) : 0;
            const arr = arrColumn ? window.AppUtils.extractNumber(row[arrColumn]) : 0;
            
            const extractedData = {
                'Customer Name': customerName,
                'LCSM': lcsm,
                'Total Risk': totalRisk,
                'ARR': arr,
                ...row
            };
            
            console.log(`UTILS: Extracted customer ${index + 1}:`, {
                name: customerName,
                lcsm: lcsm,
                risk: totalRisk,
                arr: arr,
                originalARR: row[arrColumn],
                originalRisk: row[riskColumn]
            });
            
            return extractedData;
        });
    },

    DebugLogger: {
        logs: [],
        filters: { debug: true, info: true, warn: true, error: true },
        setFilter: function(level, enabled){
            if(this.filters.hasOwnProperty(level)){
                this.filters[level] = !!enabled;
            }
        },
        add: function(level, message, data = null) {
            const timestamp = new Date().toISOString();
            const logEntry = {
                timestamp,
                level,
                message,
                data: data ? JSON.stringify(data) : null
            };
            this.logs.push(logEntry);
            if(this.filters[level] !== false){
                console.log(`[${level.toUpperCase()}] ${timestamp}: ${message}`, data);
            }
            
            if (this.logs.length > 1000) {
                this.logs = this.logs.slice(-1000);
            }
        },
        download: function() {
            const logContent = this.logs
                .filter(entry => this.filters[entry.level] !== false)
                .map(entry =>
                    `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${entry.data ? ' | Data: ' + entry.data : ''}`
                ).join('\n');
            
            const blob = new Blob([logContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `debug_log_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('Debug log downloaded');
            this.add('info', 'Debug log downloaded');
        },
        clear: function() {
            this.logs = [];
        }
    },

    AutoSave: {
        timer: null,
        lastSaveTime: null,
        start: function(saveCallback, interval = 30000) {
            if (this.timer) {
                clearInterval(this.timer);
            }
            
            this.timer = setInterval(() => {
                if (this.hasUnsavedChanges()) {
                    this.perform(saveCallback);
                }
            }, interval);
            
            window.AppUtils.DebugLogger.add('info', `Auto-save started with ${interval}ms interval`);
        },
        stop: function() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
                window.AppUtils.DebugLogger.add('info', 'Auto-save stopped');
            }
        },
        perform: function(saveCallback) {
            try {
                saveCallback();
                this.lastSaveTime = Date.now();
                window.AppUtils.DebugLogger.add('info', 'Auto-save completed');
            } catch (error) {
                window.AppUtils.DebugLogger.add('error', 'Auto-save failed', error);
            }
        },
        hasUnsavedChanges: function() {
            return this.lastSaveTime === null || (Date.now() - this.lastSaveTime) > 30000;
        }
    },

    DataUtils: {
        deepClone: function(obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Array) return obj.map(item => this.deepClone(item));
            if (typeof obj === 'object') {
                const clonedObj = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        clonedObj[key] = this.deepClone(obj[key]);
                    }
                }
                return clonedObj;
            }
            return obj;
        },

        getActiveCustomers: function(filteredData) {
            return filteredData.filter(customer => !customer.erledigt && !customer.done && !customer.archived && !customer.inWorkflow);
        },

        // KORRIGIERT: aggregateDataByCustomer mit IDENTISCHER Zahlenextraktion
        aggregateDataByCustomer: function(data, headers = null) {
            console.log('=== UTILS: Aggregating data by customer with ultra-robust number conversion ===');
            
            if (!headers) {
                headers = data.length > 0 ? Object.keys(data[0]) : [];
                console.log('UTILS: No headers provided, extracted from data:', headers);
            }
            
            const customerNumberColumn = window.AppUtils.findColumnName(headers, 'Customer Number') ||
                                       headers.find(h => h.toLowerCase().includes('customer') && (h.toLowerCase().includes('number') || h.toLowerCase().includes('id'))) ||
                                       headers.find(h => h.toLowerCase().includes('kunde') && h.toLowerCase().includes('nummer')) ||
                                       'Customer Number';
            
            console.log('UTILS: Using customer key column:', customerNumberColumn);
            
            const grouped = {};
            
            data.forEach((row, index) => {
                const key = row[customerNumberColumn] || 
                           row["Customer Number"] || 
                           row["Customer ID"] || 
                           row["CustomerNumber"] || 
                           row["customernumber"] || 
                           row["CUSTOMERNUMBER"] ||
                           row["Kundennummer"] ||
                           row["kundennummer"] ||
                           row["KUNDENNUMMER"] ||
                           `Customer_${index}`;
                
                if (!key) {
                    console.warn(`UTILS: No customer key found for row ${index}:`, row);
                    return;
                }
                
                if (!grouped[key]) {
                    grouped[key] = {...row};
                    
                    // KORRIGIERT: Verwende IDENTISCHE extractNumber-Funktion
                    const riskFields = ["Contact Risk", "Update Risk", "Value Risk", "Contract Risk", "Objective Risk", "Total Risk", "Risk", "risk", "RISK", "Risiko", "risiko", "RISIKO"];
                    const arrFields = ["ARR", "arr", "Revenue", "revenue", "REVENUE", "Umsatz", "umsatz", "UMSATZ", "Vertragswert", "vertragswert", "VERTRAGSWERT"];
                    
                    [...riskFields, ...arrFields].forEach(field => {
                        if (row[field] !== undefined) {
                            grouped[key][field] = window.AppUtils.extractNumber(row[field]);
                        }
                    });
                } else {
                    // KORRIGIERT: Addiere Werte mit IDENTISCHER extractNumber-Funktion
                    const riskFields = ["Contact Risk", "Update Risk", "Value Risk", "Contract Risk", "Objective Risk", "Total Risk", "Risk", "risk", "RISK", "Risiko", "risiko", "RISIKO"];
                    const arrFields = ["ARR", "arr", "Revenue", "revenue", "REVENUE", "Umsatz", "umsatz", "UMSATZ", "Vertragswert", "vertragswert", "VERTRAGSWERT"];
                    
                    [...riskFields, ...arrFields].forEach(field => {
                        if (row[field] !== undefined) {
                            grouped[key][field] = (grouped[key][field] || 0) + window.AppUtils.extractNumber(row[field]);
                        }
                    });
                }
            });
            
            const result = Object.values(grouped);
            console.log(`UTILS: Aggregated ${data.length} rows into ${result.length} customers`);
            return result;
        },

        // KORRIGIERT: Verbesserte Session-Merge-Funktion mit flexiblen Feldnamen
        mergeSessionWithData: function(sessionData, freshData) {
            return freshData.map(row => {
                const sessionRow = sessionData.find(s => {
                    // KORRIGIERT: Flexibleres Matching mit mehr Feldnamen
                    const nameMatch = (s["Customer Name"] === row["Customer Name"]) ||
                                     (s["Kunde"] === row["Kunde"]) ||
                                     (s["Kundenname"] === row["Kundenname"]) ||
                                     (s["Customer"] === row["Customer"]) ||
                                     (s["Name"] === row["Name"]) ||
                                     (s["name"] === row["name"]) ||
                                     (s["customer_name"] === row["customer_name"]) ||
                                     (s["customername"] === row["customername"]) ||
                                     (s["CUSTOMERNAME"] === row["CUSTOMERNAME"]);
                    
                    const lcsmMatch = (s["LCSM"] === row["LCSM"]) || 
                                     (s["lcsm"] === row["lcsm"]) ||
                                     (s["CSM"] === row["CSM"]) ||
                                     (s["csm"] === row["csm"]) ||
                                     (s["Manager"] === row["Manager"]) ||
                                     (s["manager"] === row["manager"]);
                    
                    // KORRIGIERT: ARR-Matching mit Toleranz für Rundungsfehler und verschiedene Feldnamen
                    const sArr = parseFloat(s["ARR"] || s["arr"] || s["Revenue"] || s["revenue"] || s["Umsatz"] || s["umsatz"] || 0);
                    const rArr = parseFloat(row["ARR"] || row["arr"] || row["Revenue"] || row["revenue"] || row["Umsatz"] || row["umsatz"] || 0);
                    const arrMatch = Math.abs(sArr - rArr) < 0.01;
                    
                    return nameMatch && lcsmMatch && arrMatch;
                });
                
                return sessionRow ? {...row, erledigt: true} : row;
            });
        },

        // KORRIGIERT: Neue Funktion für eindeutige Kunden-IDs mit flexiblen Feldnamen
        generateCustomerKey: function(customer) {
            const name = customer['Customer Name'] || 
                        customer['Kunde'] || 
                        customer['Name'] || 
                        customer['name'] ||
                        customer['customer_name'] ||
                        customer['customername'] ||
                        customer['CUSTOMERNAME'] ||
                        '';
            
            const lcsm = customer['LCSM'] || 
                        customer['lcsm'] || 
                        customer['CSM'] ||
                        customer['csm'] ||
                        customer['Manager'] ||
                        customer['manager'] ||
                        '';
            
            const arrValue = customer['ARR'] ||
                             customer['arr'] ||
                             customer['Revenue'] ||
                             customer['revenue'] ||
                             customer['Umsatz'] ||
                             customer['umsatz'] ||
                             0;

            const arrNumber = window.AppUtils.extractNumber(arrValue);
            const arr = Number(arrNumber).toFixed(2);
            
            return `${name}|${lcsm}|${arr}`;
        },

        // KORRIGIERT: Verbesserte Kunden-Suche mit flexiblen Feldnamen
        findCustomerInArray: function(array, targetCustomer) {
            const targetKey = this.generateCustomerKey(targetCustomer);
            return array.findIndex(customer => {
                const customerKey = this.generateCustomerKey(customer);
                return customerKey === targetKey;
            });
        }
    },

    SessionManager: {
        riskHistory: {},
        workflowEntries: {},
        notes: {},
        archivedRows: [],
        // Multi-Key Session-Management
        save: function(sessionData) {
            try {
                const dataToSave = {
                    ...sessionData,
                    timestamp: Date.now()
                };
                
                // Speichere in allen Session-Keys
                const allKeys = ['riskerSessionData', 'sessionData', 'appData'];
                allKeys.forEach(key => {
                    localStorage.setItem(key, JSON.stringify(dataToSave));
                });
                
                // Legacy-Support
                localStorage.setItem('appSession', JSON.stringify(dataToSave));
                
                window.AppUtils.DebugLogger.add('info', 'Session saved successfully to all keys');
            } catch (error) {
                window.AppUtils.DebugLogger.add('error', 'Failed to save session', error);
                throw error;
            }
        },

        // Multi-Key Session-Restore
        restore: function() {
            try {
                const allKeys = ['riskerSessionData', 'sessionData', 'appData', 'appSession'];
                
                for (const key of allKeys) {
                    try {
                        const sessionData = localStorage.getItem(key);
                        if (sessionData) {
                            const data = JSON.parse(sessionData);
                            if (data && (data.excelData || data.filteredData || data.aggregatedData)) {
                                window.AppUtils.DebugLogger.add('info', `Session restored successfully from ${key}`);
                                return data;
                            }
                        }
                    } catch (e) {
                        console.warn(`Failed to restore from ${key}:`, e);
                    }
                }
                
                window.AppUtils.DebugLogger.add('info', 'No valid session data found in any key');
                return null;
            } catch (error) {
                window.AppUtils.DebugLogger.add('error', 'Failed to restore session', error);
                return null;
            }
        },

        // Vollständige Session-Löschung
        clear: function() {
            const allKeys = [
                'riskerSessionData', 'sessionData', 'appData', 'appSession',
                'customerData', 'originalCustomerData', 'erledigtRows',
                'filteredData', 'aggregatedData', 'originalAggregatedData'
            ];
            
            allKeys.forEach(key => {
                try {
                    localStorage.removeItem(key);
                } catch (e) {
                    console.warn(`Failed to remove ${key}:`, e);
                }
            });
            
            window.AppUtils.DebugLogger.add('info', 'Session cleared from all keys');
        },

        getAllCustomers: function() {
            const data = this.restore() || {};
            return [].concat(
                data.excelData || [],
                data.filteredData || [],
                data.aggregatedData || []
            );
        }
    },

    FileInputUtils: {
        reset: function(fileInputId) {
            const fileInput = document.getElementById(fileInputId);
            if (fileInput) {
                fileInput.value = '';
                fileInput.type = '';
                fileInput.type = 'file';

                const newFileInput = fileInput.cloneNode(true);
                fileInput.parentNode.replaceChild(newFileInput, fileInput);

                window.AppUtils.DebugLogger.add('info', 'File input reset successfully');
                return newFileInput;
            }
            return null;
        }
    },

    handleFileUpload: function(file, onSuccess, onError) {
        if (!file) {
            if (onError) onError(new Error('No file provided'));
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                let chosenWorksheet = null;
                let json = null;
                for (const sheetName of workbook.SheetNames) {
                    const tempSheet = workbook.Sheets[sheetName];
                    const tempJson = XLSX.utils.sheet_to_json(tempSheet, {
                        header: 1,
                        raw: false,
                        defval: '',
                        blankrows: false
                    });
                    const validRows = tempJson.slice(1).filter(row =>
                        row.some(cell =>
                            cell !== undefined &&
                            cell !== null &&
                            cell.toString().trim() !== ''
                        )
                    );
                    if (validRows.length > 0) {
                        chosenWorksheet = tempSheet;
                        json = [tempJson[0], ...validRows];
                        break;
                    }
                }

                if (!chosenWorksheet) {
                    alert('No sheet with valid data found in the uploaded file.');
                    if (onError) onError(new Error('No valid sheet found'));
                    return;
                }

                const headers = json[0].filter(h => h && h.toString().trim() !== '');
                const rawData = json.slice(1).map(row => {
                    const obj = {};
                    headers.forEach((header, i) => {
                        if (header && header.trim()) {
                            obj[header] = row[i];
                        }
                    });
                    return obj;
                }).filter(row => {
                    return Object.values(row).some(value =>
                        value !== undefined &&
                        value !== null &&
                        value !== '' &&
                        value.toString().trim() !== ''
                    );
                });

                if (onSuccess) onSuccess(rawData, headers);
            } catch (err) {
                if (onError) onError(err);
            }
        };

        reader.onerror = function(err) {
            if (onError) onError(err);
        };

        reader.readAsArrayBuffer(file);
    },

    calculateContractRisk: function(contractDate) {
        if (!contractDate) return 0;
        const now = new Date();
        const end = new Date(contractDate);
        if (isNaN(end)) return 0;
        const diffDays = (end - now) / (1000 * 60 * 60 * 24);
        if (diffDays <= 0) return 150;
        if (diffDays < 90) return 100;
        if (diffDays < 180) return 50;
        return 20;
    },

    buildRiskHistory: function(data) {
        const history = {};
        const timestamp = Date.now();
        data.forEach(row => {
            const key = window.AppUtils.DataUtils.generateCustomerKey(row);
            if (!history[key]) history[key] = [];
            history[key].push({
                timestamp,
                'Total Risk': row['Total Risk'] || 0,
                'Objective Risk': row['Objective Risk'] || 0,
                'Contact Risk': row['Contact Risk'] || 0,
                'Contract Risk': row['Contract Risk'] || 0,
                'ARR': row['ARR'] || 0
            });
        });
        return history;
    },

    filterRiskDataByType: function(data, type) {
        const result = {};
        Object.keys(data).forEach(key => {
            result[key] = data[key].map(entry => ({
                timestamp: entry.timestamp,
                value: entry[type + ' Risk'] || entry[type] || 0,
                entry
            }));
        });
        return result;
    },

    exportChartAsPng: function(chart, filename) {
        const link = document.createElement('a');
        link.href = chart.toBase64Image();
        link.download = filename || 'chart.png';
        link.click();
    },

    PrivacyUtils: {
        getPrivacyText: function() {
            return `<h3>Privacy Information</h3>
<p>This application is a <b>purely local web app</b>.</p>
<p><b>No data</b> is transmitted to third parties or external servers.</p>
<p>All files and session data remain on your device and can be deleted at any time.</p>
<p><b>GDPR compliance:</b> The application is designed to be fully GDPR-compliant.</p>
<p>No personal data is processed outside your device. No cookies or trackers are used.</p>
<p>Contact for privacy inquiries: Your Local Privacy Officer</p>`;
        }
    }
};

// ============================================================================
// Global QuickNote binding helpers
// ============================================================================

function handleQuickNoteOpen(e) {
    const id = e.currentTarget.dataset.customer;
    if (!id) return;
    const ctx = e.currentTarget.closest('#workflowSidebar') ? 'workflow' : '';
    console.log('\u{1F4CC} Opening QuickNote for:', id);
    requestAnimationFrame(() => {
        if (window.openNoteModal) {
            window.openNoteModal(id, ctx);
        } else if (window.QuickNote && typeof window.QuickNote.render === 'function') {
            window.QuickNote.render(id);
        }
        const slider = document.getElementById('quickNoteSlider');
        if (slider) slider.classList.add('visible');
    });
}

function bindQuickNoteButtons() {
    document.querySelectorAll('.quicknote-btn').forEach(btn => {
        btn.removeEventListener('click', handleQuickNoteOpen);
        btn.addEventListener('click', handleQuickNoteOpen);
    });
}

window.handleQuickNoteOpen = handleQuickNoteOpen;
window.bindQuickNoteButtons = bindQuickNoteButtons;

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', bindQuickNoteButtons);
}
