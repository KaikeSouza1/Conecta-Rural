// Caminho: contexts/CartContext.tsx
'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem { id: string; nome: string; preco: string; imagemUrl: string | null; quantidade: number; }
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantidade'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void; // NOVO
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('conecta_rural_cart');
    if (storedCart) setCartItems(JSON.parse(storedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('conecta_rural_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (itemToAdd: Omit<CartItem, 'quantidade'>) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemToAdd.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === itemToAdd.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      } else {
        return [...prevItems, { ...itemToAdd, quantidade: 1 }];
      }
    });
    alert(`${itemToAdd.nome} foi adicionado ao carrinho!`);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantidade: quantity } : item
      )
    );
  };

  const clearCart = () => { // NOVO
    setCartItems([]);
  };

  const itemCount = cartItems.reduce((total, item) => total + item.quantidade, 0);
  const cartTotal = cartItems.reduce((total, item) => total + parseFloat(item.preco) * item.quantidade, 0);

  const value = { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart deve ser usado dentro de um CartProvider');
  return context;
}