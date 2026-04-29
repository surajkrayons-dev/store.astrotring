import React from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { SlSocialInstagram } from "react-icons/sl";
import { FaGooglePlay, FaApple } from "react-icons/fa";
import logo from "../../assets/logo.png";
import { CATEGORIES } from "../../constants/categories";

const Footer = () => {


  // Filter out "all" from categories for collections
  const collectionCategories = CATEGORIES.filter(cat => cat.id !== "all");

  return (
    <footer className="bg-[#f7f5f2] border-t border-gray-300 mt-8 pt-8">
      <div className="container mx-auto px-4 lg:px-8">
        {/* ABOUT */}
        <div className="lg:col-span-1">
          <Link to="/">
            <img src={logo} alt="Astrotring" className="h-10 mb-4" />
          </Link>
          <p className="text-sm text-gray-700 leading-relaxed">
            Astrotring Shop offers a curated collection of authentic
            astrology and spiritual products designed to enhance positivity
            and balance in life. Explore a wide range of gemstones, rudraksha,
            healing bracelets, and vastu items carefully selected by experts.
          </p>
        </div>
        <hr className="text-gray-300 mt-4" />
        <br />
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 pb-8">



          {/* COLLECTIONS - Dynamic from CATEGORIES */}
          <div>
            <h2 className="text-gray-900 border-b-2 border-amber-500 inline-block pb-1 font-semibold text-lg">
              Collections
            </h2>
            <ul className="mt-4 space-y-2">
              {collectionCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/#category-${cat.id}`} // 👈 hash link
                    className="flex items-center gap-2 text-sm text-gray-700 transition-all duration-300 hover:text-amber-600 hover:translate-x-1"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* RESOURCES */}
          <div>
            <h2 className="text-gray-900 border-b-2 border-amber-500 inline-block pb-1 font-semibold text-lg">
              More Info
            </h2>
            <ul className="mt-4 space-y-2">
              <li><Link to="/gemstones" className="flex items-center gap-2 text-sm text-gray-700 transition-all duration-300 hover:text-amber-600 hover:translate-x-1">About Gemstones</Link></li>
              <li><Link to="/" className="flex items-center gap-2 text-sm text-gray-700 transition-all duration-300 hover:text-amber-600 hover:translate-x-1">Zodiac Signs</Link></li>
              <li><Link to="/" className="flex items-center gap-2 text-sm text-gray-700 transition-all duration-300 hover:text-amber-600 hover:translate-x-1">Numerology</Link></li>
              <li><Link to="/" className="flex items-center gap-2 text-sm text-gray-700 transition-all duration-300 hover:text-amber-600 hover:translate-x-1">Vastu Shastra</Link></li>
              <li><Link to="/" className="flex items-center gap-2 text-sm text-gray-700 transition-all duration-300 hover:text-amber-600 hover:translate-x-1">Tarot</Link></li>
              <li><Link to="/" className="flex items-center gap-2 text-sm text-gray-700 transition-all duration-300 hover:text-amber-600 hover:translate-x-1">Love Calculator</Link></li>
            </ul>
          </div>

          {/* Privacy Policy */}
          <div>
            <h2 className="text-gray-900 border-b-2 border-amber-500 inline-block pb-1 font-semibold text-lg">
              Corporate Info
            </h2>
            <ul className="mt-4 space-y-2">
              {/* <li><Link to="/" className="flex items-center gap-2 text-sm text-gray-700 transition-all duration-300 hover:text-amber-600 hover:translate-x-1">About Us</Link></li> */}
              <li><Link to="/privacy-policy" className="flex items-center gap-2 text-sm text-gray-700 transition-all duration-300 hover:text-amber-600 hover:translate-x-1">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" className="flex items-center gap-2 text-sm text-gray-700 transition-all duration-300 hover:text-amber-600 hover:translate-x-1">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="flex items-center gap-2 text-sm text-gray-700 transition-all duration-300 hover:text-amber-600 hover:translate-x-1">Refund & Cancellation</Link></li>
              <li><Link to="/shipping-policy" className="flex items-center gap-2 text-sm text-gray-700 transition-all duration-300 hover:text-amber-600 hover:translate-x-1">
                Shipping Policy</Link></li>
              <li><Link to="/disclaimer" className="flex items-center gap-2 text-sm text-gray-700 transition-all duration-300 hover:text-amber-600 hover:translate-x-1">Disclaimer</Link></li>
            </ul>
          </div>

          {/* CONTACT  */}
          <div>
            <h2 className="text-gray-900 border-b-2 border-amber-500 inline-block pb-1 font-semibold text-lg">
              Contact us
            </h2>

            <p className="text-sm text-gray-700 leading-relaxed mt-4">
              We are available 24x7 on chat support,{' '}
              <a
                href="https://wa.me/919485628238?text=Hi"
                target="_blank"
                rel="noopener noreferrer"
                className="group/link relative inline-block font-normal text-amber-600 hover:text-amber-700 transition-colors duration-300 cursor-pointer"
              >
                click to start chat.
                <span className="absolute bottom-[-2px] left-0 w-full h-[1.5px] bg-amber-500 scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
            </p>

            <div className="mt-4">
              <a
                href="mailto:care@astrotring.com"
                className="flex items-center gap-3 text-sm text-gray-700 hover:text-amber-600 transition group flex-wrap"
              >
                <Mail className="size-8 text-[#EA4335] border border-gray-600 p-1.5 rounded-full group-hover:bg-amber-600 group-hover:border-amber-600 group-hover:text-white transition" />
                <span className="group/link relative inline-block font-normal transition-colors duration-300 cursor-pointer">
                  care@astrotring.com
                  <span className="absolute bottom-[-2px] left-0 w-full h-[1.5px] bg-amber-500 scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left" />

                </span>
              </a>
            </div>

            {/* social icons */}


            <div className="flex gap-2 mt-5">
              {[
                { Icon: FaFacebook, href: "https://facebook.com", textColor: "text-[#1877F2]" },
                { Icon: FaInstagram, href: "https://instagram.com", textColor: "text-[#E4405F]" },
                { Icon: FaTwitter, href: "https://twitter.com", textColor: "text-[#1DA1F2]" },
                { Icon: FaYoutube, href: "https://youtube.com", textColor: "text-[#FF0000]" },
              ].map(({ Icon, href, textColor }, i) => (
                <Link
                  key={i}
                  to="coming-soon"

                  className="border border-gray-600 rounded-full h-8 w-8 grid place-items-center text-gray-700 hover:bg-amber-600 hover:border-amber-600 hover:text-white transition"
                >
                  <Icon className={`size-5 ${textColor}`} />
                </Link>
              ))}
            </div>

          </div>

          {/* APP */}
          <div>
            <h3 className="text-gray-900 border-b-2 border-amber-500 inline-block pb-1 font-semibold text-lg">
              Download Our App
            </h3>
            <div className="flex flex-col gap-3 mt-4">
              {/* Google Play Button */}
              <Link
                to="coming-soon"

                className="flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-md w-fit min-w-[160px]"
              >
                <FaGooglePlay size={20} className="text-white" />
                <div className="flex flex-col leading-tight text-left">
                  <span className="text-[8px] font-light">GET IT ON</span>
                  <span className="text-xs font-semibold">Google Play</span>
                </div>
              </Link>

              {/* App Store Button */}
              <Link
                to="coming-soon"

                className="flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-md w-fit min-w-[160px]"
              >
                <FaApple size={20} className="text-white" />
                <div className="flex flex-col leading-tight text-left">
                  <span className="text-[8px] font-light">Download on the</span>
                  <span className="text-xs font-semibold">App Store</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* DISCLAIMER */}
        {/* <div className="border-t border-gray-300 py-4">
          <p className="text-xs text-gray-500 leading-relaxed text-center md:text-left">
            <span className="font-semibold">Disclaimer:</span> Astrology services on{" "}
            <a href="https://astrotring.com" target="_blank" className="text-amber-600 hover:underline">www.astrotring.com</a>{" "}
            are provided for guidance and knowledge purposes only. Results may vary. Please read our full{" "}
            <Link to="/disclaimer" target="_blank" className="text-amber-600 hover:underline"> Disclaimer</Link>{" "}
            before using the website.
          </p>
        </div> */}
      </div>

      {/* COPYRIGHT */}
      <div className="bg-black text-white text-center py-5">
        © {new Date().getFullYear()} Astrotring. All Rights Reserved.
      </div>


    </footer>
  );
};

export default Footer;