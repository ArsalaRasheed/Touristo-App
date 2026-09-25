import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CreateEditPackageScreen = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    price: '',
    duration_days: '',
    group_size: '',
    itinerary: '',
    inclusions: '',
    exclusions: ''
  });

  const [loading, setLoading] = useState(false);
  const [loadingPackage, setLoadingPackage] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { user, getAuthHeader } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | Detect edit mode from URL
  |--------------------------------------------------------------------------
  |
  | Create:
  | /host/create-package
  |
  | Edit:
  | /host/create-package?edit=123
  |
  */

  const editId =
    new URLSearchParams(window.location.search).get('edit');

  const isEditMode = Boolean(editId);

  /*
  |--------------------------------------------------------------------------
  | Load existing package when editing
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!editId) {
      return;
    }

    const loadPackage = async () => {
      try {
        setLoadingPackage(true);
        setError('');

        const response = await fetch(
          `/api/packages/${editId}`,
          {
            headers: getAuthHeader()
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
            'Failed to load package'
          );
        }

        const pkg =
          result.data?.package;

        if (!pkg) {
          throw new Error(
            'Package not found'
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Convert itinerary JSON back to textarea text
        |--------------------------------------------------------------------------
        */

        let itineraryText = '';

        if (Array.isArray(pkg.itinerary)) {
          itineraryText = pkg.itinerary
            .map((day) => {
              if (
                day &&
                typeof day === 'object'
              ) {
                const dayNumber =
                  day.day !== undefined
                    ? `Day ${day.day}`
                    : 'Day';

                const title =
                  day.title &&
                  !day.title
                    .toLowerCase()
                    .startsWith(
                      `day ${day.day}`
                    )
                    ? `: ${day.title}`
                    : '';

                const description =
                  day.description
                    ? `\n${day.description}`
                    : '';

                return `${dayNumber}${title}${description}`;
              }

              return String(day);
            })
            .join('\n\n');
        } else if (
          typeof pkg.itinerary === 'string'
        ) {
          itineraryText =
            pkg.itinerary;
        }

        /*
        |--------------------------------------------------------------------------
        | Convert inclusions/exclusions to textarea
        |--------------------------------------------------------------------------
        */

        const inclusionsText =
          Array.isArray(pkg.inclusions)
            ? pkg.inclusions.join('\n')
            : pkg.inclusions || '';

        const exclusionsText =
          Array.isArray(pkg.exclusions)
            ? pkg.exclusions.join('\n')
            : pkg.exclusions || '';

        setFormData({
          title:
            pkg.title || '',

          description:
            pkg.description || '',

          destination:
            pkg.destination || '',

          price:
            pkg.price ?? '',

          duration_days:
            pkg.duration_days ?? '',

          group_size:
            pkg.group_size || '',

          itinerary:
            itineraryText,

          inclusions:
            inclusionsText,

          exclusions:
            exclusionsText
        });

      } catch (err) {
        console.error(
          'Error loading package:',
          err
        );

        setError(
          err.message ||
          'Failed to load package'
        );
      } finally {
        setLoadingPackage(false);
      }
    };

    loadPackage();
  }, [editId, getAuthHeader]);

  /*
  |--------------------------------------------------------------------------
  | Handle input changes
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {
    const {
      name,
      value
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setError('');
  };

  /*
  |--------------------------------------------------------------------------
  | Submit Create / Update
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.destination.trim() ||
      !formData.price ||
      !formData.duration_days ||
      !formData.group_size.trim() ||
      !formData.itinerary.trim()
    ) {
      setError(
        'Please fill in all required fields: Title, Description, Destination, Price, Duration, Group Size, and Itinerary.'
      );

      setLoading(false);
      return;
    }

    try {
      /*
      |--------------------------------------------------------------------------
      | Get host/company ID
      |--------------------------------------------------------------------------
      */

      const hostResponse =
        await fetch(
          `/api/hosts/user/${user.id}`,
          {
            headers:
              getAuthHeader()
          }
        );

      if (!hostResponse.ok) {
        throw new Error(
          'Could not load your company profile'
        );
      }

      const hostData =
        await hostResponse.json();

      const hostId =
        hostData.data?.host?.id;

      if (!hostId) {
        throw new Error(
          'No company profile is linked to this account'
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Prepare package data
      |--------------------------------------------------------------------------
      */

      const packageData = {
        host_id: hostId,

        title:
          formData.title.trim(),

        description:
          formData.description.trim(),

        destination:
          formData.destination.trim(),

        price:
          parseFloat(formData.price),

        duration_days:
          parseInt(
            formData.duration_days,
            10
          ),

        group_size:
          formData.group_size.trim(),

        inclusions:
          formData.inclusions
            ? formData.inclusions
                .split('\n')
                .map(item =>
                  item.trim()
                )
                .filter(Boolean)
            : [],

        exclusions:
          formData.exclusions
            ? formData.exclusions
                .split('\n')
                .map(item =>
                  item.trim()
                )
                .filter(Boolean)
            : [],

        itinerary:
          formData.itinerary
      };

      /*
      |--------------------------------------------------------------------------
      | Create or Update
      |--------------------------------------------------------------------------
      */

      const endpoint =
        isEditMode
          ? `/api/packages/${editId}`
          : '/api/packages';

      const method =
        isEditMode
          ? 'PUT'
          : 'POST';

      const response =
        await fetch(
          endpoint,
          {
            method,
            headers: {
              'Content-Type':
                'application/json',
              ...getAuthHeader()
            },
            body:
              JSON.stringify(
                packageData
              )
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
          (
            isEditMode
              ? 'Failed to update package'
              : 'Failed to create package'
          )
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Return to host dashboard
      |--------------------------------------------------------------------------
      */

      navigate(
        '/host-dashboard'
      );

    } catch (err) {
      console.error(
        'Error saving package:',
        err
      );

      setError(
        err.message ||
        'An error occurred while saving the package'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading existing package
  |--------------------------------------------------------------------------
  */

  if (loadingPackage) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--accent-primary)] mx-auto"></div>

          <p className="mt-4 text-[color:var(--text-secondary)]">
            Loading package...
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Screen
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] p-4">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-2xl font-bold mb-6 text-[color:var(--text-primary)]">
          {isEditMode
            ? 'Manage Package'
            : 'Create New Package'}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* ==================================================
              BASIC INFORMATION
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label
                htmlFor="title"
                className="block text-[color:var(--text-secondary)] mb-1"
              >
                Package Title *
              </label>

              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="e.g., Hunza Valley Adventure"
              />
            </div>

            <div>
              <label
                htmlFor="destination"
                className="block text-[color:var(--text-secondary)] mb-1"
              >
                Destination *
              </label>

              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="e.g., Hunza, Gilgit-Baltistan"
              />
            </div>

          </div>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <div>

            <label
              htmlFor="description"
              className="block text-[color:var(--text-secondary)] mb-1"
            >
              Description *
            </label>

            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
              placeholder="Describe your package..."
            ></textarea>

          </div>

          {/* ==================================================
              PACKAGE DETAILS
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            <div>
              <label
                htmlFor="price"
                className="block text-[color:var(--text-secondary)] mb-1"
              >
                Price (PKR) *
              </label>

              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="e.g., 50000"
              />
            </div>

            <div>
              <label
                htmlFor="duration_days"
                className="block text-[color:var(--text-secondary)] mb-1"
              >
                Duration (Days) *
              </label>

              <input
                type="number"
                id="duration_days"
                name="duration_days"
                value={formData.duration_days}
                onChange={handleChange}
                required
                min="1"
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="e.g., 5"
              />
            </div>

            <div>
              <label
                htmlFor="group_size"
                className="block text-[color:var(--text-secondary)] mb-1"
              >
                Group Size *
              </label>

              <input
                type="text"
                id="group_size"
                name="group_size"
                value={formData.group_size}
                onChange={handleChange}
                required
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="e.g., 2-6 people"
              />
            </div>

            <div>
              <label
                htmlFor="imageUpload"
                className="block text-[color:var(--text-secondary)] mb-1"
              >
                Add Photos
              </label>

              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                multiple
                className="w-full p-2 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
              />
            </div>

          </div>

          {/* ==================================================
              ITINERARY
          ================================================== */}

          <div>

            <label
              htmlFor="itinerary"
              className="block text-[color:var(--text-secondary)] mb-1"
            >
              Detailed Itinerary *
            </label>

            <textarea
              id="itinerary"
              name="itinerary"
              rows="6"
              value={formData.itinerary}
              onChange={handleChange}
              required
              className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
              placeholder="Day 1: Arrive in Hunza&#10;Day 2: Attabad Lake..."
            ></textarea>

          </div>

          {/* ==================================================
              INCLUSIONS / EXCLUSIONS
          ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>

              <label
                htmlFor="inclusions"
                className="block text-[color:var(--text-secondary)] mb-1"
              >
                Inclusions
              </label>

              <textarea
                id="inclusions"
                name="inclusions"
                rows="3"
                value={formData.inclusions}
                onChange={handleChange}
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder={`e.g., Transport, Accommodation, Meals
Guide services, Entry fees`}
              ></textarea>

            </div>

            <div>

              <label
                htmlFor="exclusions"
                className="block text-[color:var(--text-secondary)] mb-1"
              >
                Exclusions
              </label>

              <textarea
                id="exclusions"
                name="exclusions"
                rows="3"
                value={formData.exclusions}
                onChange={handleChange}
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder={`e.g., Personal expenses, Tipping
Entrance fees, Meals`}
              ></textarea>

            </div>

          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="flex space-x-4 pt-4">

            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-lg font-semibold transition duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)]'
              }`}
            >
              {loading
                ? isEditMode
                  ? 'Saving...'
                  : 'Publishing...'
                : isEditMode
                  ? 'Save Changes'
                  : 'Publish Package'}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-[color:var(--surface-secondary)] hover:bg-[color:var(--border-primary)] text-[color:var(--text-primary)] py-3 rounded-lg font-semibold transition duration-200"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateEditPackageScreen;