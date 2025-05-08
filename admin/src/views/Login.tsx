import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { Dispatch } from '@store/index';
import { selectIsLoading, selectError } from '@store/selectors';
import Loading from '@components/Loading/Loading';
import '@styles/Login.css';

const Login = () => {
  const dispatch = useDispatch<Dispatch>();
  const navigate = useNavigate();

  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [passwordValidation, setPasswordValidation] = useState({
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
    hasMinLength: false
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update password validation when password changes
    if (name === 'password') {
      setPasswordValidation({
        hasLowercase: /[a-z]/.test(value),
        hasUppercase: /[A-Z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        hasSpecial: /[^A-Za-z0-9]/.test(value),
        hasMinLength: value.length >= 8
      });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch.auth.login(credentials);
    if (result) {
      navigate('/');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Sign in to your account</h2>
        <p className="login-subtitle">Enter your email and password to access your account</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={credentials.email}
              onChange={onChange}
              className="form-input"
              placeholder="your.email@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={credentials.password}
              onChange={onChange}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          {credentials.password.length > 0 && (
            <div className="password-requirements">
              <div className="requirement">
                <div className={`requirement-icon ${passwordValidation.hasLowercase ? 'valid' : ''}`}>
                  {passwordValidation.hasLowercase && '✓'}
                </div>
                <span className="requirement-text">one lowercase character</span>
              </div>
              <div className="requirement">
                <div className={`requirement-icon ${passwordValidation.hasUppercase ? 'valid' : ''}`}>
                  {passwordValidation.hasUppercase && '✓'}
                </div>
                <span className="requirement-text">one uppercase character</span>
              </div>
              <div className="requirement">
                <div className={`requirement-icon ${passwordValidation.hasNumber ? 'valid' : ''}`}>
                  {passwordValidation.hasNumber && '✓'}
                </div>
                <span className="requirement-text">one number</span>
              </div>
              <div className="requirement">
                <div className={`requirement-icon ${passwordValidation.hasSpecial ? 'valid' : ''}`}>
                  {passwordValidation.hasSpecial && '✓'}
                </div>
                <span className="requirement-text">one special character</span>
              </div>
              <div className="requirement">
                <div className={`requirement-icon ${passwordValidation.hasMinLength ? 'valid' : ''}`}>
                  {passwordValidation.hasMinLength && '✓'}
                </div>
                <span className="requirement-text">8 character minimum</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            Sign in
          </button>
        </form>

        <Link to="/" className="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" className="back-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default Login;
