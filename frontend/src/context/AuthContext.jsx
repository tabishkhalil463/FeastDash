import { createContext, useContext, useReducer, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    case 'UPDATE_PROFILE':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const savedUser = localStorage.getItem('user');

    if (accessToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({
          type: 'LOGIN',
          payload: {
            user,
            tokens: { access: accessToken, refresh: refreshToken },
          },
        });
      } catch {
        localStorage.clear();
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('auth/login/', { email, password });
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    dispatch({ type: 'LOGIN', payload: data });
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await API.post('auth/register/', formData);
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    dispatch({ type: 'LOGIN', payload: data });
    return data.user;
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await API.post('auth/logout/', { refresh });
      }
    } catch {
      // ignore logout API errors
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (formData) => {
    const { data } = await API.patch('auth/profile/', formData, {
      headers: formData instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : {},
    });
    const updatedUser = {
      id: data.id,
      username: data.username,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      user_type: data.user_type,
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_PROFILE', payload: data });
    return data;
  };

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
