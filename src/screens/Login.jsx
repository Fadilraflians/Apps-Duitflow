import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout, { IconField, PasswordField } from '../components/AuthLayout';
import { Alert, Icon } from '../components/ui';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const apiBase = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`);
      const response = await fetch(`${apiBase}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok) {
        login(data);
        navigate('/home');
        return;
      }
      setError(data.error || 'Email atau kata sandi salah.');
    } catch {
      setError('Tidak dapat terhubung ke server. Periksa koneksimu.');
    }
    setLoading(false);
  };

  return (
    <AuthLayout
      title="Selamat datang"
      subtitle="Masuk untuk melanjutkan mengelola keuanganmu."
      footer={<>Belum punya akun? <Link to="/register" className="font-semibold text-gold hover:underline">Daftar gratis</Link></>}
    >
      <form onSubmit={handleLogin} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <label className="block">
          <span className="label">Email</span>
          <IconField icon="mail" type="email" required autoComplete="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Kata sandi</span>
          <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit" disabled={loading} className="btn-primary !mt-6 w-full py-3.5">
          {loading ? <><Icon name="progress_activity" className="animate-spin" />Memproses…</> : <>Masuk<Icon name="arrow_forward" className="text-[18px]" /></>}
        </button>
      </form>
    </AuthLayout>
  );
}
