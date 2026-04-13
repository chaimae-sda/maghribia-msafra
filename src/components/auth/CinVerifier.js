'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, MapPin, CreditCard } from 'lucide-react';
import styles from './CinVerifier.module.css';

// We import zellige.js dynamically for CIN validation
let validateCIN, formatCIN;

export default function CinVerifier({ onVerified }) {
  const [cin, setCin] = useState('');
  const [result, setResult] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    import('zellige.js').then(mod => {
      validateCIN = mod.validateCIN;
      formatCIN = mod.formatCIN;
      setLoaded(true);
    }).catch(() => {
      // Fallback: basic regex validation if zellige fails to load
      validateCIN = (num) => {
        const regex = /^[A-Za-z]{1,2}\d{5,6}$/;
        return { isValid: regex.test(num.replace(/\s/g, '')) };
      };
      formatCIN = (num) => {
        const clean = num.replace(/\s/g, '').toUpperCase();
        return { formatted: clean };
      };
      setLoaded(true);
    });
  }, []);

  const handleChange = (value) => {
    const upper = value.toUpperCase();
    setCin(upper);

    if (upper.length >= 6 && loaded) {
      try {
        const validation = validateCIN(upper);
        const formatted = formatCIN ? formatCIN(upper, { format: 'spaced', case: 'upper' }) : null;

        if (validation?.isValid) {
          const info = {
            number: upper,
            formatted: formatted?.formatted || upper,
            region: validation?.region || extractRegion(upper),
            isValid: true,
          };
          setResult(info);
          onVerified?.(info);
        } else {
          setResult({ isValid: false, error: 'Numéro CIN invalide' });
        }
      } catch {
        // Fallback validation
        const regex = /^[A-Z]{1,2}\d{5,6}$/;
        if (regex.test(upper.replace(/\s/g, ''))) {
          const info = { number: upper, formatted: upper, region: extractRegion(upper), isValid: true };
          setResult(info);
          onVerified?.(info);
        } else {
          setResult({ isValid: false, error: 'Format invalide (ex: AB123456)' });
        }
      }
    } else {
      setResult(null);
    }
  };

  return (
    <div className={styles.cinVerifier}>
      <div className={styles.inputGroup}>
        <CreditCard size={20} className={styles.inputIcon} />
        <input
          type="text"
          placeholder="Ex: AB123456"
          value={cin}
          onChange={e => handleChange(e.target.value)}
          maxLength={10}
          className={`${styles.cinInput} ${result?.isValid ? styles.cinInput_valid : ''} ${result && !result.isValid ? styles.cinInput_invalid : ''}`}
        />
        {result?.isValid && <CheckCircle size={20} className={styles.validIcon} />}
        {result && !result.isValid && <AlertCircle size={20} className={styles.invalidIcon} />}
      </div>

      {result?.isValid && (
        <div className={styles.cinInfo}>
          <div className={styles.cinInfo_item}>
            <CreditCard size={16} />
            <span>CIN: <strong>{result.formatted}</strong></span>
          </div>
          <div className={styles.cinInfo_badge}>
            <CheckCircle size={14} />
            <span>CIN vérifié ✓</span>
          </div>
        </div>
      )}

      {result && !result.isValid && (
        <p className={styles.errorText}>
          <AlertCircle size={14} /> {result.error}
        </p>
      )}
    </div>
  );
}

function extractRegion(cin) {
  const prefix = cin.replace(/\d/g, '').toUpperCase();
  const regions = {
    'A': 'Rabat', 'AB': 'Rabat', 'B': 'Casablanca', 'BA': 'Casablanca', 'BB': 'Casablanca', 'BH': 'Casablanca',
    'BJ': 'Casablanca', 'BK': 'Casablanca', 'BL': 'Casablanca', 'BE': 'Casablanca',
    'C': 'Fès', 'CB': 'Fès', 'CD': 'Fès',
    'D': 'Marrakech', 'DA': 'Marrakech', 'DB': 'Marrakech',
    'E': 'Meknès', 'EA': 'Meknès', 'EE': 'Meknès',
    'F': 'Tanger', 'FA': 'Tanger', 'FB': 'Tanger',
    'G': 'Oujda', 'GA': 'Oujda',
    'H': 'Agadir', 'HA': 'Agadir', 'HB': 'Agadir',
    'I': 'Kénitra', 'IA': 'Kénitra',
    'J': 'El Jadida', 'JA': 'El Jadida', 'JB': 'El Jadida',
    'K': 'Safi', 'KB': 'Safi',
    'L': 'Settat', 'LA': 'Settat',
    'M': 'Béni Mellal', 'MA': 'Béni Mellal',
    'N': 'Nador', 'NA': 'Nador',
    'PA': 'Tétouan', 'PB': 'Tétouan',
    'Q': 'Taza', 'QA': 'Taza',
    'R': 'Errachidia', 'RA': 'Errachidia',
    'S': 'Khémisset', 'SA': 'Khémisset',
    'T': 'Khouribga', 'TA': 'Khouribga',
    'U': 'Laâyoune', 'UA': 'Laâyoune',
    'V': 'Ouarzazate', 'VA': 'Ouarzazate',
    'W': 'Essaouira', 'WA': 'Essaouira',
    'X': 'Azilal', 'Y': 'Ifrane', 'Z': 'Khénifra',
  };
  return regions[prefix] || 'Maroc';
}
