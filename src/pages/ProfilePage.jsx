import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../redux/slices/userAuthSlice";
import Loader from "@/components/common/Loader";
import { FaUserCircle, FaEnvelope, FaPhoneAlt, FaUser } from "react-icons/fa";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.userAuth);

  useEffect(() => {
    if (!user) {
      dispatch(userProfile());
    }
  }, [dispatch, user]);

  if (loading) return <Loader data="Loading profile..." />;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!user) return <div className="text-center py-10">No user data found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-amber-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
          </div>

          {/* Profile Content */}
          <div className="p-6 space-y-6">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4">
              {user.profile_image ? (
                <img
                  src={user.profile_image}
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
                <p className="text-gray-500 text-sm">Member since {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Details Grid */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;