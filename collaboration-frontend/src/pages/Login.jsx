import React, { useState, useEffect } from 'react';

const API_URL = 'http://127.0.0.1:8000/api';

export default function Login() {
    const [email, setEmail]           = useState('');
    const [password, setPassword]     = useState('');
    const [error, setError]           = useState('');
    const [loading, setLoading]       = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    useEffect(() => {
        document.body.style.background = '#0f172a';
        document.body.style.margin     = '0';
        document.body.style.padding    = '0';
        // إذا كان المستخدم سبق ودخل، نوجهه مباشرة للـ Dashboard
        if (localStorage.getItem('token')) {
            window.location.href = '/dashboard';
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Email ou mot de passe incorrect');

            // حفظ كل المعطيات في الـ LocalStorage بما فيها الـ user_id
            localStorage.setItem('token',     data.token);
            localStorage.setItem('role',      data.user.role);
            localStorage.setItem('user_name', data.user.name);
            localStorage.setItem('user_id',   String(data.user.id));

            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.message || 'Erreur de connexion. Vérifiez vos identifiants.');
        } finally {
            setLoading(false);
        }
    };

    const fillAccount = (acc) => {
        setEmail(acc.email);
        setPassword('password');
        setError('');
    };

    const testAccounts = [
        { role: 'Admin',     icon: '👑', email: 'admin@collaboration.ma',     color: '#ef4444' },
        { role: 'Chef',      icon: '🎯', email: 'chef1@collaboration.ma',      color: '#f59e0b' },
        { role: 'Employé',   icon: '💼', email: 'emp1@collaboration.ma',       color: '#38bdf8' },
        { role: 'Stagiaire', icon: '🎓', email: 'stagiaire@collaboration.ma',  color: '#a855f7' },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                body { font-family: 'Inter', 'Segoe UI', sans-serif !important; }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse-ring {
                    0%   { transform: scale(0.9); opacity: 0.8; }
                    100% { transform: scale(1.4); opacity: 0; }
                }
                .login-card {
                    animation: fadeIn 0.5s ease;
                }
                .test-btn:hover {
                    border-color: #6366f1 !important;
                    background: rgba(99,102,241,0.08) !important;
                    transform: translateY(-1px);
                }
                .submit-btn:hover:not(:disabled) {
                    opacity: 0.9;
                    transform: translateY(-1px);
                    box-shadow: 0 8px 25px rgba(99,102,241,0.5) !important;
                }
                .submit-btn:active:not(:disabled) {
                    transform: translateY(0);
                }
            `}</style>

            <div style={s.page}>
                {/* ذرات الخلفية الزينة */}
                <div style={s.blob1} />
                <div style={s.blob2} />
                <div style={s.blob3} />

                {/* الـ Card الرئيسية */}
                <div style={s.card} className="login-card">

                    {/* ===== HEADER / LOGO ===== */}
                    <div style={s.header}>
                        <div style={s.logoWrap}>
                            <div style={s.logoBg} />
                            <div style={s.logoIcon}>C</div>
                        </div>
                        <h1 style={s.logoText}>Collabify</h1>
                        <p style={s.logoSub}>Connectez-vous pour accéder à votre espace</p>
                    </div>

                    {/* ===== FORM ===== */}
                    <form onSubmit={handleLogin} style={s.form} noValidate>

                        {error && (
                            <div style={s.errorBox}>
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Email */}
                        <div style={s.field}>
                            <label htmlFor="login-email" style={s.label}>Adresse Email</label>
                            <div style={{
                                ...s.inputWrap,
                                borderColor: focusedField === 'email' ? '#6366f1' : '#334155',
                                boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
                            }}>
                                <span style={s.ico}>✉</span>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    autoComplete="email"
                                    placeholder="votre@email.ma"
                                    style={s.input}
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div style={s.field}>
                            <label htmlFor="login-password" style={s.label}>Mot de passe</label>
                            <div style={{
                                ...s.inputWrap,
                                borderColor: focusedField === 'password' ? '#6366f1' : '#334155',
                                boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
                            }}>
                                <span style={s.ico}>🔒</span>
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    style={{ ...s.input, paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    style={s.eyeBtn}
                                    tabIndex={-1}
                                    title={showPassword ? 'Masquer' : 'Afficher'}
                                >
                                    {showPassword ? '🙈' : '👁'}
                                </button>
                            </div>
                        </div>

                        {/* Bouton connexion */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="submit-btn"
                            style={{ ...s.submitBtn, opacity: loading ? 0.75 : 1 }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <span style={s.spinner} />
                                    Connexion en cours...
                                </span>
                            ) : (
                                '→ Se connecter'
                            )}
                        </button>
                    </form>

                    {/* ===== COMPTES TEST ===== */}
                    <div style={s.testSection}>
                        <div style={s.testTitle}>
                            <span style={s.testLine} />
                            <span>Comptes de test</span>
                            <span style={s.testLine} />
                        </div>
                        <div style={s.testGrid}>
                            {testAccounts.map(acc => (
                                <button
                                    key={acc.role}
                                    id={`test-${acc.role.toLowerCase()}`}
                                    type="button"
                                    onClick={() => fillAccount(acc)}
                                    className="test-btn"
                                    style={{
                                        ...s.testBtn,
                                        borderColor: email === acc.email ? acc.color : '#334155',
                                        background: email === acc.email
                                            ? `${acc.color}15`
                                            : 'rgba(15, 23, 42, 0.5)',
                                    }}
                                    title={`Se connecter en tant que ${acc.role}`}
                                >
                                    <span style={{ fontSize: '18px' }}>{acc.icon}</span>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: acc.color, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                            {acc.role}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                                            {acc.email.split('@')[0]}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <p style={s.testPass}>
                            Mot de passe universel :{' '}
                            <code style={{ color: '#a855f7', background: 'rgba(168,85,247,0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                                password
                            </code>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

// ===== STYLES =====
const s = {
    page: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#0f172a',
        fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
        position: 'relative',
        overflow: 'hidden',
        padding: '20px',
    },
    blob1: {
        position: 'fixed', top: '-120px', left: '-120px',
        width: '450px', height: '450px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)',
        pointerEvents: 'none',
    },
    blob2: {
        position: 'fixed', bottom: '-100px', right: '-100px',
        width: '380px', height: '380px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 65%)',
        pointerEvents: 'none',
    },
    blob3: {
        position: 'fixed', top: '50%', right: '8%',
        width: '220px', height: '220px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
    },
    card: {
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '24px',
        padding: '40px 36px 32px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 32px 64px -12px rgba(0,0,0,0.65)',
        position: 'relative',
        zIndex: 1,
    },
    header: {
        textAlign: 'center',
        marginBottom: '32px',
    },
    logoWrap: {
        position: 'relative',
        display: 'inline-block',
        marginBottom: '14px',
    },
    logoBg: {
        position: 'absolute', inset: '-6px',
        borderRadius: '22px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.25))',
        filter: 'blur(8px)',
    },
    logoIcon: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '60px', height: '60px',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        color: '#fff',
        fontSize: '26px',
        fontWeight: '800',
        boxShadow: '0 8px 24px rgba(99,102,241,0.45)',
    },
    logoText: {
        margin: '0 0 6px',
        fontSize: '28px',
        fontWeight: '800',
        color: '#f8fafc',
        letterSpacing: '-0.5px',
    },
    logoSub: {
        margin: 0,
        fontSize: '13px',
        color: '#64748b',
        lineHeight: '1.5',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
    },
    errorBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        color: '#f87171',
        padding: '12px 16px',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '500',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
    },
    label: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#cbd5e1',
    },
    inputWrap: {
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '10px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    ico: {
        position: 'absolute',
        left: '14px',
        fontSize: '15px',
        pointerEvents: 'none',
        userSelect: 'none',
    },
    input: {
        flex: 1,
        padding: '12px 14px 12px 44px',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        background: 'transparent',
        color: '#f8fafc',
        outline: 'none',
        width: '100%',
    },
    eyeBtn: {
        position: 'absolute',
        right: '10px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        padding: '4px 6px',
        color: '#475569',
        display: 'flex',
        alignItems: 'center',
    },
    submitBtn: {
        padding: '13px 20px',
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '700',
        boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
        transition: 'opacity 0.2s, transform 0.15s, box-shadow 0.2s',
        marginTop: '6px',
        letterSpacing: '0.2px',
    },
    spinner: {
        display: 'inline-block',
        width: '15px',
        height: '15px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
        flexShrink: 0,
    },
    testSection: {
        marginTop: '28px',
    },
    testTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '11px',
        fontWeight: '700',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        marginBottom: '12px',
    },
    testLine: {
        flex: 1,
        height: '1px',
        background: '#334155',
    },
    testGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '12px',
    },
    testBtn: {
        padding: '10px 12px',
        border: '1px solid #334155',
        borderRadius: '10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'all 0.2s',
        textAlign: 'left',
    },
    testPass: {
        fontSize: '12px',
        color: '#475569',
        margin: 0,
        textAlign: 'center',
    },
};