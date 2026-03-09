import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Mail, Phone } from "lucide-react";
import { TiSocialFacebook, TiSocialTwitter, TiSocialYoutube } from "react-icons/ti";
import { SlSocialInstagram } from "react-icons/sl";
import logo from "../../assets/logo.png";
import { api } from "../../redux/baseApi";

const Footer = () => {
  const [horoscope, setHoroscope] = useState([]);
  const [horosType, setHorosType] = useState([]);

  useEffect(() => {
    const fetchHoroscopes = async () => {
      try {
        const res = await api.get("/horoscopes");
        setHoroscope(res.data.data);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchHoroscopes();
  }, []);

  useEffect(() => {
    if (horoscope?.length > 0) {
      try {
        const horosSet = new Set();
        const horos = [];
        horoscope.forEach((ele) => {
          if (ele.type && !horosSet.has(ele.type)) {
            horosSet.add(ele.type);
            horos.push({
              label: ele.type.charAt(0).toUpperCase() + ele.type.slice(1) + " Horoscope",
              path: `/horoscopes/${ele.type.toLowerCase()}`,
            });
          }
        });
        setHorosType(horos);
      } catch (error) {
        console.log(error.message);
      }
    }
  }, [horoscope]);

  return (
    <footer className="bg-[#f7f5f2] border-t border-gray-300 mt-10 pt-10 pb-0">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Logo & About */}
        <div className="border-b border-gray-500 pb-4 mb-4">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-10 mb-5" />
          </Link>
          <div className="space-y-2">
            <h2 className="text-gray-700 border-b-2 border-b-primary/80 inline-block pb-1 font-semibold text-lg">
              About Astrotring
            </h2>
            <p className="text-gray-500 text-sm!">
              AstroTring is your ultimate destination for accurate Vedic astrology predictions, offering personalized Kundli analysis, horoscope matching, and real-time guidance on love, marriage, career, health, and finance. Powered by AI-driven insights and expert astrologers, we decode your birth chart to reveal your cosmic blueprint and life's true purpose. From live call and chat consultations to detailed astrology reports, AstroTring makes ancient Vedic wisdom accessible anytime, anywhere. Our verified astrologers provide authentic remedies, compatibility readings, and date-of-birth predictions to help you make confident, well-guided life decisions. Rooted in tradition and driven by technology, AstroTring bridges the timeless wisdom of the cosmos with the clarity you need to navigate modern life.
            </p>
          </div>
        </div>

        {/* Main Footer Links - Responsive Grid */}
        {/* ✅ FIXED: Changed lg:grid-cols-4 → lg:grid-cols-3 because first column is commented */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {/* Column 1: Horoscopes & Muhurat (COMMENTED - KEEP AS IS) */}
          {/* ... */}

          {/* Column 2: Important Links (first set) */}
          <div className="space-y-5">
            <div>
              <h2 className="text-black border-b-2 border-b-primary/80 inline-block pb-1 font-semibold text-lg">
                Important Links
              </h2>
              <ul className="mt-3 space-y-2">
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Astromall</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Astrotalk Store</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Today Panchang</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Live Astrologers</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">How to read kundali</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Free Kundli</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Kundli Matching</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Chat with Astrologer</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Talk to Astrologer</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Astrotalk Reviews</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Astrology Yoga</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Kaalsarp Doshas</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Child Astrology</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Ascendant Sign Gemstone</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Nakshatras Constellations</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Numerology</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Mantras</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Astrological remedies for job promotion</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: More Links & Shop Products */}
          <div className="space-y-8">
            <div>
              <h2 className="text-black border-b-2 border-b-primary/80 inline-block pb-1 font-semibold text-lg">
                Resources
              </h2>
              <ul className="mt-3 space-y-2">
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Collaboration</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Tarot</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Zodiac Signs</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Vastu Shastra</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Love Calculator</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Guru Purnima 2025</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Astrotalk Sitemap</Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-black border-b-2 border-b-primary/80 inline-block pb-1 font-semibold text-lg">
                Shop our products
              </h2>
              <ul className="mt-3 space-y-2">
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Evil Eye</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Rudraksha</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Karungali</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Buy Gemstones</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Pyrite</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Selenite</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Rudraksha Bracelet For Men</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Rudraksha Bracelet For Women</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Murtis and Idols</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Raw Pyrite Stone</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Money Magnet Bracelet</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Joint Pain Oil</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 4: Astrologer, Corporate, Contact */}
          <div className="space-y-8">
            {/* <div>
              <h2 className="text-black border-b-2 border-b-primary/80 inline-block pb-1 font-semibold text-lg">
                Astrologer
              </h2>
              <ul className="mt-3 space-y-2">
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="/astro-login">Astrologer Login</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="/astro-register">Astrologer Registration</Link>
                </li>
              </ul>
            </div> */}

            <div>
              <h2 className="text-black border-b-2 border-b-primary/80 inline-block pb-1 font-semibold text-lg">
                Corporate Info
              </h2>
              <ul className="mt-3 space-y-2">
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Refund & Cancellation Policy</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Terms & Conditions</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Privacy Policy</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Disclaimer</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">About Us</Link>
                </li>
                <li className="text-sm text-black transition-all duration-300 hover:translate-x-2">
                  <Link to="">Pricing Policy</Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-black border-b-2 border-b-primary/80 inline-block pb-1 font-semibold text-lg">
                Contact us
              </h2>
              <ul className="mt-3 space-y-3">
                <li className="text-sm text-black flex gap-3 items-start">
                  <MapPin className="border-2 border-secondary shrink-0 size-9 p-1.5 rounded-full" />
                  <p>711, Plot A09, ITL Towers, Netaji Subhash Place, Pitampura, Delhi 110034</p>
                </li>
                <li className="text-sm text-black flex gap-3 items-center">
                  <Mail className="border-2 border-secondary shrink-0 size-9 p-1.5 rounded-full" />
                  <p>reachus@krayons.co.in</p>
                </li>
                <li className="text-sm text-black flex gap-3 items-center">
                  <Phone className="border-2 border-secondary shrink-0 size-9 p-1.5 rounded-full" />
                  <p>+91 23465 12356</p>
                </li>
              </ul>
              <h2 className="mt-6 text-black border-b-2 border-b-primary/80 inline-block pb-1 font-semibold text-lg">
                Social Links
              </h2>
              <div className="flex gap-3 mt-4">
                {[TiSocialFacebook, SlSocialInstagram, TiSocialTwitter, TiSocialYoutube].map((Icon, i) => (
                  <Link key={i} to="#">
                    <div className="border border-black rounded-full h-10 w-10 grid place-items-center hover:bg-black hover:text-white transition">
                      <Icon className="size-5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-black text-white text-center py-5 mt-5">
        {new Date().getFullYear()} Astrotring. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;