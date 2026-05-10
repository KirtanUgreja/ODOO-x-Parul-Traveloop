import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 font-outfit">Welcome Back</h1>
          <p className="text-white/50">Enter your credentials to access your trips</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            icon={<Mail size={18} />}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={18} />}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <div className="flex justify-end">
              <button type="button" className="text-xs text-primary hover:text-primary-light transition-colors">
                Forgot password?
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
            icon={<LogIn size={18} />}
          >
            Sign In
          </Button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1e293b] px-2 text-white/40">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            icon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />}
          >
            Google
          </Button>

          <p className="text-center text-sm text-white/50 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:text-primary-light transition-colors">
              Create one now
            </Link>
          </p>
        </form>
      </Card>
    </motion.div>
  );
};

export default LoginPage;
