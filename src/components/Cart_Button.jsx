import React, { useMemo } from "react";
import { BsCart2 } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useCart } from "../context/cart/cart_context";

const Cart_Button = () => {
  const { cartItems } = useCart();

  // Calculate the number of unique items in the cart
  const cartItemCount = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);

  return (
    <>
      <div className="flex space-x-8 md:space-x-8">
        <Link
          title="Cart"
          to="/cart"
          className="relative flex flex-row items-center justify-center"
        >
          <BsCart2 className="relative ml-1 h-6 w-6" />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-4 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white shadow-md">
              {cartItemCount}
            </span>
          )}
        </Link>
      </div>
    </>
  );
};

export default Cart_Button;
