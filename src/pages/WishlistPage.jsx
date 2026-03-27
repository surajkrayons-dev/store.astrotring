import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromWishlist, fetchWishlist } from '../redux/slices/wishlistSlice';
import { toast } from 'react-toastify';
import { FaHeart, FaTrash } from 'react-icons/fa';
import Loader from '@/components/common/Loader';
import StarRating from '@/components/common/StarRating';

const WishlistCard = ({ product, onRemove }) => {
  const afterPrice = Number(product?.after_price) || 0;
  const beforePrice = Number(product?.before_price) || 0;
  const ratingValue = Number(product?.rating_avg) || 0;
  const imageUrl = product?.image || product?.images?.[0]?.image || '';

  const discountPercent = beforePrice > afterPrice && afterPrice > 0
    ? Math.round(((beforePrice - afterPrice) / beforePrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 transition-all duration-250 flex flex-col hover:shadow-xl hover:-translate-y-0.5 shadow-md w-full">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative bg-stone-50 overflow-hidden aspect-square">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-350 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50' y='115' font-family='Arial' font-size='16' fill='%23999'%3ENo image%3C/text%3E%3C/svg%3E";
            }}
          />
          {discountPercent > 0 && (
            <div className="absolute top-2 right-2">
              <span className="bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold rounded-md shadow-md text-[10px] px-2 py-0.5">
                {discountPercent}% OFF
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-xs sm:text-sm font-bold text-stone-800 leading-snug line-clamp-2 mb-1.5">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mb-1">
            <StarRating value={ratingValue} size={12} />
            <span className="text-[10px] sm:text-xs text-stone-500 font-semibold">
              {ratingValue.toFixed(1)}
            </span>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <div>
              <div className="text-base sm:text-lg font-extrabold text-stone-900">
                ₹{afterPrice.toLocaleString()}
              </div>
              {beforePrice > afterPrice && (
                <div className="text-[10px] sm:text-xs text-stone-400 line-through">
                  ₹{beforePrice.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <button
          onClick={() => onRemove(product.id, product.name)}
          className="w-full flex items-center justify-center gap-2 text-red-600 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition cursor-pointer"
        >
          <FaTrash size={14} /> Remove
        </button>
      </div>
    </div>
  );
};

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { items: wishlistItems, loading, error } = useSelector((state) => state.wishlist);
  const { isLoggedIn } = useSelector((state) => state.userAuth);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRemove = async (productId, productName) => {
    try {
      await dispatch(removeFromWishlist({ product_id: productId })).unwrap();
      toast.warn(`${productName} removed from wishlist`);
    } catch (err) {
      toast.error(err || 'Failed to remove from wishlist');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <FaHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800">Please log in</h2>
          <p className="text-gray-500 mt-2">Log in to view your wishlist.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader data="Loading wishlist..." />;
  }

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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {wishlistItems.map((product) => (
            <WishlistCard
              key={product.id}
              product={product}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;