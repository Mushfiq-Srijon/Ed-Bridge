import React from 'react';

export default function PasswordStrengthIndicator({ password }) {
  const getStrength = () => {
    if (!password) return { level: 0, text: '', color: '#ccc' };

    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*]/.test(password)) strength += 1;

    const levels = [
      { level: 0, text: '', color: '#ccc' },
      { level: 1, text: 'Weak', color: '#ff6b6b' },
      { level: 2, text: 'Fair', color: '#ffa94d' },
      { level: 3, text: 'Good', color: '#ffd43b' },
      { level: 4, text: 'Strong', color: '#69db7c' },
      { level: 5, text: 'Very Strong', color: '#51cf66' },
    ];
    return levels[Math.min(strength, 5)];
  };

  const strength = getStrength();
  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="strength-bar">
        <div
          className="strength-fill"
          style={{
            width: `${(strength.level / 5) * 100}%`,
            backgroundColor: strength.color,
          }}
        />
      </div>
      <span className="strength-text" style={{ color: strength.color }}>
        {strength.text}
      </span>
    </div>
  );
}