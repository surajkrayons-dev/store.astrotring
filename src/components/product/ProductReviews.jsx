
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductReviews, submitReview, clearReviewError } from '../../redux/slices/reviewSlice';
import StarRating from '../common/StarRating';
import { toast } from 'react-toastify';
import { Star, User, Calendar } from 'lucide-react';

const ProductReviews = ({ productId }) => {
  const dispatch = useDispatch();
  const { reviews, loading, error, submitLoading, submitError } = useSelector((state) => state.review);
  const { isLoggedIn, user } = useSelector((state) => state.userAuth);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    dispatch(fetchProductReviews(productId));
  }, [dispatch, productId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearReviewError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (submitError) {
      toast.error(submitError);
      dispatch(clearReviewError());
    }
  }, [submitError, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a review');
      return;
    }
    try {
      await dispatch(submitReview({ product_id: productId, rating, comment })).unwrap();
      toast.success('Review submitted!');
      setRating(0);
      setComment('');
    } catch (err) {
      // already handled via submitError effect
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>

      {/* Review Form (only for logged-in users) */}
      {isLoggedIn && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
              <textarea
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {submitLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Existing Reviews */}
      {loading ? (
        <div className="text-center py-8">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to review!</div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="font-medium text-gray-800">{review.user_name || 'Anonymous'}</span>
                </div>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {formatDate(review.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-1 mb-2">
                <StarRating value={review.rating} size={16} />
                <span className="text-sm text-gray-600 ml-1">{review.rating}/5</span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;