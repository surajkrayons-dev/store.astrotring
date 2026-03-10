import React from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import {
  TiSocialFacebook,
  TiSocialTwitter,
  TiSocialYoutube,
} from "react-icons/ti";
import { SlSocialInstagram } from "react-icons/sl";
import { FaGooglePlay, FaApple } from "react-icons/fa";
import logo from "../../assets/logo.png";

const Footer = () => {
  const linkClass =
    "flex items-center gap-2 text-sm text-black transition-all duration-300 hover:text-primary hover:translate-x-1";

  return (
    <footer className="bg-[#f7f5f2] border-t border-gray-300 mt-8 pt-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8">
          {/* ABOUT */}
          <div>
            <Link to="/">
              <img src={logo} alt="Astrotring" className="h-10 mb-4" />
            </Link>

            <p className="text-sm text-gray-900 leading-relaxed">
              AstroTring Store offers a curated collection of authentic
              astrology and spiritual products designed to enhance positivity
              and balance in life. Explore a wide range of gemstones, rudraksha,
              healing bracelets, and vastu items carefully selected by experts.
              Each product is believed to support prosperity, protection, and
              spiritual growth. Our goal is to bring the power of ancient Vedic
              traditions into your modern lifestyle. Discover meaningful
              products that help attract success and positive energy every day.
            </p>
          </div>

          {/* RESOURCES */}

          <div>
            <h2 className="text-black border-b-2 border-b-primary inline-block pb-1 font-semibold text-lg">
              Resources
            </h2>

            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/blogs" className={linkClass}>
                  Astrology Blogs
                </Link>
              </li>

              <li>
                <Link to="/zodiac-signs" className={linkClass}>
                  Zodiac Signs
                </Link>
              </li>

              <li>
                <Link to="/numerology" className={linkClass}>
                  Numerology
                </Link>
              </li>

              <li>
                <Link to="/vastu-shastra" className={linkClass}>
                  Vastu Shastra
                </Link>
              </li>

              <li>
                <Link to="/tarot" className={linkClass}>
                  Tarot
                </Link>
              </li>

              <li>
                <Link to="/love-calculator" className={linkClass}>
                  Love Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* CORPORATE */}

          <div>
            <h2 className="text-black border-b-2 border-b-primary inline-block pb-1 font-semibold text-lg">
              Corporate Info
            </h2>

            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/about-us" className={linkClass}>
                  About Us
                </Link>
              </li>

              <li>
                <Link to="/privacy-policy" className={linkClass}>
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link to="/terms-conditions" className={linkClass}>
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link to="/refund-policy" className={linkClass}>
                  Refund & Cancellation
                </Link>
              </li>

              <li>
                <Link to="/pricing-policy" className={linkClass}>
                  Pricing Policy
                </Link>
              </li>

              <li>
                <Link to="/disclaimer" className={linkClass}>
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT */}

          <div>
            <h2 className="text-black border-b-2 border-b-primary inline-block pb-1 font-semibold text-lg">
              Contact us
            </h2>

            <p className="text-sm text-gray-900 leading-relaxed mt-4 space-y-4">
              We are available 24x7 on chat support, click to start chat
            </p>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3 text-sm text-black ">
                <a
                  href="mailto:mail@astrotring.com"
                  className="flex items-center gap-3 text-sm text-black hover:text-primary transition"
                >
                  <Mail className="size-8 border border-gray-900 p-1.5 rounded-full" />
                  <span className="underline hover:bg-black hover:text-white transition px-1 rounded duration-300 hover:translate-x-1">
                    mail@astrotring.com
                  </span>
                </a>
              </div>
            </div>

            {/* SOCIAL */}

            <div className="flex gap-3 mt-3">
              {[
                TiSocialFacebook,
                SlSocialInstagram,
                TiSocialTwitter,
                TiSocialYoutube,
              ].map((Icon, i) => (
                <Link key={i} to="#">
                  <div className="border border-black rounded-full h-10 w-10 grid place-items-center hover:bg-black hover:text-white transition">
                    <Icon className="size-5" />
                  </div>
                </Link>
              ))}
            </div>

            {/* DOWNLOAD APP */}

            <h3 className="mt-6 font-semibold text-black text-lg">
              Download Our App
            </h3>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              {/* GOOGLE PLAY */}

              <a
                href="#"
                target="_blank"
                className="flex items-center justify-center gap-3 bg-black text-white 
                  rounded-lg px-5 py-2.5 
                  hover:bg-gray-800 transition-all duration-300 
                  hover:scale-105 shadow-md"
              >
                <FaGooglePlay size={15} />
                <div className="flex flex-col leading-tight text-left">
                  <span className="text-sm font-semibold">Google Play</span>
                </div>
              </a>

              {/* APP STORE */}

              <a
                href="#"
                target="_blank"
                className="flex items-center justify-center gap-3 bg-black text-white 
                rounded-lg px-5 py-2.5 
                hover:bg-gray-800 transition-all duration-300 
                hover:scale-105 shadow-md"
              >
                <FaApple size={15} />
                <div className="flex flex-col leading-tight text-left">
                  <span className="text-sm font-semibold">App Store</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}

      <div className="bg-black text-white text-center py-5">
        © {new Date().getFullYear()} Astrotring. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
