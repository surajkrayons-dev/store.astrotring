// components/auth/UserLogin.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactDOM from "react-dom";
import {
  userLogin,
  userProfile,
  userRegister,
} from "../../redux/slices/userAuthSlice";
import { closeLoginModal } from "../../redux/slices/uiSlice"; // 👈 import action
import { toast } from "react-toastify";
import ForgotPassword from "./ForgotPassword";
import { fileToBase64 } from "../../hooks/fileToBase64";
import { Camera, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";

const UserLogin = () => {   // 👈 trigger prop hata diya
  const dispatch = useDispatch();
  const { user, error, loading } = useSelector((state) => state.userAuth);
  const { isLoginModalOpen } = useSelector((state) => state.ui); // 👈 state from Redux
  const [mode, setMode] = useState("login");
  const [userType, setUserType] = useState("user");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    country_code: "+91",
    mobile: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [errors, setErrors] = useState({ fields: {}, form: "" });

  // Reset form when user logs in and close modal
  useEffect(() => {
    if (user) {
      dispatch(closeLoginModal());   // 👈 close modal
      setForm({
        name: "",
        email: "",
        country_code: "",
        mobile: "",
        username: "",
        password: "",
        confirmPassword: "",
      });
      setProfileImage(null);
      setImagePreview("");
    }
  }, [user, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      fields: { ...prev.fields, [name]: undefined },
      form: "",
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setProfileImage(base64);
        setImagePreview(URL.createObjectURL(file));
      } catch (error) {
        toast.error("Failed to process image");
      }
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview("");
    document.getElementById("user-profile-upload").value = "";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setErrors({ fields: {}, form: "Username and password are required" });
      return;
    }
    try {
      await dispatch(userLogin({ username: form.username, password: form.password })).unwrap();
      toast.success("You are logged in");
      await dispatch(userProfile()).unwrap();
      // Modal will close automatically via useEffect
    } catch (err) {
      setErrors({ fields: {}, form: err || "Login failed" });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setErrors({ fields: {}, form: "Passwords do not match" });
      return;
    }
     if (!termsAccepted) {
    setErrors({ fields: {}, form: "You must accept the Terms & Conditions to sign up." });
    return;
  }
    const { confirmPassword, ...submitData } = form;
    submitData.profile_image = profileImage || null;
    submitData.terms_accepted = termsAccepted ? 1 : 0;
    try {
      await dispatch(userRegister(submitData)).unwrap();
      toast.success("Register successful, please login");
      setMode("login");
      setProfileImage(null);
      setImagePreview("");
    } catch (err) {
      setErrors({ fields: {}, form: err || "Registration failed" });
    }
  };

  if (!isLoginModalOpen) return null; // 👈 don't render anything if modal closed

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-[2px] bg-black/20"
        onClick={() => dispatch(closeLoginModal())}
      />
      {/* Modal container */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {mode === "login"
                  ? "Login"
                  : mode === "signup"
                  ? "Create Account"
                  : "Forgot Password"}
              </h2>
              <button
                onClick={() => dispatch(closeLoginModal())}
                className="text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full p-1.5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {(errors.form || error) && (
              <p className="text-red-600 text-sm text-center mb-4">
                {errors.form || error}
              </p>
            )}

            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setUserType("user");
                    }}
                    className="text-sm text-amber-600 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-4 rounded-md hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
                <p className="text-center text-sm">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrors({ fields: {}, form: "" });
                    }}
                    className="text-amber-600 hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </p>
              </form>
            )}

            {mode === "signup" && (
              <form onSubmit={handleSignup} className="space-y-3 mt-10">
                <input
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />
                <input
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />
                <div className="flex gap-2">
                  <input
                    name="country_code"
                    placeholder="+91"
                    value={form.country_code}
                    onChange={handleChange}
                    className="w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                  <input
                    name="mobile"
                    placeholder="Mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <input
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />

                <div className="space-y-1.5">
                  <label className="text-sm flex items-center gap-1.5 text-gray-700">
                    <Camera className="w-3.5 h-3.5" />
                    Profile Photo (Optional)
                  </label>
                  <div
                    onClick={() => document.getElementById("user-profile-upload")?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add("border-yellow-500", "bg-yellow-50");
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("border-yellow-500", "bg-yellow-50");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("border-yellow-500", "bg-yellow-50");
                      const file = e.dataTransfer.files[0];
                      if (file) handleImageChange({ target: { files: [file] } });
                    }}
                    className={`
                      relative border border-dashed rounded-lg p-3
                      transition-all duration-200 cursor-pointer
                      ${
                        imagePreview
                          ? "border-green-300 bg-green-50/30"
                          : "border-gray-300 bg-gray-50 hover:border-yellow-400 hover:bg-yellow-50/30"
                      }
                    `}
                  >
                    <input
                      id="user-profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {imagePreview ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-xs text-gray-600 truncate max-w-[100px]">
                            Photo uploaded
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage();
                          }}
                          className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs">
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 truncate">Click or drag photo</span>
                        <span className="text-gray-400 whitespace-nowrap">(2MB)</span>
                      </div>
                    )}
                  </div>
                </div>

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600">
                    I have read and agree to the{" "}
                    <Link
                      to="/terms-conditions"
                      target="_blank"
                      className="text-amber-600 hover:underline"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy-policy"
                      target="_blank"
                      className="text-amber-600 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-4 rounded-md hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Creating..." : "Sign Up"}
                </button>
                <p className="text-center text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrors({ fields: {}, form: "" });
                    }}
                    className="text-amber-600 hover:underline cursor-pointer"
                  >
                    Login
                  </button>
                </p>
              </form>
            )}

            {mode === "forgot" && (
              <ForgotPassword
                onSuccess={() => setMode("login")}
                onCancel={() => setMode("login")}
                userType={userType}
              />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserLogin;