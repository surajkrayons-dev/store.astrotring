import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaUser, FaShoppingCart, FaSignOutAlt } from "react-icons/fa";
import logo from "../../assets/logo.png";
import { logout } from "../../redux/slices/userAuthSlice";
import UserLogin from "../auth/UserLogin";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoggedIn } = useSelector((state) => state.userAuth);
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest(".user-menu")) setDropdownOpen(false);
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <nav
      className={`w-full sticky top-0 z-[100] bg-white transition-all ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-6">
        {/* Logo - smaller on mobile */}
        <Link to="/" className="flex-shrink-0">
          <img src={logo} alt="Logo" className="h-8 sm:h-10" />
        </Link>

        {/* Search - hidden on mobile, visible on md+ */}
        <div className="hidden md:block flex-1 max-w-[500px]">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full py-2 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-amber-600 outline-none text-sm"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Cart - responsive padding */}
          <div
            onClick={() => navigate("/cart")}
            className="relative flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-1.5 sm:py-2.5 bg-stone-50/90 backdrop-blur-sm border border-stone-200/50 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-amber-500/30 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FaShoppingCart className="text-amber-600 relative z-10" size={16} />
            <span
              className="font-medium text-stone-700 relative z-10 hidden xs:inline text-sm sm:text-base"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Cart
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                {cartCount}
              </span>
            )}
          </div>

          {/* User section */}
          {isLoggedIn ? (
            <div className="relative user-menu">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="focus:outline-none"
              >
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-amber-200 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm sm:text-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <FaSignOutAlt size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <UserLogin
              trigger={
                <div
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-1.5 sm:py-2.5 bg-stone-50/90 backdrop-blur-sm border border-stone-200/50 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-amber-500/30 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <FaUser className="text-amber-600 relative z-10" size={16} />
                  <span
                    className="font-medium text-stone-700 relative z-10 hidden xs:inline text-sm sm:text-base"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Login
                  </span>
                </div>
              }
            />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;