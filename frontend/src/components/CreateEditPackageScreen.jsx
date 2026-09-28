import React, {
  useEffect,
  useState
} from 'react';

import {
  useNavigate
} from 'react-router-dom';

import {
  useAuth
} from '../context/AuthContext';


const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;


const CreateEditPackageScreen = () => {

  const [formData, setFormData] =
    useState({
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


  const [imageFile, setImageFile] =
    useState(null);


  const [imagePreview, setImagePreview] =
    useState('');


  const [loading, setLoading] =
    useState(false);


  const [loadingPackage, setLoadingPackage] =
    useState(false);


  const [error, setError] =
    useState('');


  const navigate =
    useNavigate();


  const {
    user,
    getAuthHeader
  } =
    useAuth();


  const editId =
    new URLSearchParams(
      window.location.search
    ).get('edit');


  const isEditMode =
    Boolean(editId);


  /*
  |--------------------------------------------------------------------------
  | Load existing package
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!editId) {
      return;
    }


    const loadPackage =
      async () => {

        try {

          setLoadingPackage(
            true
          );

          setError('');


          const response =
            await fetch(
              `/api/packages/${editId}`,
              {
                headers:
                  getAuthHeader()
              }
            );


          const result =
            await response.json();


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


          let itineraryText =
            '';


          if (
            Array.isArray(
              pkg.itinerary
            )
          ) {

            itineraryText =
              pkg.itinerary
                .map(day => {

                  if (
                    day &&
                    typeof day ===
                      'object'
                  ) {

                    const dayNumber =
                      day.day !==
                      undefined
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


                    return (
                      `${dayNumber}${title}${description}`
                    );
                  }


                  return String(day);
                })
                .join('\n\n');

          } else if (
            typeof pkg.itinerary ===
            'string'
          ) {

            itineraryText =
              pkg.itinerary;
          }


          const inclusionsText =
            Array.isArray(
              pkg.inclusions
            )
              ? pkg.inclusions.join(
                  '\n'
                )
              : pkg.inclusions ||
                '';


          const exclusionsText =
            Array.isArray(
              pkg.exclusions
            )
              ? pkg.exclusions.join(
                  '\n'
                )
              : pkg.exclusions ||
                '';


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
              pkg.duration_days ??
              '',

            group_size:
              pkg.group_size || '',

            itinerary:
              itineraryText,

            inclusions:
              inclusionsText,

            exclusions:
              exclusionsText
          });


          /*
           * Show existing package image.
           */
          if (pkg.image) {

            setImagePreview(
              pkg.image
            );
          }

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

          setLoadingPackage(
            false
          );
        }
      };


    loadPackage();

  }, [
    editId,
    getAuthHeader
  ]);


  /*
  |--------------------------------------------------------------------------
  | Input change
  |--------------------------------------------------------------------------
  */

  const handleChange =
    event => {

      const {
        name,
        value
      } =
        event.target;


      setFormData(
        previous => ({
          ...previous,
          [name]:
            value
        })
      );


      setError('');
    };


  /*
  |--------------------------------------------------------------------------
  | Convert selected image to base64
  |--------------------------------------------------------------------------
  */

  const fileToDataUrl =
    file => {

      return new Promise(
        (
          resolve,
          reject
        ) => {

          const reader =
            new FileReader();


          reader.onload =
            () =>
              resolve(
                reader.result
              );


          reader.onerror =
            () =>
              reject(
                new Error(
                  'Could not read image'
                )
              );


          reader.readAsDataURL(
            file
          );
        }
      );
    };


  /*
  |--------------------------------------------------------------------------
  | Image selection
  |--------------------------------------------------------------------------
  */

  const handleImageChange =
    async event => {

      const file =
        event.target.files?.[0];


      if (!file) {
        return;
      }


      setError('');


      /*
       * Validate type.
       */
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif'
      ];


      if (
        !allowedTypes.includes(
          file.type
        )
      ) {

        setError(
          'Please select a JPG, PNG, WEBP or GIF image.'
        );


        event.target.value =
          '';


        return;
      }


      /*
       * Validate size.
       */
      if (
        file.size >
        MAX_IMAGE_SIZE
      ) {

        setError(
          'Image must be 5 MB or smaller.'
        );


        event.target.value =
          '';


        return;
      }


      try {

        const dataUrl =
          await fileToDataUrl(
            file
          );


        setImageFile(
          file
        );


        setImagePreview(
          dataUrl
        );

      } catch (err) {

        console.error(
          err
        );


        setError(
          'Could not read selected image.'
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async event => {

      event.preventDefault();


      setLoading(true);
      setError('');


      /*
       * Required fields.
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


      /*
       * New package must have an image.
       */
      if (
        !isEditMode &&
        !imageFile
      ) {

        setError(
          'Please upload a package image before publishing.'
        );


        setLoading(false);

        return;
      }


      try {

        /*
         * Get host profile.
         */
        const hostResponse =
          await fetch(
            `/api/hosts/user/${user.id}`,
            {
              headers:
                getAuthHeader()
            }
          );


        if (
          !hostResponse.ok
        ) {

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
         * Basic package data.
         */
        const packageData = {

          host_id:
            hostId,

          title:
            formData.title.trim(),

          description:
            formData.description.trim(),

          destination:
            formData.destination.trim(),

          price:
            parseFloat(
              formData.price
            ),

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
                  .map(
                    item =>
                      item.trim()
                  )
                  .filter(Boolean)
              : [],

          exclusions:
            formData.exclusions
              ? formData.exclusions
                  .split('\n')
                  .map(
                    item =>
                      item.trim()
                  )
                  .filter(Boolean)
              : [],

          itinerary:
            formData.itinerary
        };


        /*
         * Convert newly selected image.
         *
         * If editing without selecting a new image,
         * nothing is sent and backend keeps old image.
         */
        if (imageFile) {

          const imageData =
            await fileToDataUrl(
              imageFile
            );


          packageData.image_data =
            imageData;


          packageData.image_name =
            imageFile.name;


          packageData.image_type =
            imageFile.type;
        }


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
         * Return to host dashboard.
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

        setLoading(
          false
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Loading state
  |--------------------------------------------------------------------------
  */

  if (
    loadingPackage
  ) {

    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] flex items-center justify-center p-4">

        <div className="text-center">

          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[color:var(--brand-primary-soft)] border-t-[color:var(--brand-primary)] mx-auto" />

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

          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">

            {error}

          </div>

        )}


        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6"
        >

          {/* BASIC INFORMATION */}

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
                value={
                  formData.title
                }
                onChange={
                  handleChange
                }
                required
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
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
                value={
                  formData.destination
                }
                onChange={
                  handleChange
                }
                required
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="e.g., Hunza Valley"
              />

            </div>

          </div>


          {/* DESCRIPTION */}

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
              value={
                formData.description
              }
              onChange={
                handleChange
              }
              required
              className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
              placeholder="Describe your package..."
            />

          </div>


          {/* PACKAGE DETAILS */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

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
                value={
                  formData.price
                }
                onChange={
                  handleChange
                }
                required
                min="0"
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="50000"
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
                value={
                  formData.duration_days
                }
                onChange={
                  handleChange
                }
                required
                min="1"
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="5"
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
                value={
                  formData.group_size
                }
                onChange={
                  handleChange
                }
                required
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="2-6 people"
              />

            </div>

          </div>


          {/* IMAGE UPLOAD */}

          <div>

            <label
              htmlFor="imageUpload"
              className="block text-[color:var(--text-secondary)] mb-2 font-medium"
            >
              Package Image {!isEditMode && '*'}
            </label>


            <input
              type="file"
              id="imageUpload"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={
                handleImageChange
              }
              className="w-full p-3 border border-[color:var(--border-primary)] rounded-xl bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
            />


            <p className="text-xs text-[color:var(--text-muted)] mt-2">
              JPG, PNG, WEBP or GIF · Maximum 5 MB
            </p>


            {imagePreview && (

              <div className="mt-4">

                <div className="relative overflow-hidden rounded-2xl border border-[color:var(--border-primary)] bg-[color:var(--surface-secondary)]">

                  <img
                    src={
                      imagePreview
                    }
                    alt="Package preview"
                    className="w-full h-64 object-cover"
                  />

                </div>


                <p className="text-xs text-[color:var(--text-muted)] mt-2">

                  {imageFile
                    ? `Selected: ${imageFile.name}`
                    : 'Current package image'}

                </p>

              </div>

            )}

          </div>


          {/* ITINERARY */}

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
              value={
                formData.itinerary
              }
              onChange={
                handleChange
              }
              required
              className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
              placeholder={`Day 1: Arrival in Islamabad
Day 2: Explore Islamabad
Day 3: Return`}
            />

          </div>


          {/* INCLUSIONS / EXCLUSIONS */}

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
                rows="4"
                value={
                  formData.inclusions
                }
                onChange={
                  handleChange
                }
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder={`Transport
Accommodation
Meals
Guide services`}
              />

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
                rows="4"
                value={
                  formData.exclusions
                }
                onChange={
                  handleChange
                }
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder={`Personal expenses
Travel insurance
Shopping`}
              />

            </div>

          </div>


          {/* ACTIONS */}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">

            <button
              type="submit"
              disabled={
                loading
              }
              className="flex-1 py-3 rounded-xl font-semibold bg-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary-hover)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {loading
                ? isEditMode
                  ? 'Saving package...'
                  : 'Uploading & Publishing...'
                : isEditMode
                  ? 'Save Changes'
                  : 'Publish Package'}

            </button>


            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="flex-1 py-3 rounded-xl font-semibold bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)] border border-[color:var(--border-primary)]"
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