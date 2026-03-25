import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userProfile, userUpdate } from "../redux/slices/userAuthSlice";
import Loader from "@/components/common/Loader";
import { toast } from "react-toastify";
import { FaUserCircle, FaEnvelope, FaPhoneAlt, FaUser, FaEdit, FaSave, FaTimes, FaCamera } from "react-icons/fa";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.userAuth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    username: '',
    profile_image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(userProfile());
    } else {
      // Populate form when user data is available
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        username: user.username || '',
        profile_image: null,
      });
      setImagePreview(user.profile_image || null);
    }
  }, [dispatch, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      setFormData(prev => ({ ...prev, profile_image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    if (formData.mobile) formDataToSend.append('mobile', formData.mobile);
    if (formData.username) formDataToSend.append('username', formData.username);
    if (formData.profile_image) formDataToSend.append('profile_image', formData.profile_image);

    try {
      await dispatch(userUpdate(formDataToSend)).unwrap();
      toast.success('Profile updated successfully');
      setIsEditing(false);
      // Refetch user profile to get updated data
      dispatch(userProfile());
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader data="Loading profile..." />;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!user) return <div className="text-center py-10">No user data found</div>;

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
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-white hover:text-amber-200 transition"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>

          {/* Profile Content */}
          <div className="p-6 space-y-6">
            {!isEditing ? (
              // Display Mode
              <>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={user.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-amber-500"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                      <FaUserCircle className="w-12 h-12 text-amber-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
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
              </>
            ) : (
              // Edit Mode
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Profile Picture */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
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

                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? 'Saving...' : <><FaSave /> Save Changes</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;