import React, { useState, useEffect } from 'react';
import { 
  Home, Zap, Wifi, Shield, ShoppingCart, Utensils, Car, Heart, Shirt, Plane, PiggyBank, 
  Plus, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, TrendingUp, TrendingDown, 
  X, Edit3, Trash2, Briefcase, Phone, Dog, MoreHorizontal, Download, Printer, ArrowRight, 
  Calendar, Upload, Save, FileText, Check, AlertCircle,
  Euro, DollarSign, CreditCard, Wallet, Banknote, Coins, Receipt, 
  Gift, Baby, GraduationCap, Book, Music, Tv, Gamepad2, Camera,
  Bus, Train, Fuel, Bike,
  Coffee, Wine, Pizza,
  Scissors, Sparkles, Dumbbell, Pill,
  Building, Key, Wrench,
  Globe, Map, Umbrella,
  Cat, Bird, Fish,
  Smartphone, Laptop, Monitor, Headphones,
  ShoppingBag, Package, Watch,
  Users, UserPlus,
  Leaf
} from 'lucide-react';

// Alle Icons - einheitlich schwarz/dunkelbraun
const iconMap = { 
  Euro, DollarSign, CreditCard, Wallet, Banknote, Coins, PiggyBank, TrendingUp, Receipt,
  Home, Zap, Wifi, Key, Building, Wrench,
  Car, Bus, Train, Fuel, Bike, Plane,
  ShoppingCart, Utensils, Coffee, Wine, Pizza,
  Heart, Pill, Dumbbell, Scissors, Sparkles,
  Shirt, ShoppingBag, Package, Watch,
  Tv, Music, Gamepad2, Camera, Book, Headphones,
  Phone, Smartphone, Laptop, Monitor,
  Baby, GraduationCap, Gift, Users, UserPlus,
  Dog, Cat, Bird, Fish,
  Globe, Map, Umbrella, Leaf,
  Briefcase, Shield,
  MoreHorizontal
};

// Icon-Kategorien
const iconCategories = [
  { name: 'Geld', icons: ['Euro', 'DollarSign', 'CreditCard', 'Wallet', 'Banknote', 'Coins', 'PiggyBank', 'TrendingUp', 'Receipt'] },
  { name: 'Wohnen', icons: ['Home', 'Zap', 'Wifi', 'Key', 'Building', 'Wrench'] },
  { name: 'Transport', icons: ['Car', 'Bus', 'Train', 'Fuel', 'Bike', 'Plane'] },
  { name: 'Essen', icons: ['ShoppingCart', 'Utensils', 'Coffee', 'Wine', 'Pizza'] },
  { name: 'Gesundheit', icons: ['Heart', 'Pill', 'Dumbbell', 'Scissors', 'Sparkles'] },
  { name: 'Shopping', icons: ['Shirt', 'ShoppingBag', 'Package', 'Watch'] },
  { name: 'Medien', icons: ['Tv', 'Music', 'Gamepad2', 'Camera', 'Book', 'Headphones'] },
  { name: 'Technik', icons: ['Phone', 'Smartphone', 'Laptop', 'Monitor'] },
  { name: 'Familie', icons: ['Baby', 'GraduationCap', 'Gift', 'Users', 'UserPlus'] },
  { name: 'Tiere', icons: ['Dog', 'Cat', 'Bird', 'Fish'] },
  { name: 'Sonstiges', icons: ['Briefcase', 'Shield', 'Globe', 'Map', 'Umbrella', 'Leaf', 'MoreHorizontal'] }
];

const formatCurrency = (a) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(a);
const formatPercent = (v) => new Intl.NumberFormat('de-DE', { style: 'percent', maximumFractionDigits: 1 }).format(v);
const getMonthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const getMonthName = (k) => { const [y, m] = k.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }); };
// NEU: Auto-Kategorisierungs-Regeln
const defaultCategoryRules = [
  { keywords: ['BILLA', 'HOFER', 'PENNY', 'SPAR', 'LIDL'], categoryType: 'variableCosts', categoryName: 'Lebensmittel' },
  { keywords: ['BP', 'OMV', 'SHELL', 'TANKEN'], categoryType: 'variableCosts', categoryName: 'Auto' },
  { keywords: ['TRAFIK', 'TABAK'], categoryType: 'variableCosts', categoryName: 'Zigaretten' },
  { keywords: ['MARCUS'], categoryType: 'fixedCosts', categoryName: 'Miete' },
  { keywords: ['AUDIBLE', 'AMAZON'], categoryType: 'fixedCosts', categoryName: 'Audible' },
  { keywords: ['FRESSNAPF', 'FUTTERHAUS'], categoryType: 'variableCosts', categoryName: 'Hund' },
];

// NEU: Wochenberechnung aus Datum
const getWeekNumber = (dateStr) => {
  const [day] = dateStr.split('.').map(Number);
  if (day <= 7) return 'w1';
  if (day <= 14) return 'w2';
  if (day <= 21) return 'w3';
  return 'w4';
};

const getShortMonthName = (k) => { const [y, m] = k.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('de-DE', { month: 'short' }); };

// Jahresübersicht Komponente
const YTDView = ({ allData, year, onSelectMonth }) => {
  const months = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
  
  const getMonthSummary = (monthKey) => {
    const data = allData[monthKey];
    if (!data) return { income: 0, expenses: 0, available: 0, rollover: 0 };
    const income = data.income?.reduce((s, i) => s + i.amount, 0) || 0;
    const fixed = data.fixedCosts?.reduce((s, i) => s + i.amount, 0) || 0;
    const variable = data.variableCosts?.reduce((s, i) => s + i.amount, 0) || 0;
    const savings = data.savings?.reduce((s, i) => s + i.amount, 0) || 0;
    const rollover = data.rollover || 0;
    const budget = income + rollover;
    const expenses = fixed + variable + savings;
    return { income, expenses, available: budget - expenses, rollover };
  };

  const yearTotals = months.reduce((acc, m) => {
    const s = getMonthSummary(m);
    return { income: acc.income + s.income, expenses: acc.expenses + s.expenses, available: acc.available + s.available };
  }, { income: 0, expenses: 0, available: 0 });

  return (
    <div>
      <div style={{ background: '#FFFEF9', borderRadius: 16, border: '1px solid #E8E4DC', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#FAF8F5' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#5C4033', borderBottom: '1px solid #E8E4DC' }}>Monat</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#5C4033', borderBottom: '1px solid #E8E4DC' }}>Einnahmen</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#5C4033', borderBottom: '1px solid #E8E4DC' }}>Ausgaben</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#5C4033', borderBottom: '1px solid #E8E4DC' }}>Verfügbar</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#5C4033', borderBottom: '1px solid #E8E4DC' }}>Übertrag</th>
            </tr>
          </thead>
          <tbody>
            {months.map((monthKey) => {
              const s = getMonthSummary(monthKey);
              const hasData = s.income > 0 || s.expenses > 0;
              return (
                <tr 
                  key={monthKey} 
                  onClick={() => onSelectMonth(monthKey)}
                  style={{ cursor: 'pointer', background: hasData ? '#FFFEF9' : '#FAF8F5' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#F5F0E8'}
                  onMouseOut={(e) => e.currentTarget.style.background = hasData ? '#FFFEF9' : '#FAF8F5'}
                >
                  <td style={{ padding: '12px 16px', color: '#5C4033', fontWeight: 500, borderBottom: '1px solid #E8E4DC' }}>
                    {getShortMonthName(monthKey)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: '#5C4033', borderBottom: '1px solid #E8E4DC' }}>
                    {s.income > 0 ? formatCurrency(s.income) : '–'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: '#5C4033', borderBottom: '1px solid #E8E4DC' }}>
                    {s.expenses > 0 ? formatCurrency(s.expenses) : '–'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, borderBottom: '1px solid #E8E4DC', color: s.available >= 0 ? '#6B8E23' : '#A0522D' }}>
                    {(s.income > 0 || s.expenses > 0) ? (s.available >= 0 ? '+' : '') + formatCurrency(s.available) : '–'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #E8E4DC', color: s.rollover > 0 ? '#6B8E23' : s.rollover < 0 ? '#A0522D' : '#8B8589' }}>
                    {s.rollover !== 0 ? (s.rollover > 0 ? '+' : '') + formatCurrency(s.rollover) : '–'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: '#5C4033' }}>
              <td style={{ padding: '12px 16px', color: '#FFFEF9', fontWeight: 700 }}>Gesamt {year}</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', color: '#FFFEF9', fontWeight: 600 }}>{formatCurrency(yearTotals.income)}</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', color: '#FFFEF9', fontWeight: 600 }}>{formatCurrency(yearTotals.expenses)}</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', color: yearTotals.available >= 0 ? '#D2B48C' : '#CD853F', fontWeight: 700 }}>
                {yearTotals.available >= 0 ? '+' : ''}{formatCurrency(yearTotals.available)}
              </td>
              <td style={{ padding: '12px 16px' }}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const weeks = [
  { key: 'w1', label: 'Woche 1', range: '1.–7.' },
  { key: 'w2', label: 'Woche 2', range: '8.–14.' },
  { key: 'w3', label: 'Woche 3', range: '15.–21.' },
  { key: 'w4', label: 'Woche 4', range: '22.–31.' }
];

const createMonthData = (withExampleData = false) => ({
  income: [
    { id: 'i1', name: 'Gehalt', amount: withExampleData ? 1700 : 0, icon: 'Briefcase' }
  ],
  fixedCosts: [
    { id: 'f1', name: 'Miete', amount: withExampleData ? 650 : 0, icon: 'Home' },
    { id: 'f2', name: 'Strom', amount: withExampleData ? 45 : 0, icon: 'Zap' },
    { id: 'f3', name: 'Internet', amount: withExampleData ? 30 : 0, icon: 'Wifi' },
    { id: 'f4', name: 'Versicherung', amount: withExampleData ? 80 : 0, icon: 'Shield' },
    { id: 'f5', name: 'Handy', amount: withExampleData ? 20 : 0, icon: 'Phone' },
    { id: 'f6', name: 'Sonstiges', amount: withExampleData ? 25 : 0, icon: 'MoreHorizontal' }
  ],
  variableCosts: [
    { id: 'v1', name: 'Lebensmittel', amount: withExampleData ? 300 : 0, icon: 'ShoppingCart' },
    { id: 'v2', name: 'Ausgehen', amount: withExampleData ? 80 : 0, icon: 'Utensils' },
    { id: 'v3', name: 'Auto', amount: withExampleData ? 100 : 0, icon: 'Car' },
    { id: 'v4', name: 'Gesundheit', amount: withExampleData ? 30 : 0, icon: 'Heart' },
    { id: 'v5', name: 'Kleidung', amount: withExampleData ? 40 : 0, icon: 'Shirt' },
    { id: 'v6', name: 'Hund', amount: withExampleData ? 60 : 0, icon: 'Dog' },
    { id: 'v7', name: 'Sonstiges', amount: withExampleData ? 40 : 0, icon: 'MoreHorizontal' }
  ],
  savings: [
    { id: 's1', name: 'Notgroschen', amount: withExampleData ? 50 : 0, icon: 'PiggyBank', target: withExampleData ? 3000 : 0, saved: withExampleData ? 800 : 0 },
    { id: 's2', name: 'Urlaub', amount: withExampleData ? 50 : 0, icon: 'Plane', target: withExampleData ? 1200 : 0, saved: withExampleData ? 400 : 0 },
    { id: 's3', name: 'Hund', amount: withExampleData ? 30 : 0, icon: 'Dog', target: withExampleData ? 500 : 0, saved: withExampleData ? 150 : 0 }
  ],
  rollover: 0,
  weekly: withExampleData ? { v1: { w1: 70, w2: 80, w3: 75, w4: 65 }, v2: { w1: 20, w2: 15, w3: 25, w4: 15 } } : {},
  bankTransactions: [] // NEU: Importierte Bank-Transaktionen
});

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.5)' }}>
      <div style={{ background: '#FFFEF9', borderRadius: 16, width: '100%', maxWidth: 400, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E8E4DC' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#5C4033' }}>{title}</h2>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, border: 'none', background: '#FAF8F5', cursor: 'pointer' }}><X size={20} color="#8B7355" /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Verfügbare Icons für Auswahl - wird jetzt durch iconCategories ersetzt

const EditModal = ({ open, onClose, item, onSave, type }) => {
  const [name, setName] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [target, setTarget] = React.useState('');
  const [saved, setSaved] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [icon, setIcon] = React.useState('MoreHorizontal');
  const [showIconPicker, setShowIconPicker] = React.useState(false);

  React.useEffect(() => {
    if (open && item) {
      setName(item.name || '');
      setAmount(item.amount?.toString() || '0');
      setTarget(item.target?.toString() || '0');
      setSaved(item.saved?.toString() || '0');
      setDesc(item.desc || '');
      setIcon(item.icon || 'MoreHorizontal');
      setShowIconPicker(false);
    }
  }, [open, item]);

  const handleSave = () => {
    onSave({
      ...item,
      name,
      icon,
      amount: parseFloat(amount) || 0,
      desc,
      ...(type === 'savings' && { target: parseFloat(target) || 0, saved: parseFloat(saved) || 0 })
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Bearbeiten">
      <div style={{ padding: 20, maxHeight: '60vh', overflowY: 'auto' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: '#5C4033' }}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 12, border: '1px solid #E8E4DC', borderRadius: 8, fontSize: 16, boxSizing: 'border-box', background: '#FFFEF9' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: '#5C4033' }}>Betrag (€)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', padding: 12, border: '1px solid #E8E4DC', borderRadius: 8, fontSize: 16, boxSizing: 'border-box', background: '#FFFEF9' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: '#5C4033' }}>Beschreibung</label>
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="z.B. Verwendungszweck" style={{ width: '100%', padding: 12, border: '1px solid #E8E4DC', borderRadius: 8, fontSize: 16, boxSizing: 'border-box', background: '#FFFEF9' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#5C4033' }}>Icon</label>
          
          {/* Ausgewähltes Icon + Button zum Öffnen */}
          <button
            type="button"
            onClick={() => setShowIconPicker(!showIconPicker)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              border: '1px solid #E8E4DC',
              borderRadius: 8,
              background: '#FFFEF9',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            {(() => { const IconComp = iconMap[icon] || MoreHorizontal; return <IconComp size={20} color="#333" />; })()}
            <span style={{ flex: 1, textAlign: 'left', color: '#5C4033' }}>{icon}</span>
            <ChevronDown size={16} color="#999" style={{ transform: showIconPicker ? 'rotate(180deg)' : 'none' }} />
          </button>
          
          {/* Icon-Picker mit Kategorien */}
          {showIconPicker && (
            <div style={{ marginTop: 8, border: '1px solid #E8E4DC', borderRadius: 8, background: '#FFFEF9', maxHeight: 250, overflowY: 'auto' }}>
              {iconCategories.map(category => (
                <div key={category.name}>
                  <div style={{ padding: '8px 12px', background: '#FAF8F5', fontSize: 11, fontWeight: 600, color: '#888', position: 'sticky', top: 0 }}>
                    {category.name.toUpperCase()}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, padding: 8 }}>
                    {category.icons.map(iconKey => {
                      const IconComp = iconMap[iconKey] || MoreHorizontal;
                      return (
                        <button
                          key={iconKey}
                          type="button"
                          onClick={() => { setIcon(iconKey); setShowIconPicker(false); }}
                          style={{
                            padding: 8,
                            border: icon === iconKey ? '2px solid #333' : '1px solid transparent',
                            borderRadius: 6,
                            background: icon === iconKey ? '#F0F0F0' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title={iconKey}
                        >
                          <IconComp size={18} color="#333" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {type === 'savings' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: '#5C4033' }}>Ziel (€)</label>
              <input type="number" value={target} onChange={e => setTarget(e.target.value)} style={{ width: '100%', padding: 12, border: '1px solid #E8E4DC', borderRadius: 8, fontSize: 16, boxSizing: 'border-box', background: '#FFFEF9' }} />
            </div>
            <div style={{ padding: 12, background: '#FAF8F5', borderRadius: 8, fontSize: 13, color: '#8B8589' }}>
              💡 "Bereits gespart" wird automatisch aus allen bisherigen Monaten berechnet.
            </div>
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12, padding: '16px 20px', borderTop: '1px solid #E8E4DC' }}>
        <button onClick={onClose} style={{ flex: 1, padding: 12, border: '1px solid #E8E4DC', borderRadius: 8, background: '#FFFEF9', cursor: 'pointer', fontWeight: 500, color: '#5C4033' }}>Abbrechen</button>
        <button onClick={handleSave} style={{ flex: 1, padding: 12, border: 'none', borderRadius: 8, background: '#8B7355', color: '#FFFEF9', cursor: 'pointer', fontWeight: 500 }}>Speichern</button>
      </div>
    </Modal>
  );
};

// NEU: Quick-Add Category Modal für Bank-Import
const QuickAddCategoryModal = ({ open, categoryType, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('MoreHorizontal');
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    const newCategory = {
      id: `${categoryType[0]}${Date.now()}`,
      name: name.trim(),
      amount: 0,
      icon,
      desc: ''
    };
    onSave(newCategory);
    setName('');
    setIcon('MoreHorizontal');
    setShowIconPicker(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Neue Kategorie erstellen">
      <div style={{ padding: 20, maxHeight: '50vh', overflowY: 'auto' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: '#5C4033' }}>Name</label>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)}
            autoFocus
            placeholder="z.B. Amazon"
            style={{ width: '100%', padding: 12, border: '1px solid #E8E4DC', borderRadius: 8, fontSize: 16, boxSizing: 'border-box', background: '#FFFEF9' }} 
          />
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#5C4033' }}>Icon</label>
          <button
            type="button"
            onClick={() => setShowIconPicker(!showIconPicker)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              border: '1px solid #E8E4DC',
              borderRadius: 8,
              background: '#FFFEF9',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            {(() => { const IconComp = iconMap[icon] || MoreHorizontal; return <IconComp size={20} color="#333" />; })()}
            <span style={{ flex: 1, textAlign: 'left', color: '#5C4033' }}>{icon}</span>
            <ChevronDown size={16} color="#999" style={{ transform: showIconPicker ? 'rotate(180deg)' : 'none' }} />
          </button>
          
          {showIconPicker && (
            <div style={{ marginTop: 8, border: '1px solid #E8E4DC', borderRadius: 8, background: '#FFFEF9', maxHeight: 200, overflowY: 'auto' }}>
              {iconCategories.map(category => (
                <div key={category.name}>
                  <div style={{ padding: '8px 12px', background: '#FAF8F5', fontSize: 11, fontWeight: 600, color: '#888', position: 'sticky', top: 0, zIndex: 1 }}>
                    {category.name.toUpperCase()}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, padding: 8 }}>
                    {category.icons.map(iconKey => {
                      const IconComp = iconMap[iconKey] || MoreHorizontal;
                      return (
                        <button
                          key={iconKey}
                          type="button"
                          onClick={() => { setIcon(iconKey); setShowIconPicker(false); }}
                          style={{
                            padding: 8,
                            border: icon === iconKey ? '2px solid #333' : '1px solid transparent',
                            borderRadius: 6,
                            background: icon === iconKey ? '#F0F0F0' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title={iconKey}
                        >
                          <IconComp size={18} color="#333" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, padding: '16px 20px', borderTop: '1px solid #E8E4DC' }}>
        <button onClick={onClose} style={{ flex: 1, padding: 12, border: '1px solid #E8E4DC', borderRadius: 8, background: '#FFFEF9', cursor: 'pointer', fontWeight: 500, color: '#5C4033' }}>Abbrechen</button>
        <button onClick={handleSave} disabled={!name.trim()} style={{ flex: 1, padding: 12, border: 'none', borderRadius: 8, background: '#8B7355', color: '#FFFEF9', cursor: 'pointer', fontWeight: 500, opacity: name.trim() ? 1 : 0.5 }}>Erstellen</button>
      </div>
    </Modal>
  );
};

// NEU: Bank-Import Modal
const BankImportModal = ({ open, onClose, onImport, data, categoryRules, onAddCategory, learningRules = [] }) => {
  const [csvText, setCsvText] = useState('');
  const [parsedTransactions, setParsedTransactions] = useState([]);
  const [step, setStep] = useState(1);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryType, setNewCategoryType] = useState('variableCosts');
  const [pendingTransactionId, setPendingTransactionId] = useState(null);

  const parseCSV = (text) => {
    // BOM entfernen falls vorhanden
    const cleanText = text.replace(/^\uFEFF/, '').trim();
    const lines = cleanText.split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(';').map(h => h.trim());
    const transactions = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(';');
      if (values.length < headers.length) continue;
      
      const transaction = {};
      headers.forEach((header, idx) => {
        transaction[header] = values[idx]?.trim() || '';
      });
      
      const date = transaction['Buchungsdatum'] || '';
      const description = transaction['Buchungstext'] || '';
      const amount = parseFloat((transaction['Betrag'] || '0').replace(',', '.'));
      const recipient = transaction['Empfängername'] || transaction['Auftraggebername'] || '';
      const purpose = transaction['Verwendungszweck'] || '';
      
      if (date && amount !== 0) {
        // Bank Austria: Shop-Name ist im Buchungstext (z.B. "BILLA DANKT 0001528")
        const fullText = `${description} ${purpose}`.toUpperCase();
        let category = null;
        let categoryType = null;
        
        // Erst Learning-Rules prüfen (haben Priorität)
        for (const rule of learningRules) {
          if (rule.keywords.some(kw => fullText.includes(kw.toUpperCase()))) {
            categoryType = rule.categoryType;
            const categoryList = data[categoryType] || [];
            category = categoryList.find(c => c.id === rule.categoryId);
            if (category) break;
          }
        }
        
        // Falls keine Learning-Rule, dann Default-Rules
        if (!category) {
          for (const rule of categoryRules) {
            if (rule.keywords.some(kw => fullText.includes(kw.toUpperCase()))) {
              categoryType = rule.categoryType;
              const categoryList = data[categoryType] || [];
              category = categoryList.find(c => c.name === rule.categoryName);
              if (category) break;
            }
          }
        }
        
        transactions.push({
          id: `t${Date.now()}${i}`,
          date,
          description: description.split(/\s{2,}/)[0].trim(), // Nimm nur ersten Teil vor mehreren Leerzeichen
          amount: Math.abs(amount),
          isExpense: amount < 0,
          category: category || null,
          categoryType: categoryType || 'variableCosts',
          purpose,
          selected: true
        });
      }
    }
    
    return transactions;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      setCsvText(text);
      const parsed = parseCSV(text);
      setParsedTransactions(parsed);
      setStep(2);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const updateCategory = (transactionId, categoryId, categoryType) => {
    setParsedTransactions(prev => prev.map(t => {
      if (t.id === transactionId) {
        const categoryList = data[categoryType] || [];
        const category = categoryList.find(c => c.id === categoryId);
        return { ...t, category, categoryType };
      }
      return t;
    }));
  };

  const toggleTransaction = (transactionId) => {
    setParsedTransactions(prev => prev.map(t => 
      t.id === transactionId ? { ...t, selected: !t.selected } : t
    ));
  };

  const handleImport = () => {
    const selected = parsedTransactions.filter(t => t.selected && t.category);
    onImport(selected);
    onClose();
    setStep(1);
    setCsvText('');
    setParsedTransactions([]);
  };

  const getCategoryOptions = (type) => {
    return (data[type] || []).map(c => ({ id: c.id, name: c.name, icon: c.icon }));
  };

  const handleAddNewCategory = (transactionId, categoryType) => {
    setPendingTransactionId(transactionId);
    setNewCategoryType(categoryType);
    setShowNewCategoryModal(true);
  };

  const handleNewCategoryCreated = (newCategory) => {
    setShowNewCategoryModal(false);
    if (pendingTransactionId && newCategory) {
      // Transaktion mit neuer Kategorie aktualisieren
      updateCategory(pendingTransactionId, newCategory.id, newCategoryType);
    }
    setPendingTransactionId(null);
  };

  return (
    <Modal open={open} onClose={onClose} title="Bank CSV importieren">
      <div style={{ padding: 20, maxHeight: '60vh', overflowY: 'auto' }}>
        {step === 1 && (
          <div>
            <p style={{ color: '#5C4033', marginBottom: 16 }}>
              Laden Sie Ihre Bank Austria CSV-Datei hoch.
            </p>
            <label style={{ 
              display: 'block', 
              width: '100%', 
              padding: 40, 
              border: '2px dashed #E8E4DC', 
              borderRadius: 12, 
              textAlign: 'center', 
              cursor: 'pointer',
              background: '#FAF8F5'
            }}>
              <Upload size={32} color="#8B7355" style={{ margin: '0 auto 12px' }} />
              <div style={{ color: '#5C4033', fontWeight: 500 }}>CSV-Datei auswählen</div>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ marginBottom: 16, padding: 12, background: '#F5F5DC', borderRadius: 8 }}>
              <span style={{ fontSize: 13, color: '#5C4033' }}>
                {parsedTransactions.length} Transaktionen gefunden
              </span>
            </div>

            <div style={{ maxHeight: '45vh', overflowY: 'auto' }}>
              {parsedTransactions.map(t => (
                <div key={t.id} style={{ 
                  padding: 12, 
                  marginBottom: 8, 
                  border: '1px solid #E8E4DC', 
                  borderRadius: 8,
                  background: t.selected ? '#FFFEF9' : '#FAF8F5',
                  opacity: t.selected ? 1 : 0.6
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
                    <input 
                      type="checkbox" 
                      checked={t.selected} 
                      onChange={() => toggleTransaction(t.id)}
                      style={{ marginTop: 4 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: '#8B8589' }}>{t.date}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: t.isExpense ? '#A0522D' : '#6B8E23' }}>
                          {t.isExpense ? '-' : '+'}{formatCurrency(t.amount)}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, color: '#5C4033', marginBottom: 8 }}>{t.description}</div>
                      
                      <div style={{ display: 'flex', gap: 8 }}>
                        <select 
                          value={t.categoryType} 
                          onChange={(e) => {
                            const type = e.target.value;
                            const firstCat = getCategoryOptions(type)[0];
                            if (firstCat) updateCategory(t.id, firstCat.id, type);
                          }}
                          style={{ 
                            padding: '6px 10px', 
                            border: '1px solid #E8E4DC', 
                            borderRadius: 6, 
                            fontSize: 12,
                            background: '#FFFEF9'
                          }}
                        >
                          <option value="fixedCosts">Fixkosten</option>
                          <option value="variableCosts">Variable Kosten</option>
                        </select>
                        
                        <select 
                          value={t.category?.id || ''} 
                          onChange={(e) => updateCategory(t.id, e.target.value, t.categoryType)}
                          style={{ 
                            flex: 1,
                            padding: '6px 10px', 
                            border: '1px solid #E8E4DC', 
                            borderRadius: 6, 
                            fontSize: 12,
                            background: '#FFFEF9'
                          }}
                        >
                          <option value="">Nicht zugeordnet</option>
                          {getCategoryOptions(t.categoryType).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        
                        <button
                          onClick={() => handleAddNewCategory(t.id, t.categoryType)}
                          style={{
                            padding: '6px 10px',
                            border: '1px solid #8B7355',
                            borderRadius: 6,
                            background: '#FFFEF9',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                          title="Neue Kategorie erstellen"
                        >
                          <Plus size={14} color="#8B7355" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button 
                onClick={() => { setStep(1); setParsedTransactions([]); }}
                style={{ 
                  flex: 1,
                  padding: 12, 
                  border: '1px solid #E8E4DC', 
                  borderRadius: 8, 
                  background: '#FFFEF9', 
                  color: '#5C4033',
                  cursor: 'pointer'
                }}
              >
                Zurück
              </button>
              <button 
                onClick={handleImport}
                disabled={!parsedTransactions.some(t => t.selected && t.category)}
                style={{ 
                  flex: 2,
                  padding: 12, 
                  border: 'none', 
                  borderRadius: 8, 
                  background: '#8B7355', 
                  color: '#FFFEF9',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: parsedTransactions.some(t => t.selected && t.category) ? 1 : 0.5
                }}
              >
                {parsedTransactions.filter(t => t.selected && t.category).length} importieren
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Quick-Add Category Modal */}
      {showNewCategoryModal && (
        <QuickAddCategoryModal
          open={showNewCategoryModal}
          categoryType={newCategoryType}
          onClose={() => setShowNewCategoryModal(false)}
          onSave={(newCat) => {
            onAddCategory(newCat, newCategoryType);
            handleNewCategoryCreated(newCat);
          }}
        />
      )}
    </Modal>
  );
};

const ProgressBar = ({ value, color = '#8B7355' }) => (
  <div style={{ width: '100%', height: 6, background: '#E8E4DC', borderRadius: 3, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, value * 100))}%`, background: value > 1 ? '#A0522D' : color, borderRadius: 3 }} />
  </div>
);

const VariableItem = ({ item, weekly, onEdit, onDelete, onUpdateWeekly, actualAmount, showComparison }) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = iconMap[item.icon] || MoreHorizontal;
  const weeklyBudget = item.amount / 4;
  const w = weekly || {};
  const spent = (w.w1 || 0) + (w.w2 || 0) + (w.w3 || 0) + (w.w4 || 0);
  const rest = item.amount - spent;
  const diff = showComparison ? item.amount - (actualAmount || 0) : 0;

  return (
    <div style={{ borderBottom: '1px solid #E8E4DC' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', gap: 12, cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color="#8B7355" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, color: '#5C4033' }}>{item.name}</div>
          <div style={{ fontSize: 13, color: '#8B8589' }}>{formatCurrency(item.amount)}/Monat</div>
          {showComparison && actualAmount !== undefined && (
            <div style={{ fontSize: 12, marginTop: 4 }}>
              <div style={{ color: '#8B8589' }}>
                Ist: {formatCurrency(actualAmount || 0)}
              </div>
              <div style={{ color: diff >= 0 ? '#6B8E23' : '#A0522D', fontWeight: 500 }}>
                {diff >= 0 ? `${formatCurrency(diff)} unter Budget ✅` : `${formatCurrency(Math.abs(diff))} über Budget ❌`}
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} style={{ padding: 8, border: 'none', background: 'transparent', cursor: 'pointer' }}><Edit3 size={16} color="#8B8589" /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} style={{ padding: 8, border: 'none', background: 'transparent', cursor: 'pointer' }}><Trash2 size={16} color="#8B8589" /></button>
          {isOpen ? <ChevronUp size={20} color="#8B8589" /> : <ChevronDown size={20} color="#8B8589" />}
        </div>
      </div>
      {isOpen && (
        <div style={{ padding: '0 20px 16px', background: '#FAF8F5' }}>
          <div style={{ fontSize: 12, color: '#8B8589', marginBottom: 12, fontWeight: 500 }}>WOCHENBUDGET (je {formatCurrency(weeklyBudget)})</div>
          {weeks.map((wk) => (
            <div key={wk.key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 70 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#5C4033' }}>{wk.label}</div>
                <div style={{ fontSize: 11, color: '#8B8589' }}>{wk.range}</div>
              </div>
              <input type="number" value={w[wk.key] || ''} onChange={(e) => onUpdateWeekly(item.id, wk.key, parseFloat(e.target.value) || 0)} onClick={(e) => e.stopPropagation()} style={{ width: 80, padding: '8px 10px', border: '1px solid #E8E4DC', borderRadius: 6, fontSize: 14 }} placeholder="0" />
              <div style={{ flex: 1 }}><ProgressBar value={weeklyBudget > 0 ? (w[wk.key] || 0) / weeklyBudget : 0} color="#C3B091" /></div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #E8E4DC', marginTop: 8 }}>
            <span style={{ color: '#8B8589' }}>Ausgegeben: {formatCurrency(spent)}</span>
            <span style={{ fontWeight: 600, color: rest >= 0 ? '#6B8E23' : '#A0522D' }}>{rest >= 0 ? `Rest: ${formatCurrency(rest)}` : `Über: ${formatCurrency(Math.abs(rest))}`}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const SimpleItem = ({ item, onEdit, onDelete, type, actualAmount, showComparison }) => {
  const Icon = iconMap[item.icon] || MoreHorizontal;
  const diff = showComparison ? item.amount - (actualAmount || 0) : 0;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', gap: 12, borderBottom: '1px solid #E8E4DC' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color="#8B7355" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, color: '#5C4033' }}>{item.name}</div>
        {item.desc && <div style={{ fontSize: 12, color: '#8B8589', marginTop: 2 }}>{item.desc}</div>}
        {showComparison && actualAmount !== undefined && (
          <div style={{ marginTop: 4, fontSize: 12 }}>
            <div style={{ color: '#8B8589' }}>
              Budget: {formatCurrency(item.amount)} | Ist: {formatCurrency(actualAmount || 0)}
            </div>
            <div style={{ color: diff >= 0 ? '#6B8E23' : '#A0522D', fontWeight: 500 }}>
              {diff >= 0 ? `${formatCurrency(diff)} unter Budget ✅` : `${formatCurrency(Math.abs(diff))} über Budget ❌`}
            </div>
          </div>
        )}
        {type === 'savings' && item.target > 0 && (
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 12, color: '#8B8589', marginBottom: 4 }}>{formatCurrency(item.saved)} von {formatCurrency(item.target)}</div>
            <ProgressBar value={item.saved / item.target} color="#8B7355" />
          </div>
        )}
      </div>
      <div style={{ fontWeight: 600, color: '#5C4033' }}>
        {showComparison ? formatCurrency(actualAmount || 0) : formatCurrency(item.amount)}
      </div>
      <button onClick={() => onEdit(item)} style={{ padding: 8, border: 'none', background: 'transparent', cursor: 'pointer' }}><Edit3 size={16} color="#8B8589" /></button>
      <button onClick={() => onDelete(item.id)} style={{ padding: 8, border: 'none', background: 'transparent', cursor: 'pointer' }}><Trash2 size={16} color="#8B8589" /></button>
    </div>
  );
};

const Section = ({ title, total, color, icon: Icon, children, onAdd }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div style={{ background: '#FFFEF9', borderRadius: 16, overflow: 'hidden', border: '1px solid #E8E4DC' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', borderLeft: `4px solid ${color}` }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Icon size={20} color={color} />
        </div>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 600, color: '#5C4033' }}>{title}</div></div>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#5C4033', marginRight: 12 }}>{formatCurrency(total)}</div>
        {isOpen ? <ChevronUp size={20} color="#8B8589" /> : <ChevronDown size={20} color="#8B8589" />}
      </div>
      {isOpen && (
        <div>
          {children}
          <div style={{ padding: '12px 20px', background: '#FAF8F5' }}>
            <button onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#8B7355', fontWeight: 500 }}><Plus size={16} /> Hinzufügen</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  // Lade gespeicherte Daten aus localStorage beim Start
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem('budgetAppData');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Nur laden wenn tatsächlich Daten vorhanden sind
        if (parsed.allData && Object.keys(parsed.allData).length > 0) {
          return {
            allData: parsed.allData,
            appName: parsed.appName || 'Budget',
            learningRules: parsed.learningRules || []
          };
        }
      }
    } catch (e) {
      console.error('Fehler beim Laden:', e);
    }
    // Kein gespeicherter Stand -> leere Daten starten (KEINE Beispieldaten)
    const currentMonthKey = getMonthKey(new Date());
    return { 
      allData: { [currentMonthKey]: createMonthData(false) }, 
      appName: 'Budget',
      learningRules: []
    };
  };

  const initialData = loadFromStorage();
  const [currentMonth, setCurrentMonth] = useState(getMonthKey(new Date()));
  const [allData, setAllData] = useState(initialData.allData);
  const [editModal, setEditModal] = useState({ open: false, item: null, type: '', category: '' });
  const [tab, setTab] = useState('budget');
  const [appName, setAppName] = useState(initialData.appName);
  const [editingName, setEditingName] = useState(false);
  const [showDataMenu, setShowDataMenu] = useState(false);
  const [showBankImport, setShowBankImport] = useState(false); // NEU
  const [viewMode, setViewMode] = useState('budget'); // NEU: 'budget' oder 'comparison'
  const [learningRules, setLearningRules] = useState(initialData.learningRules); // NEU: Auto-Learning
  const year = currentMonth.split('-')[0];

  // Speichere Daten automatisch bei Änderungen
  useEffect(() => {
    try {
      localStorage.setItem('budgetAppData', JSON.stringify({ allData, appName, learningRules }));
    } catch (e) {
      console.error('Fehler beim Speichern:', e);
    }
  }, [allData, appName, learningRules]);

  // Daten als JSON-Datei exportieren (Backup) - mit iOS Share API
  const exportBackup = async () => {
    try {
      const backup = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        appName,
        allData
      };
      
      const dataStr = JSON.stringify(backup, null, 2);
      const fileName = `${appName}-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      // Prüfe ob Web Share API verfügbar ist (iOS/moderne Browser)
      if (navigator.share && navigator.canShare) {
        // Erstelle eine Datei
        const file = new File([dataStr], fileName, { type: 'application/json' });
        
        // Prüfe ob Dateien geteilt werden können
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Budget Backup',
              text: 'Backup deiner Budget-Daten'
            });
            setShowDataMenu(false);
            return;
          } catch (err) {
            if (err.name !== 'AbortError') {
              console.error('Share error:', err);
            }
          }
        }
      }
      
      // Fallback: Normaler Download für Desktop/ältere Browser
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      setShowDataMenu(false);
    } catch (error) {
      alert('Fehler beim Erstellen des Backups: ' + error.message);
      console.error('Backup error:', error);
    }
  };

  // Daten aus JSON-Datei importieren (Restore)
  const importBackup = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result);
        if (backup.allData) {
          setAllData(backup.allData);
          if (backup.appName) setAppName(backup.appName);
          alert('Daten erfolgreich importiert!');
        } else {
          alert('Ungültige Backup-Datei');
        }
      } catch (err) {
        alert('Fehler beim Importieren: ' + err.message);
      }
    };
    reader.readAsText(file);
    setShowDataMenu(false);
  };

  // Alle Daten löschen
  const clearAllData = () => {
    if (confirm('Wirklich ALLE Daten löschen? Dies kann nicht rückgängig gemacht werden!')) {
      setAllData({ [getMonthKey(new Date())]: createMonthData(false) });
      setAppName('Budget');
      localStorage.removeItem('budgetAppData');
      alert('Alle Daten wurden gelöscht.');
    }
    setShowDataMenu(false);
  };

  const getData = () => {
    const existing = allData[currentMonth];
    if (!existing) {
      // Finde vorherigen Monat um Sparziele zu übernehmen
      const [y, m] = currentMonth.split('-').map(Number);
      const prevMonthKey = getMonthKey(new Date(y, m - 2, 1));
      const prevData = allData[prevMonthKey];
      
      const newData = createMonthData(false);
      
      // Übernehme Sparziele vom Vormonat
      if (prevData?.savings) {
        newData.savings = newData.savings.map(saving => {
          const prevSaving = prevData.savings.find(s => s.id === saving.id);
          if (prevSaving) {
            return {
              ...saving,
              target: prevSaving.target, // Sparziel übernehmen
              name: prevSaving.name,
              icon: prevSaving.icon
            };
          }
          return saving;
        });
      }
      
      // Nur setzen wenn wirklich noch nicht vorhanden
      setAllData(prev => {
        if (prev[currentMonth]) return prev; // Bereits vorhanden, nicht überschreiben
        return { ...prev, [currentMonth]: newData };
      });
      return allData[currentMonth] || newData;
    }
    return existing;
  };

  const data = getData();
  const totIncome = data.income.reduce((s, i) => s + i.amount, 0);
  const totFixed = data.fixedCosts.reduce((s, i) => s + i.amount, 0);
  const totVariable = data.variableCosts.reduce((s, i) => s + i.amount, 0);
  const totSavings = data.savings.reduce((s, i) => s + i.amount, 0);
  const budget = totIncome + (data.rollover || 0);
  const totExpenses = totFixed + totVariable + totSavings;
  const available = budget - totExpenses;

  // NEU: Berechne tatsächliche Ausgaben aus Bank-Transaktionen
  const getActualExpenses = (categoryType, categoryId) => {
    if (!data.bankTransactions) return 0;
    return data.bankTransactions
      .filter(t => t.categoryType === categoryType && t.category?.id === categoryId && t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const prevMonth = () => { const [y, m] = currentMonth.split('-').map(Number); setCurrentMonth(getMonthKey(new Date(y, m - 2, 1))); };
  const nextMonth = () => { const [y, m] = currentMonth.split('-').map(Number); setCurrentMonth(getMonthKey(new Date(y, m, 1))); };

  const saveItem = (item, category) => {
    setAllData(prev => {
      const updated = { 
        ...prev, 
        [currentMonth]: { 
          ...prev[currentMonth], 
          [category]: prev[currentMonth][category].map(i => i.id === item.id ? item : i) 
        } 
      };
      
      // Wenn es eine Rücklage ist und das Sparziel geändert wurde, 
      // übertrage es in alle zukünftigen Monate
      if (category === 'savings' && item.target !== undefined) {
        const [currentY, currentM] = currentMonth.split('-').map(Number);
        
        Object.keys(prev).forEach(monthKey => {
          const [y, m] = monthKey.split('-').map(Number);
          // Nur zukünftige Monate aktualisieren
          if (y > currentY || (y === currentY && m > currentM)) {
            const monthData = prev[monthKey];
            if (monthData?.savings) {
              const savingInFutureMonth = monthData.savings.find(s => s.id === item.id);
              if (savingInFutureMonth) {
                updated[monthKey] = {
                  ...monthData,
                  savings: monthData.savings.map(s => 
                    s.id === item.id ? { ...s, target: item.target, name: item.name, icon: item.icon } : s
                  )
                };
              }
            }
          }
        });
      }
      
      return updated;
    });
  };

  const addItem = (category, type) => {
    const newId = `${category[0]}${Date.now()}`;
    const defaultIcon = category === 'income' ? 'Briefcase' : category === 'fixedCosts' ? 'Home' : category === 'variableCosts' ? 'ShoppingCart' : 'PiggyBank';
    const newItem = {
      id: newId,
      name: 'Neu',
      amount: 0,
      icon: defaultIcon,
      desc: '',
      ...(category === 'savings' && { target: 0, saved: 0 })
    };
    setAllData(prev => ({
      ...prev,
      [currentMonth]: {
        ...prev[currentMonth],
        [category]: [...prev[currentMonth][category], newItem]
      }
    }));
    // Öffne sofort das Edit-Modal für den neuen Eintrag
    setEditModal({ open: true, item: newItem, type, category });
  };

  const deleteItem = (id, category) => {
    if (confirm('Löschen?')) {
      setAllData(prev => ({ ...prev, [currentMonth]: { ...prev[currentMonth], [category]: prev[currentMonth][category].filter(i => i.id !== id) } }));
    }
  };

  // Berechnet automatisch den gesparten Betrag aus allen bisherigen Monaten
  const calculateSaved = (savingsId) => {
    let total = 0;
    const [currentY, currentM] = currentMonth.split('-').map(Number);
    
    // Durchlaufe alle Monate in allData bis einschließlich aktuellen Monat
    Object.keys(allData).forEach(monthKey => {
      const [y, m] = monthKey.split('-').map(Number);
      // Nur Monate bis einschließlich aktuellen Monat zählen
      if (y < currentY || (y === currentY && m <= currentM)) {
        const monthData = allData[monthKey];
        if (monthData?.savings) {
          const savingsItem = monthData.savings.find(s => s.id === savingsId);
          if (savingsItem) {
            total += savingsItem.amount || 0;
          }
        }
      }
    });
    return total;
  };

  const updateWeekly = (itemId, weekKey, value) => {
    setAllData(prev => ({ ...prev, [currentMonth]: { ...prev[currentMonth], weekly: { ...prev[currentMonth].weekly, [itemId]: { ...(prev[currentMonth].weekly?.[itemId] || {}), [weekKey]: value } } } }));
  };

  // NEU: Bank-Import Funktion
  const handleBankImport = (transactions) => {
    // Learning-Rules aktualisieren: Für jede Transaktion mit Kategorie eine Rule erstellen
    const newLearningRules = [...learningRules];
    transactions.forEach(t => {
      if (t.category && t.description) {
        // Extrahiere Schlüsselwort aus Beschreibung (erster Teil vor Leerzeichen/Zahlen)
        const keyword = t.description.split(/[\s\d]/)[0].toUpperCase();
        
        // Prüfe ob bereits eine Rule für diese Kategorie und dieses Keyword existiert
        const exists = newLearningRules.some(rule => 
          rule.categoryId === t.category.id && 
          rule.keywords.some(kw => kw.toUpperCase() === keyword)
        );
        
        if (!exists && keyword.length > 2) {
          newLearningRules.push({
            keywords: [keyword],
            categoryType: t.categoryType,
            categoryId: t.category.id
          });
        }
      }
    });
    setLearningRules(newLearningRules);
    
    setAllData(prev => {
      const currentData = prev[currentMonth];
      const existing = currentData.bankTransactions || [];
      
      // Duplikaterkennung
      const newTransactions = transactions.filter(newT => {
        return !existing.some(existT => 
          existT.date === newT.date && 
          existT.amount === newT.amount && 
          existT.description === newT.description
        );
      });
      
      // Aktualisiere weekly budgets basierend auf Transaktionsdatum
      const updatedWeekly = { ...currentData.weekly };
      newTransactions.forEach(t => {
        if (t.category && t.isExpense) {
          const weekKey = getWeekNumber(t.date);
          if (updatedWeekly[t.category.id]) {
            updatedWeekly[t.category.id] = {
              ...updatedWeekly[t.category.id],
              [weekKey]: (updatedWeekly[t.category.id][weekKey] || 0) + t.amount
            };
          } else {
            updatedWeekly[t.category.id] = {
              [weekKey]: t.amount
            };
          }
        }
      });
      
      return {
        ...prev,
        [currentMonth]: {
          ...currentData,
          bankTransactions: [...existing, ...newTransactions],
          weekly: updatedWeekly
        }
      };
    });
  };

  const transferToNextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const nextKey = getMonthKey(new Date(y, m, 1));
    
    // Berechne verfügbares Budget exakt
    const currentData = allData[currentMonth];
    const income = currentData.income?.reduce((s, i) => s + i.amount, 0) || 0;
    const fixed = currentData.fixedCosts?.reduce((s, i) => s + i.amount, 0) || 0;
    const variable = currentData.variableCosts?.reduce((s, i) => s + i.amount, 0) || 0;
    const savings = currentData.savings?.reduce((s, i) => s + i.amount, 0) || 0;
    const rollover = currentData.rollover || 0;
    const availableToTransfer = income + rollover - fixed - variable - savings;
    
    setAllData(prev => {
      const existingData = prev[nextKey];
      if (existingData) {
        return { 
          ...prev, 
          [nextKey]: { 
            ...existingData, 
            rollover: (existingData.rollover || 0) + availableToTransfer 
          } 
        };
      } else {
        const newMonthData = createMonthData(false);
        return { 
          ...prev, 
          [nextKey]: { 
            ...newMonthData, 
            rollover: availableToTransfer 
          } 
        };
      }
    });
    
    // Direkt zum nächsten Monat wechseln
    setCurrentMonth(nextKey);
  };

  const exportCSV = () => {
    const BOM = '\uFEFF'; // UTF-8 BOM für Excel
    let csv = BOM + 'Kategorie;Name;Beschreibung;Betrag\n';
    
    // Einnahmen
    let sumIncome = 0;
    data.income.forEach(i => {
      csv += `Einnahmen;${i.name};${i.desc || ''};${i.amount}\n`;
      sumIncome += i.amount;
    });
    if (data.rollover) {
      csv += `Einnahmen;Übertrag;;${data.rollover}\n`;
      sumIncome += data.rollover;
    }
    csv += `Einnahmen;SUMME;;${sumIncome}\n\n`;
    
    // Fixkosten
    let sumFixed = 0;
    data.fixedCosts.forEach(i => {
      csv += `Fixkosten;${i.name};${i.desc || ''};${i.amount}\n`;
      sumFixed += i.amount;
    });
    csv += `Fixkosten;SUMME;;${sumFixed}\n\n`;
    
    // Variable Kosten
    let sumVariable = 0;
    data.variableCosts.forEach(i => {
      csv += `Variable Kosten;${i.name};${i.desc || ''};${i.amount}\n`;
      sumVariable += i.amount;
    });
    csv += `Variable Kosten;SUMME;;${sumVariable}\n\n`;
    
    // Rücklagen
    let sumSavings = 0;
    data.savings.forEach(i => {
      csv += `Rücklagen;${i.name};${i.desc || ''};${i.amount}\n`;
      sumSavings += i.amount;
    });
    csv += `Rücklagen;SUMME;;${sumSavings}\n\n`;
    
    // Gesamtübersicht
    csv += `ÜBERSICHT;;;;\n`;
    csv += `;Gesamt Einnahmen;;${sumIncome}\n`;
    csv += `;Gesamt Ausgaben;;${sumFixed + sumVariable + sumSavings}\n`;
    csv += `;Verfügbar;;${sumIncome - sumFixed - sumVariable - sumSavings}\n`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appName}-${currentMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportYearCSV = () => {
    const BOM = '\uFEFF';
    const months = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
    
    let csv = BOM + `${appName} - Jahresübersicht ${year}\n\n`;
    csv += 'Monat;Einnahmen;Fixkosten;Variable Kosten;Rücklagen;Ausgaben Gesamt;Übertrag;Verfügbar\n';
    
    let totalIncome = 0, totalFixed = 0, totalVariable = 0, totalSavings = 0, totalExpenses = 0, totalAvailable = 0;
    
    months.forEach(monthKey => {
      const monthData = allData[monthKey];
      const [, m] = monthKey.split('-').map(Number);
      const monthName = new Date(2026, m - 1, 1).toLocaleDateString('de-DE', { month: 'long' });
      
      if (monthData) {
        const income = monthData.income?.reduce((s, i) => s + i.amount, 0) || 0;
        const fixed = monthData.fixedCosts?.reduce((s, i) => s + i.amount, 0) || 0;
        const variable = monthData.variableCosts?.reduce((s, i) => s + i.amount, 0) || 0;
        const savings = monthData.savings?.reduce((s, i) => s + i.amount, 0) || 0;
        const rollover = monthData.rollover || 0;
        const incomeWithRollover = income + rollover;
        const expenses = fixed + variable + savings;
        const available = incomeWithRollover - expenses;
        
        csv += `${monthName};${income};${fixed};${variable};${savings};${expenses};${rollover};${available}\n`;
        
        totalIncome += income;
        totalFixed += fixed;
        totalVariable += variable;
        totalSavings += savings;
        totalExpenses += expenses;
        totalAvailable += available;
      } else {
        csv += `${monthName};0;0;0;0;0;0;0\n`;
      }
    });
    
    csv += `\nGESAMT ${year};${totalIncome};${totalFixed};${totalVariable};${totalSavings};${totalExpenses};;${totalAvailable}\n`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appName}-Jahr-${year}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>${appName} - ${getMonthName(currentMonth)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #5C4033; border-bottom: 2px solid #D2B48C; padding-bottom: 10px; }
            h2 { color: #8B7355; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #E8E4DC; }
            th { background: #FAF8F5; font-weight: 600; }
            .amount { text-align: right; }
            .total { font-weight: bold; background: #FAF8F5; }
            .positive { color: #6B8E23; }
            .negative { color: #A0522D; }
            .summary { background: #5C4033; color: white; padding: 15px; border-radius: 8px; margin-top: 20px; }
            .summary span { display: block; margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>💰 ${appName} - ${getMonthName(currentMonth)}</h1>
          
          <h2>Einnahmen</h2>
          <table>
            <tr><th>Name</th><th class="amount">Betrag</th></tr>
            ${data.income.map(i => `<tr><td>${i.name}</td><td class="amount">${formatCurrency(i.amount)}</td></tr>`).join('')}
            ${data.rollover ? `<tr><td>${data.rollover > 0 ? 'Übertrag vom Vormonat' : 'Fehlbetrag vom Vormonat'}</td><td class="amount ${data.rollover > 0 ? 'positive' : 'negative'}">${formatCurrency(data.rollover)}</td></tr>` : ''}
            <tr class="total"><td>Summe</td><td class="amount">${formatCurrency(totIncome + (data.rollover || 0))}</td></tr>
          </table>
          
          <h2>Fixkosten</h2>
          <table>
            <tr><th>Name</th><th class="amount">Betrag</th></tr>
            ${data.fixedCosts.map(i => `<tr><td>${i.name}</td><td class="amount">${formatCurrency(i.amount)}</td></tr>`).join('')}
            <tr class="total"><td>Summe</td><td class="amount">${formatCurrency(totFixed)}</td></tr>
          </table>
          
          <h2>Variable Kosten</h2>
          <table>
            <tr><th>Name</th><th class="amount">Betrag</th></tr>
            ${data.variableCosts.map(i => `<tr><td>${i.name}</td><td class="amount">${formatCurrency(i.amount)}</td></tr>`).join('')}
            <tr class="total"><td>Summe</td><td class="amount">${formatCurrency(totVariable)}</td></tr>
          </table>
          
          <h2>Rücklagen</h2>
          <table>
            <tr><th>Name</th><th class="amount">Betrag</th></tr>
            ${data.savings.map(i => `<tr><td>${i.name}</td><td class="amount">${formatCurrency(i.amount)}</td></tr>`).join('')}
            <tr class="total"><td>Summe</td><td class="amount">${formatCurrency(totSavings)}</td></tr>
          </table>
          
          <div class="summary">
            <span><strong>Einnahmen:</strong> ${formatCurrency(budget)}</span>
            <span><strong>Ausgaben:</strong> ${formatCurrency(totExpenses)}</span>
            <span><strong>Verfügbar:</strong> ${formatCurrency(available)}</span>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5' }}>
      <header style={{ background: '#FFFEF9', borderBottom: '1px solid #E8E4DC', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {/* Erste Zeile: Logo + Monat + Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#5C4033', margin: 0, cursor: 'pointer' }} onClick={() => setEditingName(true)}>
            {editingName ? (
              <input 
                autoFocus
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
                style={{ fontSize: 18, fontWeight: 700, color: '#5C4033', border: 'none', background: 'transparent', width: 100, outline: '2px solid #D2B48C', borderRadius: 4, padding: '2px 4px' }}
              />
            ) : (
              <>💰 {appName}</>
            )}
          </h1>
          
          {tab === 'budget' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={prevMonth} style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer' }}><ChevronLeft size={18} color="#8B7355" /></button>
              <span style={{ fontWeight: 500, fontSize: 14, textAlign: 'center', color: '#5C4033' }}>{getMonthName(currentMonth)}</span>
              <button onClick={nextMonth} style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer' }}><ChevronRight size={18} color="#8B7355" /></button>
            </div>
          )}
          {tab === 'year' && (
            <span style={{ fontWeight: 500, color: '#5C4033', fontSize: 14 }}>Jahr {year}</span>
          )}
          </div>
          
          {/* Zweite Zeile: Tab-Buttons + Icons */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
            <button onClick={() => setTab('budget')} style={{ padding: '6px 10px', border: '1px solid #E8E4DC', borderRadius: 8, background: tab === 'budget' ? '#8B7355' : '#FFFEF9', color: tab === 'budget' ? '#FFFEF9' : '#5C4033', cursor: 'pointer', fontWeight: 500, fontSize: 12 }}>Monat</button>
            <button onClick={() => setTab('year')} style={{ padding: '6px 10px', border: '1px solid #E8E4DC', borderRadius: 8, background: tab === 'year' ? '#8B7355' : '#FFFEF9', color: tab === 'year' ? '#FFFEF9' : '#5C4033', cursor: 'pointer', fontWeight: 500, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} />Jahr</button>
            <button onClick={tab === 'year' ? exportYearCSV : exportCSV} style={{ padding: 6, border: '1px solid #E8E4DC', borderRadius: 8, background: '#FFFEF9', cursor: 'pointer' }} title="CSV exportieren"><Download size={16} color="#8B7355" /></button>
            <button onClick={handlePrint} style={{ padding: 6, border: '1px solid #E8E4DC', borderRadius: 8, background: '#FFFEF9', cursor: 'pointer' }} title="Drucken"><Printer size={16} color="#8B7355" /></button>
            {tab === 'budget' && (
              <button onClick={() => setShowBankImport(true)} style={{ padding: 6, border: '1px solid #E8E4DC', borderRadius: 8, background: '#FFFEF9', cursor: 'pointer' }} title="Bank CSV importieren"><FileText size={16} color="#8B7355" /></button>
            )}
            <button onClick={() => setShowDataMenu(!showDataMenu)} style={{ padding: 6, border: '1px solid #E8E4DC', borderRadius: 8, background: showDataMenu ? '#8B7355' : '#FFFEF9', cursor: 'pointer' }} title="Daten verwalten"><Save size={16} color={showDataMenu ? '#FFFEF9' : '#8B7355'} /></button>
            
            {showDataMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#FFFEF9', border: '1px solid #E8E4DC', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 200, minWidth: 200, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8E4DC', fontSize: 12, color: '#8B8589', fontWeight: 600 }}>DATEN VERWALTEN</div>
                <button onClick={exportBackup} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, color: '#5C4033', fontSize: 14 }}>
                  <Download size={16} color="#6B8E23" /> Backup speichern
                </button>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', cursor: 'pointer', color: '#5C4033', fontSize: 14 }}>
                  <Upload size={16} color="#8B7355" /> Backup laden
                  <input type="file" accept=".json" onChange={importBackup} style={{ display: 'none' }} />
                </label>
                <button onClick={clearAllData} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, color: '#A0522D', fontSize: 14, borderTop: '1px solid #E8E4DC' }}>
                  <Trash2 size={16} /> Alle Daten löschen
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
        {tab === 'budget' ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#FFFEF9', borderRadius: 12, padding: 16, borderLeft: '4px solid #D2B48C' }}>
                <div style={{ fontSize: 13, color: '#8B8589' }}>Einnahmen</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#5C4033' }}>{formatCurrency(budget)}</div>
                {data.rollover !== 0 && <div style={{ fontSize: 12, color: data.rollover > 0 ? '#6B8E23' : '#A0522D', marginTop: 4 }}>{data.rollover > 0 ? '+' : ''}{formatCurrency(data.rollover)} Übertrag</div>}
              </div>
              <div style={{ background: '#FFFEF9', borderRadius: 12, padding: 16, borderLeft: '4px solid #8B7355' }}>
                <div style={{ fontSize: 13, color: '#8B8589' }}>Ausgaben</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#5C4033' }}>{formatCurrency(totExpenses)}</div>
              </div>
              <div style={{ background: '#FFFEF9', borderRadius: 12, padding: 16, borderLeft: '4px solid #C3B091' }}>
                <div style={{ fontSize: 13, color: '#8B8589' }}>Verfügbar</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: available >= 0 ? '#6B8E23' : '#A0522D' }}>{available >= 0 ? '+' : ''}{formatCurrency(available)}</div>
              </div>
              <div style={{ background: '#FFFEF9', borderRadius: 12, padding: 16, borderLeft: '4px solid #8B8589' }}>
                <div style={{ fontSize: 13, color: '#8B8589' }}>Sparquote</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#5C4033' }}>{formatPercent(budget > 0 ? Math.max(0, available / budget) : 0)}</div>
              </div>
            </div>

            {/* NEU: Toggle Budget / Ist-Vergleich */}
            {data.bankTransactions && data.bankTransactions.length > 0 && (
              <div style={{ marginBottom: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button 
                  onClick={() => setViewMode('budget')}
                  style={{ 
                    padding: '8px 16px', 
                    border: '1px solid #E8E4DC', 
                    borderRadius: 8, 
                    background: viewMode === 'budget' ? '#8B7355' : '#FFFEF9', 
                    color: viewMode === 'budget' ? '#FFFEF9' : '#5C4033',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: 13
                  }}
                >
                  Budget
                </button>
                <button 
                  onClick={() => setViewMode('comparison')}
                  style={{ 
                    padding: '8px 16px', 
                    border: '1px solid #E8E4DC', 
                    borderRadius: 8, 
                    background: viewMode === 'comparison' ? '#8B7355' : '#FFFEF9', 
                    color: viewMode === 'comparison' ? '#FFFEF9' : '#5C4033',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: 13
                  }}
                >
                  Ist-Vergleich ({data.bankTransactions.length})
                </button>
              </div>
            )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Section title="Einnahmen" total={totIncome + (data.rollover || 0)} color="#D2B48C" icon={TrendingUp} onAdd={() => addItem('income', 'income')}>
            {data.income.map(item => <SimpleItem key={item.id} item={item} onEdit={(i) => setEditModal({ open: true, item: i, type: 'income', category: 'income' })} onDelete={(id) => deleteItem(id, 'income')} />)}
            {data.rollover !== 0 && (
              <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', gap: 12, borderBottom: '1px solid #E8E4DC', background: data.rollover > 0 ? '#F5F5DC' : '#FAF0E6' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: data.rollover > 0 ? '#E8E4DC' : '#F0E0D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {data.rollover > 0 ? <TrendingUp size={20} color="#6B8E23" /> : <TrendingDown size={20} color="#A0522D" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: data.rollover > 0 ? '#556B2F' : '#8B4513' }}>
                    {data.rollover > 0 ? 'Übertrag vom Vormonat' : 'Fehlbetrag vom Vormonat'}
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: data.rollover > 0 ? '#6B8E23' : '#A0522D' }}>
                  {data.rollover > 0 ? '+' : ''}{formatCurrency(data.rollover)}
                </div>
              </div>
            )}
          </Section>

          <Section title="Fixkosten" total={totFixed} color="#8B7355" icon={Home} onAdd={() => addItem('fixedCosts', 'fixed')}>
            {data.fixedCosts.map(item => (
              <SimpleItem 
                key={item.id} 
                item={item} 
                onEdit={(i) => setEditModal({ open: true, item: i, type: 'fixed', category: 'fixedCosts' })} 
                onDelete={(id) => deleteItem(id, 'fixedCosts')}
                actualAmount={viewMode === 'comparison' ? getActualExpenses('fixedCosts', item.id) : undefined}
                showComparison={viewMode === 'comparison'}
              />
            ))}
          </Section>

          <Section title="Variable Kosten" total={totVariable} color="#C3B091" icon={ShoppingCart} onAdd={() => addItem('variableCosts', 'variable')}>
            {data.variableCosts.map(item => {
              const actualAmount = viewMode === 'comparison' ? getActualExpenses('variableCosts', item.id) : undefined;
              return (
                <VariableItem 
                  key={item.id} 
                  item={item} 
                  weekly={data.weekly?.[item.id]} 
                  onEdit={(i) => setEditModal({ open: true, item: i, type: 'variable', category: 'variableCosts' })} 
                  onDelete={(id) => deleteItem(id, 'variableCosts')} 
                  onUpdateWeekly={updateWeekly}
                  actualAmount={actualAmount}
                  showComparison={viewMode === 'comparison'}
                />
              );
            })}
          </Section>

          <Section title="Rücklagen" total={totSavings} color="#8B8589" icon={PiggyBank} onAdd={() => addItem('savings', 'savings')}>
            {data.savings.map(item => {
              const autoSaved = calculateSaved(item.id);
              const itemWithAutoSaved = { ...item, saved: autoSaved };
              return <SimpleItem key={item.id} item={itemWithAutoSaved} type="savings" onEdit={(i) => setEditModal({ open: true, item: i, type: 'savings', category: 'savings' })} onDelete={(id) => deleteItem(id, 'savings')} />;
            })}
          </Section>

          {/* Verteilungs-Diagramm */}
          <div style={{ background: '#FFFEF9', borderRadius: 16, border: '1px solid #E8E4DC', padding: 20 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: '#5C4033' }}>Verteilung</h3>
            {[
              { label: 'Fixkosten', value: totFixed, color: '#8B7355' },
              { label: 'Variable Kosten', value: totVariable, color: '#C3B091' },
              { label: 'Rücklagen', value: totSavings, color: '#8B8589' },
              { label: 'Verfügbar', value: Math.max(0, available), color: '#6B8E23' }
            ].map((item, i) => {
              const total = totFixed + totVariable + totSavings + Math.max(0, available);
              const pct = total > 0 ? item.value / total : 0;
              return (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color }} />
                      <span style={{ fontSize: 14, color: '#5C4033' }}>{item.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontSize: 14, color: '#8B8589' }}>{formatPercent(pct)}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#5C4033', minWidth: 80, textAlign: 'right' }}>{formatCurrency(item.value)}</span>
                    </div>
                  </div>
                  <div style={{ height: 8, background: '#E8E4DC', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct * 100}%`, background: item.color, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Monatsabschluss - Übertrag Button */}
          <div style={{ background: '#5C4033', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: '#D2B48C', fontWeight: 500 }}>Verbleibendes Budget</span>
              <span style={{ color: available >= 0 ? '#90EE90' : '#FFA07A', fontSize: 24, fontWeight: 700 }}>{available >= 0 ? '+' : ''}{formatCurrency(available)}</span>
            </div>
            {available !== 0 && (
              <button onClick={transferToNextMonth} style={{ width: '100%', padding: 14, border: '2px solid #D2B48C', borderRadius: 10, background: 'transparent', color: '#D2B48C', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span>In nächsten Monat übertragen</span>
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
          </>
        ) : (
          <YTDView allData={allData} year={year} onSelectMonth={(m) => { setCurrentMonth(m); setTab('budget'); }} />

        )}
      </main>

      <EditModal open={editModal.open} item={editModal.item} type={editModal.type} onClose={() => setEditModal({ open: false, item: null, type: '', category: '' })} onSave={(item) => saveItem(item, editModal.category)} />
      <BankImportModal 
        open={showBankImport} 
        onClose={() => setShowBankImport(false)} 
        onImport={handleBankImport}
        data={data}
        categoryRules={defaultCategoryRules}
        learningRules={learningRules}
        onAddCategory={(newCategory, categoryType) => {
          setAllData(prev => ({
            ...prev,
            [currentMonth]: {
              ...prev[currentMonth],
              [categoryType]: [...prev[currentMonth][categoryType], newCategory]
            }
          }));
        }}
      />
    </div>
  );
}
