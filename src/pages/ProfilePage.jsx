import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userProfile, userUpdate } from "../redux/slices/userAuthSlice";
import { fetchWallet, fetchSpendHistory } from "../redux/slices/walletSlice";
import Loader from "@/components/common/Loader";
import { toast } from "react-toastify";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaUser,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaWallet,
  FaHistory,
} from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {

  console.log("ProfilePage rendering, user =", useSelector(state => state.userAuth.user));
  // ... rest
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.userAuth);
  const { balance, spendHistory, loading: walletLoading } = useSelector((state) => state.wallet);
  let navigate = useNavigate();

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data (without image)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    username: "",
  });

  // Image handling
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [newImageBase64, setNewImageBase64] = useState(null);

  // Fetch user profile if not already available
  useEffect(() => {
    
    if (!user) {
      dispatch(userProfile());
    }
  }, [dispatch, user]);

  // Fetch wallet data when user is logged in
useEffect(() => {
  console.log("🔄 Checking user for wallet fetch...", user);
  if (user?.id) {
    console.log("✅ User has ID, fetching wallet data");
    dispatch(fetchWallet());
    dispatch(fetchSpendHistory());
  } else {
    console.log("⏳ User not ready yet");
  }
}, [dispatch, user?.id]);

  // Populate form and image when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        username: user.username || "",
      });
      setCurrentImageUrl(user.profile_image || null);
      setNewImageBase64(null);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setNewImageBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      username: user.username || "",
    });
    setNewImageBase64(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      name: formData.name,
      email: formData.email,
    };
    if (formData.mobile) payload.mobile = formData.mobile;
    if (formData.username) payload.username = formData.username;
    if (newImageBase64) payload.profile_image = newImageBase64;

    try {
      await dispatch(userUpdate(payload)).unwrap();
      toast.success("Profile updated successfully");
      setIsEditing(false);
      dispatch(userProfile());
      setNewImageBase64(null);
    } catch (err) {
      toast.error(err || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader data="Loading profile..." />;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!user) return <div className="text-center py-10">No user data found</div>;

  const displayImage = newImageBase64 || currentImageUrl;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-amber-600 px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-white hover:text-amber-200 transition"
              >
                <FaEdit /> Edit Profile
              </button>
            ) : (
              <button
                onClick={handleCancelEdit}
                className="text-white hover:text-amber-200 transition"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Profile Content */}
          <div className="p-6 space-y-6">
            {!isEditing ? (
              // --- Display Mode ---
              <>
                <div className="flex items-center gap-4">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={user.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-amber-500"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                      <FaUserCircle className="w-12 h-12 text-amber-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {user.name}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Member since {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-amber-600" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800">{user.email}</p>
                    </div>
                  </div>
                  {user.mobile && (
                    <div className="flex items-center gap-3">
                      <FaPhoneAlt className="text-amber-600" />
                      <div>
                        <p className="text-sm text-gray-500">Mobile</p>
                        <p className="text-gray-800">{user.mobile}</p>
                      </div>
                    </div>
                  )}
                  {user.username && (
                    <div className="flex items-center gap-3">
                      <FaUser className="text-amber-600" />
                      <div>
                        <p className="text-sm text-gray-500">Username</p>
                        <p className="text-gray-800">{user.username}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Wallet Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3">
                    <FaWallet className="text-amber-600" /> Wallet
                  </h3>
                  {walletLoading ? (
                    <p className="text-gray-500">Loading wallet...</p>
                  ) : (
                    <div className="bg-amber-50 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Available Balance</span>
                        <span className="text-2xl font-bold text-amber-600">
                          ₹{balance?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      {spendHistory && spendHistory.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-amber-200">
                          <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <FaHistory className="text-amber-600" /> Recent Spend Transactions
                          </p>
                          <ul className="mt-2 space-y-1">
                            {spendHistory.slice(0, 5).map((tx, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex justify-between">
                                <span>{tx.description || "Order payment"}</span>
                                <span className="font-medium">-₹{tx.amount}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              // --- Edit Mode (same as before) ---
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt="Profile Preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-amber-500"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center">
                        <FaUserCircle className="w-16 h-16 text-amber-600" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-amber-600 rounded-full p-1 cursor-pointer hover:bg-amber-700">
                      <FaCamera className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Click camera icon to change photo</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? "Saving..." : <><FaSave /> Save Changes</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <div
        onClick={() => navigate('/')}
        className="flex items-center justify-center gap-2 text-amber-600 mt-4 hover:underline mb-6 text-center cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </div>
    </div>
  );
};

export default ProfilePage;