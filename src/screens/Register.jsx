import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout, { IconField, PasswordField } from '../components/AuthLayout';
import { Alert, Icon } from '../components/ui';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const apiBase = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`);
      const response = await fetch(`${apiBase}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      });
      const data = await response.json();

      if (response.ok) {
        // Registration requires a manual sign-in afterwards.
        navigate('/login');
        return;
      }
      setError(data.error || 'Pendaftaran gagal. Coba lagi.');
    } catch {
      setError('Tidak dapat terhubung ke server. Periksa koneksimu.');
    }
    setLoading(false);
  };

  return (
    <AuthLayout
      title="Buat akun"
      subtitle="Mulai kelola keuangan dengan lebih tenang — gratis."
      footer={<>Sudah punya akun? <Link to="/login" className="font-semibold text-gold hover:underline">Masuk</Link></>}
    >
      <form onSubmit={handleRegister} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <label className="block">
          <span className="label">Nama lengkap</span>
          <IconField icon="person" type="text" required autoComplete="name" placeholder="Nama kamu" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Email</span>
          <IconField icon="mail" type="email" required autoComplete="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Kata sandi</span>
          <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Buat kata sandi" />
        </label>
        <button type="submit" disabled={loading} className="btn-primary !mt-6 w-full py-3.5">
          {loading ? <><Icon name="progress_activity" className="animate-spin" />Memproses…</> : <>Buat akun<Icon name="arrow_forward" className="text-[18px]" /></>}
        </button>
      </form>
    </AuthLayout>
  );
}
