import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    setError('');

    try {
      await signup(formData.name, formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 font-outfit">Create Account</h1>
          <p className="text-white/50">Join thousands of travelers today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            icon={<User size={18} />}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            icon={<Mail size={18} />}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock size={18} />}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock size={18} />}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-4"
            isLoading={loading}
            icon={<UserPlus size={18} />}
          >
            Create Account
          </Button>

          <p className="text-center text-sm text-white/50 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-primary-light transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </Card>
    </motion.div>
  );
};

export default SignupPage;
