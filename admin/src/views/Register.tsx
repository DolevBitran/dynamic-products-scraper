import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { Dispatch } from '@store/index';
import { selectIsLoading, selectError } from '@store/selectors';
import Button from '@components/Button/Button';
import Input from '@components/Input/Input';
import Label from '@components/Label/Label';
import Loading from '@components/Loading/Loading';

const Register = () => {
  const dispatch = useDispatch<Dispatch>();
  const navigate = useNavigate();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  
  const [credentials, setCredentials] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error when user types
    if (validationError) {
      setValidationError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (credentials.password !== credentials.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    const result = await dispatch.auth.register(credentials);
    if (result) {
      navigate('/');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
        </div>
        
        {(error || validationError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || validationError}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={credentials.name}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={credentials.email}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={credentials.password}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={credentials.confirmPassword}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-primary text-white"
              disabled={isLoading}
            >
              Register
            </Button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
