global.window = {};
require('../utils.js');

// minimal DOM stubs
global.document = { addEventListener: jest.fn() };
window.document = global.document;
window.addEventListener = jest.fn();
window.location = {};

require('../app.js');

const extractCustomerData = window.extractCustomerData;

test('extractCustomerData aggregates by customer number', () => {
    const headers = ['Customer Number', 'ARR', 'Total Risk', 'Customer Name', 'LCSM'];
    const data = [
        { 'Customer Number': '123', ARR: '1200', 'Total Risk': '4', 'Customer Name': 'Acme', LCSM: 'John' },
        { 'Customer Number': '123', ARR: '800', 'Total Risk': '12', 'Customer Name': 'Acme Inc' },
        { 'Customer Number': '123', ARR: '1000', 'Total Risk': '9', LCSM: 'Jane' }
    ];
    const result = extractCustomerData(data, headers);
    expect(result).toHaveLength(1);
    const row = result[0];
    expect(row['ARR']).toBeCloseTo(3000);
    expect(row['Total Risk']).toBe(12);
    expect(row['Customer Number']).toBe('123');
});

test('uses real customer name when available', () => {
    const headers = ['Customer Number', 'ARR', 'Total Risk', 'Customer Name'];
    const data = [
        { 'Customer Number': '1', ARR: '500', 'Total Risk': '1', 'Customer Name': '' },
        { 'Customer Number': '1', ARR: '500', 'Total Risk': '2', 'Customer Name': 'Alpha' }
    ];
    const result = extractCustomerData(data, headers);
    expect(result).toHaveLength(1);
    expect(result[0]['Customer Name']).toBe('Alpha');
});

test('falls back to customer number when no name exists', () => {
    const headers = ['Customer Number', 'ARR', 'Total Risk'];
    const data = [
        { 'Customer Number': '2', ARR: '100', 'Total Risk': '5' },
        { 'Customer Number': '2', ARR: '200', 'Total Risk': '1' }
    ];
    const result = extractCustomerData(data, headers);
    expect(result).toHaveLength(1);
    expect(result[0]['Customer Name']).toBe('2');
});
