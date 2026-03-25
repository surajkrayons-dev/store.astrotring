import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromWishlist } from '../redux/slices/wishlistSlice';
import { toast } from 'react-toastify';
import { FaHeart, FaTrash } from 'react-icons/fa';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const handleRemove = (id, name) => {
    dispatch(removeFromWishlist(id));
    toast.info(`${name} removed from wishlist`);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <FaHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800">Your wishlist is empty</h2>
          <p className="text-gray-500 mt-2">Start adding products you love!</p>
          <Link to="/" className="inline-block mt-4 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <Link to={`/product/${product.id}`} className="block">
                <img
                  src={product.image || product.images?.[0]?.image || ''}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 truncate">{product.name}</h3>
                  <p className="text-amber-600 font-bold mt-1">₹{product.after_price || product.price}</p>
                </div>
              </Link>
              <div className="px-4 pb-4">
                <button
                  onClick={() => handleRemove(product.id, product.name)}
                  className="w-full flex items-center justify-center gap-2 text-red-600 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition"
                >
                  <FaTrash size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;