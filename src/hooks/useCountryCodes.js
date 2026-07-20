import { useState, useEffect, useCallback } from 'react';
import { COUNTRY_CODES } from '@/constants/countryCodes';

/**
 * Custom hook to fetch country codes.
 * Currently uses static data, but can be easily switched to an API.
 */
export const useCountryCodes = () => {
  const [countryCodes, setCountryCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate fetching (or actually fetch from API)
  const fetchCountryCodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate network delay (optional – remove for instant)
      // await new Promise((resolve) => setTimeout(resolve, 300));
      // Use static data
      setCountryCodes(COUNTRY_CODES);
    } catch (err) {
      setError(err.message || 'Failed to load country codes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchCountryCodes();
  }, [fetchCountryCodes]);

  // Refetch function (if needed)
  const refetch = useCallback(() => {
    fetchCountryCodes();
  }, [fetchCountryCodes]);

  return { countryCodes, loading, error, refetch };
};















// // hooks/useCountryCodes.js
// import { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';

// export const useCountryCodes = () => {
//   const [countryCodes, setCountryCodes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchCountryCodes = async () => {
//       try {
//         const response = await fetch(
//           "https://restcountries.com/v3.1/all?fields=name,idd,cca2"
//         );
//         const data = await response.json();

//         const codes = data
//           .filter((country) => country.idd?.root && country.idd?.suffixes)
//           .map((country) => {
//             const root = country.idd.root;
//             const suffixes = country.idd.suffixes;

//             // If suffix is empty (e.g., Canada)
//             if (suffixes.length === 1 && suffixes[0] === "") {
//               return {
//                 value: root,
//                 label: `${root} (${country.cca2})`,
//                 country: country.cca2,
//                 code: country.cca2,
//               };
//             }

//             // Take only the first suffix – you may want to handle multiple suffixes differently
//             return {
//               value: `${root}${suffixes[0]}`,
//               label: `${root}${suffixes[0]} (${country.cca2})`,
//               country: country.cca2,
//               code: country.cca2,
//             };
//           })
//           .sort((a, b) => a.country.localeCompare(b.country));

//         // Remove duplicates by value
//         const uniqueCodes = codes.filter(
//           (code, index, self) =>
//             index === self.findIndex((c) => c.value === code.value)
//         );

//         setCountryCodes(uniqueCodes);
//       } catch (err) {
//         console.error("Error fetching country codes:", err);
//         setError("Failed to load country codes");
//         toast.error("Failed to load country codes");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCountryCodes();
//   }, []);

//   return { countryCodes, loading, error };
// };