import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';

const CartContext = createContext();

const initialState = {
  id: null,
  restaurant: null,
  items: [],
  totalAmount: '0',
  itemsCount: 0,
  loading: false,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        id: action.payload.id,
        restaurant: action.payload.restaurant,
        items: action.payload.items || [],
        totalAmount: action.payload.total_amount || '0',
        itemsCount: action.payload.items_count || 0,
        loading: false,
      };
    case 'CLEAR':
      return { ...initialState };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await API.get('cart/');
      dispatch({ type: 'SET_CART', payload: data });
    } catch {
      // silent
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (menuItemId, quantity = 1, specialInstructions = '') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await API.post('cart/add/', {
        menu_item_id: menuItemId,
        quantity,
        special_instructions: specialInstructions,
      });
      dispatch({ type: 'SET_CART', payload: data });
      toast.success('Added to cart');
      return { success: true };
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      if (err.response?.data?.conflict) {
        return {
          success: false,
          conflict: true,
          currentRestaurant: err.response.data.current_restaurant,
        };
      }
      toast.error(err.response?.data?.error || 'Failed to add to cart');
      return { success: false };
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const { data } = await API.patch(`cart/item/${cartItemId}/update/`, { quantity });
      dispatch({ type: 'SET_CART', payload: data });
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const { data } = await API.delete(`cart/item/${cartItemId}/remove/`);
      dispatch({ type: 'SET_CART', payload: data });
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await API.delete('cart/');
      dispatch({ type: 'CLEAR' });
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  const getCartTotal = () => {
    const subtotal = Number(state.totalAmount) || 0;
    const deliveryFee = Number(state.restaurant?.delivery_fee) || 0;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    return {
      subtotal,
      deliveryFee,
      tax,
      grandTotal: subtotal + deliveryFee + tax,
    };
  };

  return (
    <CartContext.Provider
      value={{ ...state, addToCart, updateQuantity, removeItem, clearCart, getCartTotal, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
