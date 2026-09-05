import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Users,
  CalendarDays,
  Package,
  ChevronRight,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80";

/*
|--------------------------------------------------------------------------
| FRONTEND DESTINATION IMAGES
|--------------------------------------------------------------------------
| Images are controlled from frontend.
| Backend/database image is NOT required.
*/

const destinationImages = {
  hunza:
    "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1400&q=85",

  skardu:
    "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1400&q=85",

  murree:
    "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1400&q=85",

  naran:
    "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&w=1400&q=85",

  swat:
    "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=1400&q=85",

  "neelum valley":
    "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=1400&q=85",

  gilgit:
    "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1400&q=85",

  "fairy meadows":
    "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1400&q=85",

  islamabad:
    "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1400&q=85",

  "kaghan valley":
    "https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&w=1400&q=85",
};

const getDestinationImage = (name) => {
  const key = String(name || "")
    .trim()
    .toLowerCase();

  return destinationImages[key] || FALLBACK_IMAGE;
};

const getPackageImage = (pkg, destinationName) => {
  /*
   * First priority:
   * 1. Frontend destination image
   * 2. Backend package image if available
   * 3. Fallback
   */

  return (
    getDestinationImage(destinationName) ||
    pkg?.image ||
    pkg?.image_url ||
    pkg?.photo ||
    FALLBACK_IMAGE
  );
};

const DestinationExploreScreen = () => {
  const { destination } = useParams();
  const navigate = useNavigate();

  const [destinationData, setDestinationData] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/destinations/name/${encodeURIComponent(
            destination
          )}`
        );

        if (!response.ok) {
          throw new Error("Destination not found");
        }

        const data = await response.json();

        /*
         * Different backend response structures are handled safely.
         */
        const destinationInfo =
          data?.destination ||
          data?.data?.destination ||
          data?.data ||
          data;

        const packageList =
          data?.packages ||
          data?.data?.packages ||
          destinationInfo?.packages ||
          [];

        setDestinationData(destinationInfo);
        setPackages(Array.isArray(packageList) ? packageList : []);
      } catch (err) {
        console.error("Destination fetch error:", err);
        setError("Unable to load destination details.");
      } finally {
        setLoading(false);
      }
    };

    if (destination) {
      fetchDestination();
    }
  }, [destination]);

  /*
   |--------------------------------------------------------------------------
   | Loading
   |--------------------------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading destination...</p>
        </div>
      </div>
    );
  }

  /*
   |--------------------------------------------------------------------------
   | Error
   |--------------------------------------------------------------------------
   */

  if (error || !destinationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5 pb-24">
        <div className="text-center">
          <MapPin className="w-14 h-14 text-gray-300 mx-auto mb-4" />

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Destination Not Found
          </h2>

          <p className="text-gray-500 mb-5">
            We couldn't find this destination.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  /*
   |--------------------------------------------------------------------------
   | Destination information
   |--------------------------------------------------------------------------
   */

  const destinationName =
    destinationData?.name ||
    destinationData?.destination_name ||
    destination ||
    "Destination";

  const heroImage = getDestinationImage(destinationName);

  const description =
    destinationData?.description ||
    destinationData?.about ||
    destinationData?.details ||
    `Explore the beauty of ${destinationName} with our carefully selected travel packages.`;

  /*
   |--------------------------------------------------------------------------
   | Package price helper
   |--------------------------------------------------------------------------
   */

  const getPrice = (pkg) => {
    const price =
      pkg?.price ??
      pkg?.package_price ??
      pkg?.amount ??
      pkg?.starting_price;

    if (price === null || price === undefined || price === "") {
      return "Contact for price";
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return price;
    }

    return `PKR ${numericPrice.toLocaleString()}`;
  };

  /*
   |--------------------------------------------------------------------------
   | Package title helper
   |--------------------------------------------------------------------------
   */

  const getPackageName = (pkg) => {
    return (
      pkg?.name ||
      pkg?.package_name ||
      pkg?.title ||
      "Travel Package"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ================================================================
          HEADER
      ================================================================= */}

      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-green-700 transition font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      {/* ================================================================
          HERO
      ================================================================= */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        <div className="relative h-[300px] sm:h-[380px] lg:h-[430px] rounded-3xl overflow-hidden shadow-xl">
          <img
            src={heroImage}
            alt={destinationName}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />

          {/* Dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

          {/* Hero content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-2 text-white/90 mb-2">
              <MapPin className="w-5 h-5" />
              <span className="text-sm font-medium">
                Pakistan
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              {destinationName}
            </h1>

            <p className="text-white/90 max-w-2xl text-sm sm:text-base leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================
          CONTENT
      ================================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Package heading */}

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-5 h-5 text-green-700" />

              <span className="text-green-700 font-semibold text-sm">
                Travel Packages
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Explore {destinationName}
            </h2>
          </div>

          <span className="hidden sm:block text-sm text-gray-500">
            {packages.length}{" "}
            {packages.length === 1 ? "package" : "packages"}
          </span>
        </div>

        {/* ================================================================
            PACKAGES
        ================================================================= */}

        {packages.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />

            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              No Packages Available
            </h3>

            <p className="text-gray-500 text-sm">
              There are currently no packages available for{" "}
              {destinationName}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {packages.map((pkg, index) => {
              const packageImage = getPackageImage(
                pkg,
                destinationName
              );

              return (
                <div
                  key={pkg?.id || pkg?.package_id || index}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  {/* ======================================================
                      PACKAGE IMAGE
                  ======================================================= */}

                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={packageImage}
                      alt={getPackageName(pkg)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                    {/* Image overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />

                    {/* Destination badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/95 backdrop-blur-sm text-green-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                        {destinationName}
                      </span>
                    </div>
                  </div>

                  {/* ======================================================
                      PACKAGE INFO
                  ======================================================= */}

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                      {getPackageName(pkg)}
                    </h3>

                    {/* Duration */}
                    {pkg?.duration && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                        <Clock className="w-4 h-4 text-green-700" />

                        <span>{pkg.duration}</span>
                      </div>
                    )}

                    {/* Travelers */}
                    {(pkg?.max_travelers ||
                      pkg?.max_people ||
                      pkg?.capacity) && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                        <Users className="w-4 h-4 text-green-700" />

                        <span>
                          Up to{" "}
                          {pkg.max_travelers ||
                            pkg.max_people ||
                            pkg.capacity}{" "}
                          travelers
                        </span>
                      </div>
                    )}

                    {/* Date */}
                    {pkg?.start_date && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                        <CalendarDays className="w-4 h-4 text-green-700" />

                        <span>{pkg.start_date}</span>
                      </div>
                    )}

                    {/* Price + Button */}

                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">
                          Starting from
                        </p>

                        <p className="text-lg font-bold text-green-700">
                          {getPrice(pkg)}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            `/package/${pkg?.id || pkg?.package_id}`
                          )
                        }
                        className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                      >
                        View
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default DestinationExploreScreen;