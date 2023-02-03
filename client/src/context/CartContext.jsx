import { createContext } from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export const CartContext = createContext({
  cart: [],
  cartTotal: '',
  checkout: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  increaseQuantity: () => {},
  decreaseQuantity: () => {},
});

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem('cart')) || []
  );
  const [cartTotal, setCartTotal] = useState();

  const checkout = async () => {
    const { data } = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/payment`,
      {
        items: cart,
      }
    );
    if (data.url) {
      window.location.assign(data.url);
    }
  };

  const addToCart = (product, quantity) => {
    // Check if item exist in cart
    const existingItem = cart.find(
      item => item.id === product.id && item.size === product.size
    );
    //Increase quantity of item if ID's match
    const increasedQuantity = cart.map(cartItem =>
      cartItem.id === product.id
        ? {
            ...cartItem,
            quantity: cartItem.quantity + quantity,
          }
        : cartItem
    );

    const changeSize = cart.map(cartItem =>
      cartItem.id === product.id
        ? {
            ...cartItem,
            size: product.size,
          }
        : cartItem
    );

    // If item exist in cart increase quantity by one else add item to cart
    return existingItem
      ? setCart(increasedQuantity)
      : product.size
      ? setCart([...cart, { ...product, quantity: quantity }])
      : setCart([...changeSize, { ...product, quantity: quantity }]);
  };

  const removeFromCart = product => {
    // Remove selected item from cart if ID's and size match
    const newCart = cart.filter(
      item => item.id !== product.id || item.size !== product.size
    );
    setCart(newCart);
  };

  const increaseQuantity = product => {
    // Check if item exist in cart
    const existingItem = cart.find(item => item.id === product.id && item.size);
    //Increase quantity of item if ID's match
    const increasedQuantity = cart.map(cartItem =>
      cartItem.id === product.id && cartItem.size === product.size
        ? {
            ...cartItem,
            quantity: cartItem.quantity + 1,
          }
        : cartItem
    );
    // If item exist in cart increase quantity by one else add item to cart
    return existingItem
      ? setCart(increasedQuantity)
      : setCart([...cart, { ...product, quantity: 1 }]);
  };

  const decreaseQuantity = product => {
    // Check if item exist in cart
    const existingItem = cart.find(
      item => item.id === product.id && item.size === product.size
    );
    // Remove selected item from cart if ID's match
    const removeItem = cart.filter(
      item => item.id !== product.id || item.size !== product.size
    );
    //Decrease quantity of item if ID's match
    const decreasedQuantity = cart.map(cartItem =>
      cartItem.id === product.id && cartItem.size === product.size
        ? {
            ...cartItem,
            quantity: cartItem.quantity - 1,
          }
        : cartItem
    );
    // If the existing items quantity is 1 remove the item else if the item exist decrease quantity else do nothing
    existingItem.quantity === 1
      ? setCart(removeItem)
      : existingItem
      ? setCart(decreasedQuantity)
      : setCart();
  };

  // save cart to local storage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    // Calculate carts total by mutilplying the quantities by the price
    const handleCartTotal = () => {
      const cartTotal = cart
        .reduce((total, i) => total + i.quantity * i.price, 0)
        .toFixed(2);
      return setCartTotal(cartTotal);
    };

    handleCartTotal();
  }, [cart]);

  const value = {
    cart,
    cartTotal,
    checkout,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;