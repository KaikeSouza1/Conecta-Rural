// Caminho: contexts/CartContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos de dados
interface CartItem {
  id: string;
  nome: string;
  preco: string;
  imagemUrl: string | null;
  quantidade: number;
}

interface CartContextType {
  cartItems: CartItem[];
  // ATUALIZADO: Agora aceita uma quantidade
  addToCart: (item: Omit<CartItem, 'quantidade'>, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('conecta_rural_cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('conecta_rural_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (itemToAdd: Omit<CartItem, 'quantidade'>, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemToAdd.id);

      if (existingItem) {
        // Se o item já existe, SOMA a nova quantidade à existente
        return prevItems.map((item) =>
          item.id === itemToAdd.id
            ? { ...item, quantidade: item.quantidade + quantity }
            : item
        );
      } else {
        // Se é um item novo, adiciona ao carrinho com a quantidade especificada
        return [...prevItems, { ...itemToAdd, quantidade: quantity }];
      }
    });
    alert(`${quantity}x ${itemToAdd.nome} foi/foram adicionado(s) ao carrinho!`);
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

  const clearCart = () => {
    setCartItems([]);
  };

  const itemCount = cartItems.reduce((total, item) => total + item.quantidade, 0);
  const cartTotal = cartItems.reduce((total, item) => total + parseFloat(item.preco) * item.quantidade, 0);

  const value = { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}