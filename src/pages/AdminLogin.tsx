import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/admin/dashboard');
      } else {
        setError('Identifiants incorrects');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-8 left-8 p-3 bg-dahak-gray border border-white/10 text-gray-400 hover:text-white hover:border-dahak-red transition-all rounded-full cursor-pointer"
        title="Retour"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="max-w-md w-full bg-dahak-gray border border-white/10 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold mb-2">Administration</h1>
          <p className="text-gray-400 text-sm">Connectez-vous pour gérer DAHAK AUTO</p>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center mb-6 border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nom d'utilisateur</label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:border-dahak-red focus:outline-none transition-colors"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <User className="absolute left-3 top-3 text-gray-500" size={18} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mot de passe</label>
            <div className="relative">
              <input 
                type="password" 
                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:border-dahak-red focus:outline-none transition-colors"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-dahak-red hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Se Connecter
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-600">
          <p>Compte par défaut: admin / admin123</p>
        </div>
      </div>
    </div>
  );
}
