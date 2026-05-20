import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaUser, FaShoppingCart, FaSignOutAlt, FaUserCircle, FaClipboardList, FaHeart, FaHome } from "react-icons/fa";
import logo from "../../assets/logo.png";
import { logout, userLogout} from "../../redux/slices/userAuthSlice";
import { openCartDrawer, openLoginModal } from "../../redux/slices/uiSlice";
import { toast } from "react-toastify";
import { fetchCart } from "@/redux/slices/cartSlice";
import { MapPin, WalletIcon } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoggedIn } = useSelector((state) => state.userAuth);
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
     dispatch(fetchCart());
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const threshold = 10;
      if (currentScrollY > lastScrollY.current + threshold) {
        setIsNavHidden(true);
      } else if (currentScrollY < lastScrollY.current - threshold) {
        setIsNavHidden(false);
      }
      setScrolled(currentScrollY > 20);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest(".user-menu")) setDropdownOpen(false);
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);



const handleLogout = async () => {
  setDropdownOpen(false);
  try {
    await dispatch(userLogout()).unwrap();
    toast.success("Logged out!!");
  } catch (err) {
    // fallback to local logout if backend fails
    dispatch(logout());
    toast.error("Logged out!!");
  }
  navigate("/");
};

  // Reusable button component for cart and login
  const NavButton = ({ onClick, icon: Icon, label, count = 0 }) => (
    <div className="relative">
      <button
        onClick={onClick}
        className="group relative w-10 sm:w-auto h-10 rounded-full border border-amber-500 bg-[#f7f7f7] overflow-hidden flex items-center justify-center cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300"
      >
        {/* Top cut */}
        <span className="absolute top-[-1px] left-1/2 -translate-x-1/2 w-[52%] h-[6px] bg-[#f7f7f7] transition-all duration-500 group-hover:w-0" />
        {/* Bottom cut */}
        <span className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-[52%] h-[6px] bg-[#f7f7f7] transition-all duration-500 group-hover:w-0" />
        {/* Inner orange capsule */}
        <div className="relative z-10 w-[84%] h-[84%] rounded-full bg-amber-500 flex items-center justify-center gap-1  sm:px-4 transition-all duration-300 group-hover:bg-amber-600">
          <Icon className="text-white text-sm sm:text-base" />
          <span className="hidden sm:inline text-black text-sm font-medium tracking-wide">
            {label}
          </span>
          <span className="hidden sm:inline text-black text-base leading-none">›</span>
        </div>
      </button>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-gradient-to-br from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
          {count}
        </span>
      )}
    </div>
  );

  return (
    <nav
      className={`w-full mb-4 sticky top-0 z-30 bg-white transition-all duration-500 ${
        scrolled ? "shadow-md" : ""
      } ${isNavHidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img src={logo} alt="Logo" className="h-6 sm:h-8" />
        </Link>

        {/* Right side buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart button */}
          <NavButton onClick={() => dispatch(openCartDrawer())} icon={FaShoppingCart} label="CART" count={cartCount} />

          {/* User / Login button */}
          {isLoggedIn ? (
            <div className="relative user-menu ">
              <div className="flex items-center">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="focus:outline-none cursor-pointer"
              >
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user?.name?.charAt(0).toUpperCase()}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-amber-200 object-cover cursor-pointer"
                  />
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-medium text-sm sm:text-lg cursor-pointer">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600">
                      <FaUserCircle size={16} /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600">
                      <FaClipboardList size={16} /> My Orders
                    </Link>
                    <Link to="/wallet" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600">
                      <WalletIcon size={16} /> My Wallet
                    </Link>
                    <Link to="/wishlist" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600">
                      <FaHeart size={16} /> My Wishlist
                    </Link>
                    <Link to="/addresses" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600">
                      <MapPin size={16} /> My Address
                    </Link>
                    <Link to="/" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600">
                      <FaHome size={16} /> Back to Home
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3">
                    <FaSignOutAlt size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavButton onClick={() => dispatch(openLoginModal())} icon={FaUser} label="LOGIN" />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;