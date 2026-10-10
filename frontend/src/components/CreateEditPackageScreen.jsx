import {
  useEffect,
  useState
} from 'react';

import {
  useNavigate
} from 'react-router-dom';

import {
  useAuth
} from '../context/AuthContext';

import {
  compressImage,
  IMAGE_PRESETS
} from '../utils/imageCompression';

import {
  Sparkles,
  Wand2,
  RefreshCw,
  Check,
  X,
  Info,
  Users,
  Star
} from 'lucide-react';


const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;


const MAX_AI_BRIEF_LENGTH = 1200;


const AI_SECTION_OPTIONS = [
  {
    key: 'basics',
    label: 'Title, description & trip details'
  },
  {
    key: 'itinerary',
    label: 'Itinerary'
  },
  {
    key: 'lists',
    label: 'Inclusions & exclusions'
  },
  {
    key: 'discovery',
    label: 'Highlights, activities & safety'
  },
  {
    key: 'seo',
    label: 'SEO description & tags'
  }
];


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
      exclusions: '',
      highlights: '',
      activities: '',
      tags: '',
      target_traveler_type: '',
      best_season: '',
      safety_notes: '',
      seo_description: ''
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


  /*
  |--------------------------------------------------------------------------
  | AI package builder
  |--------------------------------------------------------------------------
  */

  const [aiBrief, setAiBrief] =
    useState('');


  const [aiDetails, setAiDetails] =
    useState({
      destination: '',
      duration_days: '',
      budget_per_person: '',
      travelers: '',
      travel_style: '',
      activities: '',
      accommodation: '',
      transport: ''
    });


  const setAiDetail = (field, value) =>
    setAiDetails(previous => ({
      ...previous,
      [field]: value
    }));


  const [
    aiLoading,
    setAiLoading
  ] = useState(false);


  const [aiError, setAiError] =
    useState('');


  const [aiNotice, setAiNotice] =
    useState('');


  const [aiDraft, setAiDraft] =
    useState(null);


  const [
    aiPriceApplied,
    setAiPriceApplied
  ] = useState(false);


  /*
   * Sections the host chooses to apply from the AI draft.
   * The AI never applies anything by itself.
   */
  const [aiSections, setAiSections] =
    useState({
      basics: true,
      itinerary: true,
      lists: true,
      discovery: true,
      seo: true
    });


  const toggleAiSection = key =>
    setAiSections(previous => ({
      ...previous,
      [key]: !previous[key]
    }));


  /*
   * Explicit review step before saving/publishing.
   */
  const [confirmOpen, setConfirmOpen] =
    useState(false);


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
  | Assigned tour guides
  |--------------------------------------------------------------------------
  */

  const [hostGuides, setHostGuides] =
    useState([]);

  const [guidesLoading, setGuidesLoading] =
    useState(false);

  const [selectedGuideIds, setSelectedGuideIds] =
    useState([]);


  const toggleGuide = guideId =>
    setSelectedGuideIds(previous =>
      previous.includes(guideId)
        ? previous.filter(id => id !== guideId)
        : [...previous, guideId]
    );


  useEffect(() => {

    let cancelled = false;

    const loadHostGuides =
      async () => {

        try {

          setGuidesLoading(true);

          const hostResponse =
            await fetch(
              `/api/hosts/user/${user.id}`,
              {
                headers:
                  getAuthHeader()
              }
            );

          if (!hostResponse.ok) {
            return;
          }

          const hostData =
            await hostResponse.json();

          const hostId =
            hostData.data?.host?.id;

          if (!hostId || cancelled) {
            return;
          }

          const guidesResponse =
            await fetch(
              `/api/tour-guides/host/${hostId}`
            );

          if (!guidesResponse.ok || cancelled) {
            return;
          }

          const guidesData =
            await guidesResponse.json();

          if (cancelled) {
            return;
          }

          setHostGuides(
            guidesData?.data || []
          );

          if (isEditMode) {

            const packageGuidesResponse =
              await fetch(
                `/api/packages/${editId}/guides`
              );

            if (!packageGuidesResponse.ok) {
              return;
            }

            const packageGuidesData =
              await packageGuidesResponse.json();

            if (!cancelled) {

              setSelectedGuideIds(
                packageGuidesData?.data?.assignedGuideIds ||
                  []
              );
            }
          }
        } catch {
          // Guides are optional - do not block the form.
        } finally {

          if (!cancelled) {
            setGuidesLoading(false);
          }
        }
      };

    loadHostGuides();

    return () => {
      cancelled = true;
    };
  }, [user?.id, editId, isEditMode]); // eslint-disable-line react-hooks/exhaustive-deps


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


          const listToText = value =>
            Array.isArray(value)
              ? value.join('\n')
              : value || '';


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
              exclusionsText,

            highlights:
              listToText(
                pkg.highlights
              ),

            activities:
              listToText(
                pkg.activities
              ),

            tags:
              listToText(pkg.tags),

            target_traveler_type:
              pkg.target_traveler_type ||
              '',

            best_season:
              pkg.best_season || '',

            safety_notes:
              listToText(
                pkg.safety_notes
              ),

            seo_description:
              pkg.seo_description || ''
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

        const compressed =
          await compressImage(
            file,
            IMAGE_PRESETS.package
          );


        const dataUrl =
          await fileToDataUrl(
            compressed
          );


        setImageFile(
          compressed
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
  | AI package builder actions
  |
  | The AI only proposes a draft. The host applies it, edits it and
  | decides whether to publish.
  |--------------------------------------------------------------------------
  */

  const generateAiDraft =
    async () => {

      const brief =
        aiBrief.trim();


      if (!brief) {
        setAiError(
          'Describe the tour you want to build first.'
        );

        return;
      }


      if (
        brief.length >
        MAX_AI_BRIEF_LENGTH
      ) {
        setAiError(
          `Please keep the description under ${MAX_AI_BRIEF_LENGTH} characters.`
        );

        return;
      }


      setAiLoading(true);
      setAiError('');
      setAiNotice('');
      setAiPriceApplied(false);


      try {

        const response =
          await fetch(
            '/api/packages/ai/generate',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
                ...getAuthHeader()
              },

              body:
                JSON.stringify({
                  brief,
                  details: aiDetails
                })
            }
          );


        const result =
          await response
            .json()
            .catch(() => null);


        if (!response.ok) {
          throw new Error(
            result?.message ||
              'Could not generate a package draft'
          );
        }


        const draft =
          result?.data?.draft;


        if (
          !draft ||
          !draft.title ||
          !Array.isArray(
            draft.itinerary
          ) ||
          !draft.itinerary.length
        ) {
          throw new Error(
            'The AI returned an incomplete draft. Please try again.'
          );
        }


        setAiDraft(draft);

        setAiSections({
          basics: true,
          itinerary: true,
          lists: true,
          discovery: true,
          seo: true
        });

        setAiNotice(
          'Draft generated. Choose the sections you want to apply, then review the form before publishing.'
        );

      } catch (err) {

        console.error(
          'AI package generation error:',
          err
        );

        setAiDraft(null);

        setAiError(
          err.message ||
            'AI generation failed. Please try again.'
        );

      } finally {
        setAiLoading(false);
      }
    };


  const applyAiDraft = () => {

    if (!aiDraft) {
      return;
    }


    /*
     * Only the sections the host ticked are copied
     * into the form. Everything else keeps its value.
     */
    const appliedLabels = [];


    if (aiSections.basics) {
      appliedLabels.push('basics');
    }


    if (
      aiSections.itinerary &&
      aiDraft.itinerary?.length
    ) {
      appliedLabels.push('itinerary');
    }


    if (aiSections.lists) {
      appliedLabels.push('inclusions & exclusions');
    }


    if (aiSections.discovery) {
      appliedLabels.push('highlights, activities & safety');
    }


    if (aiSections.seo) {
      appliedLabels.push('SEO & tags');
    }


    if (!appliedLabels.length) {
      return;
    }


    setFormData(previous => {
      const next = { ...previous };


      if (aiSections.basics) {

        next.title =
          aiDraft.title ||
          previous.title;

        next.description =
          aiDraft.description ||
          previous.description;

        next.destination =
          aiDraft.destination ||
          previous.destination;

        next.duration_days =
          aiDraft.duration_days ||
          previous.duration_days;

        next.group_size =
          aiDraft.group_size ||
          previous.group_size;
      }


      if (
        aiSections.itinerary &&
        aiDraft.itinerary?.length
      ) {

        next.itinerary =
          aiDraft.itinerary
            .map(
              day =>
                `Day ${day.day}: ${day.title}\n${day.description}`
            )
            .join('\n\n');
      }


      if (aiSections.lists) {

        if (aiDraft.inclusions?.length) {
          next.inclusions =
            aiDraft.inclusions.join('\n');
        }


        if (aiDraft.exclusions?.length) {
          next.exclusions =
            aiDraft.exclusions.join('\n');
        }
      }


      if (aiSections.discovery) {

        if (aiDraft.highlights?.length) {
          next.highlights =
            aiDraft.highlights.join('\n');
        }


        if (aiDraft.activities?.length) {
          next.activities =
            aiDraft.activities.join('\n');
        }


        next.target_traveler_type =
          aiDraft.target_traveler_type ||
          previous.target_traveler_type;


        next.best_season =
          aiDraft.best_season ||
          previous.best_season;


        if (aiDraft.safety_notes?.length) {
          next.safety_notes =
            aiDraft.safety_notes.join('\n');
        }
      }


      if (aiSections.seo) {

        next.seo_description =
          aiDraft.seo_description ||
          previous.seo_description;


        if (aiDraft.tags?.length) {
          next.tags = aiDraft.tags.join('\n');
        }
      }


      return next;
    });


    setError('');


    setAiNotice(
      `Applied: ${appliedLabels.join(', ')}. Review each field, then save or publish when you are ready.`
    );
  };


  const applySuggestedPrice = () => {

    const price =
      Number(
        aiDraft?.suggested_price
      );


    if (!price) {
      return;
    }


    setFormData(previous => ({
      ...previous,
      price: String(price)
    }));


    setAiPriceApplied(true);


    setAiNotice(
      `Suggested price PKR ${price.toLocaleString()} applied. You can edit it in the price field.`
    );
  };


  const discardAiDraft = () => {
    setAiDraft(null);
    setAiPriceApplied(false);
    setAiNotice('');
    setAiError('');
  };


  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    event => {

      event.preventDefault();


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

        return;
      }


      /*
       * Explicit review step - nothing is
       * sent to the server until confirmed.
       */
      setConfirmOpen(true);
    };


  const savePackage =
    async () => {

      setConfirmOpen(false);
      setLoading(true);
      setError('');


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
        const textToList = value =>
          value
            ? value
                .split('\n')
                .map(item => item.trim())
                .filter(Boolean)
            : [];


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
            textToList(
              formData.inclusions
            ),

          exclusions:
            textToList(
              formData.exclusions
            ),

          highlights:
            textToList(
              formData.highlights
            ),

          activities:
            textToList(
              formData.activities
            ),

          tags: textToList(formData.tags),

          target_traveler_type:
            formData.target_traveler_type.trim(),

          best_season:
            formData.best_season.trim(),

          safety_notes:
            textToList(
              formData.safety_notes
            ),

          seo_description:
            formData.seo_description.trim(),

          itinerary:
            formData.itinerary
        };

        packageData.guide_ids =
          selectedGuideIds;


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

        <h1 className="text-3xl tracking-[-0.03em] text-[color:var(--text-primary)] mb-6">

          {isEditMode
            ? 'Manage Package'
            : 'Create New Package'}

        </h1>


        {error && (

          <div role="alert" className="mb-4 p-4 bg-[color:var(--danger-soft)] border border-[color:var(--danger)]/35 text-[color:var(--danger)] rounded-xl">

            {error}

          </div>

        )}


        {/*
        |--------------------------------------------------------------------------
        | AI PACKAGE BUILDER
        |
        | Draft assistance only. Publishing stays on the form below.
        |--------------------------------------------------------------------------
        */}

        <section className="mb-6 overflow-hidden rounded-[24px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] shadow-[var(--shadow-sm)]">

          <div className="bg-[color:var(--brand-primary)] px-5 py-4 flex items-start justify-between gap-4">

            <div>

              <div className="flex items-center gap-2 text-[color:var(--text-inverse)]">

                <Sparkles className="w-5 h-5 text-[color:var(--brand-gold-ink)]" />

                <h2 className="text-lg ">
                  AI Package Builder
                </h2>

              </div>

              <p className="mt-1 text-sm text-[color:var(--text-inverse)]/75">
                Describe your tour, review the AI draft, then publish it yourself.
              </p>

            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[color:var(--brand-gold)]/20 px-3 py-1 text-xs font-semibold text-[color:var(--brand-gold-ink)]">
              Draft only
            </span>

          </div>


          <div className="p-5 space-y-4">

            <div>

              <label
                htmlFor="aiBrief"
                className="block text-[color:var(--text-secondary)] mb-1"
              >
                Describe the tour you want to build *
              </label>

              <textarea
                id="aiBrief"
                rows={3}
                maxLength={MAX_AI_BRIEF_LENGTH}
                value={aiBrief}
                onChange={event => setAiBrief(event.target.value)}
                placeholder="Example: A 3 day family trip to Hunza in June, comfortable hotels, under PKR 45,000 per person, includes Baltit Fort and Attabad Lake."
                className="w-full resize-none rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] px-4 py-3 text-sm leading-6 text-[color:var(--text-primary)] outline-none transition-all placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-gold)] focus:bg-[color:var(--surface-primary)] focus:ring-2 focus:ring-[color:var(--brand-gold)]/15"
              />

              <div className="mt-1 flex items-center justify-between gap-3 text-xs text-[color:var(--text-muted)]">

                <span>
                  {aiBrief.length} / {MAX_AI_BRIEF_LENGTH}
                </span>

                <span>
                  The AI never publishes. You stay in control of Save and Publish.
                </span>

              </div>

            </div>


            {/*
            | Structured trip details. Optional, but when
            | filled in the draft must match them exactly.
            */}
            <div className="rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] p-4">

              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[color:var(--text-primary)]">
                  Trip details (optional)
                </p>

                <span className="text-xs text-[color:var(--text-muted)]">
                  The AI draft will follow these exactly.
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <div>
                  <label htmlFor="aiDestination" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
                    Destination
                  </label>
                  <input
                    id="aiDestination"
                    type="text"
                    maxLength={80}
                    value={aiDetails.destination}
                    onChange={event => setAiDetail('destination', event.target.value)}
                    placeholder="Hunza"
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="aiDuration" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
                    Duration (days)
                  </label>
                  <input
                    id="aiDuration"
                    type="number"
                    min={1}
                    max={30}
                    value={aiDetails.duration_days}
                    onChange={event => setAiDetail('duration_days', event.target.value)}
                    placeholder="3"
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="aiBudget" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
                    Budget per person (PKR)
                  </label>
                  <input
                    id="aiBudget"
                    type="number"
                    min={1000}
                    max={10000000}
                    step={500}
                    value={aiDetails.budget_per_person}
                    onChange={event => setAiDetail('budget_per_person', event.target.value)}
                    placeholder="45000"
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="aiTravelers" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
                    Travelers
                  </label>
                  <input
                    id="aiTravelers"
                    type="number"
                    min={1}
                    max={50}
                    value={aiDetails.travelers}
                    onChange={event => setAiDetail('travelers', event.target.value)}
                    placeholder="6"
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="aiTravelStyle" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
                    Travel style
                  </label>
                  <select
                    id="aiTravelStyle"
                    value={aiDetails.travel_style}
                    onChange={event => setAiDetail('travel_style', event.target.value)}
                    className="input"
                  >
                    <option value="">No preference</option>
                    <option value="Families">Families</option>
                    <option value="Couples">Couples</option>
                    <option value="Adventure travelers">Adventure</option>
                    <option value="Luxury travelers">Luxury</option>
                    <option value="Budget travelers">Budget</option>
                    <option value="Solo travelers">Solo</option>
                    <option value="Corporate groups">Corporate</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="aiAccommodation" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
                    Accommodation
                  </label>
                  <select
                    id="aiAccommodation"
                    value={aiDetails.accommodation}
                    onChange={event => setAiDetail('accommodation', event.target.value)}
                    className="input"
                  >
                    <option value="">No preference</option>
                    <option value="3-star hotel">3-star hotel</option>
                    <option value="4-star hotel">4-star hotel</option>
                    <option value="5-star hotel">5-star hotel</option>
                    <option value="Guest house">Guest house</option>
                    <option value="Camping">Camping</option>
                    <option value="Mixed accommodation">Mixed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="aiTransport" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
                    Transport
                  </label>
                  <select
                    id="aiTransport"
                    value={aiDetails.transport}
                    onChange={event => setAiDetail('transport', event.target.value)}
                    className="input"
                  >
                    <option value="">No preference</option>
                    <option value="Private car">Private car</option>
                    <option value="Coaster bus">Coaster bus</option>
                    <option value="4x4 jeep">4x4 jeep</option>
                    <option value="Flight plus car">Flight + car</option>
                    <option value="Mixed transport">Mixed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="aiActivities" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
                    Must-include activities
                  </label>
                  <input
                    id="aiActivities"
                    type="text"
                    maxLength={400}
                    value={aiDetails.activities}
                    onChange={event => setAiDetail('activities', event.target.value)}
                    placeholder="Attabad Lake boat ride, Baltit Fort"
                    className="input"
                  />
                </div>

              </div>

            </div>


            {aiError && (
              <div className="flex items-start gap-2 rounded-xl border border-[color:var(--danger)]/35 bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-[color:var(--danger)]">
                <X className="mt-0.5 w-4 h-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}


            {aiNotice && (
              <div className="flex items-start gap-2 rounded-xl border border-[color:var(--success)]/30 bg-[color:var(--success-soft)] px-4 py-3 text-sm text-[color:var(--success)]">
                <Check className="mt-0.5 w-4 h-4 shrink-0" />
                <span>{aiNotice}</span>
              </div>
            )}


            <div className="flex flex-wrap items-center gap-3">

              <button
                type="button"
                onClick={generateAiDraft}
                disabled={aiLoading}
                className="inline-flex items-center gap-2 bg-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary-hover)] disabled:opacity-60 text-[color:var(--text-inverse)] px-5 py-3 rounded-xl font-semibold transition"
              >
                {aiLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : aiDraft ? (
                  <RefreshCw className="w-4 h-4" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}

                {aiLoading
                  ? 'Generating draft...'
                  : aiDraft
                    ? 'Regenerate'
                    : 'Generate Package with AI'}
              </button>

              {aiDraft && (
                <button
                  type="button"
                  onClick={discardAiDraft}
                  className="inline-flex items-center gap-2 border border-[color:var(--border-light)] text-[color:var(--text-secondary)] px-5 py-3 rounded-xl font-semibold transition hover:bg-[color:var(--surface-secondary)]"
                >
                  <X className="w-4 h-4" />
                  Discard
                </button>
              )}

            </div>


            {aiLoading && (
              <p className="text-sm text-[color:var(--text-muted)]">
                Building your itinerary, inclusions and safety notes...
              </p>
            )}

          </div>


          {aiDraft && !aiLoading && (

            <div className="border-t border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] p-5 space-y-5">

              <div className="flex flex-wrap items-center justify-between gap-3">

                <p className="text-sm font-semibold text-[color:var(--text-primary)]">
                  AI draft ready. Nothing is applied automatically - pick the sections you want below.
                </p>

                <button
                  type="button"
                  onClick={applyAiDraft}
                  disabled={!Object.values(aiSections).some(Boolean)}
                  className="inline-flex items-center gap-2 bg-[color:var(--brand-primary)] disabled:opacity-60 text-[color:var(--text-inverse)] px-4 py-2.5 rounded-xl text-sm font-semibold transition hover:bg-[color:var(--brand-primary-hover)]"
                >
                  <Sparkles className="w-4 h-4" />
                  Apply selected sections
                </button>

              </div>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AI_SECTION_OPTIONS.map(option => (
                  <label
                    key={`ai-section-${option.key}`}
                    className="flex items-center gap-2 rounded-lg border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] px-3 py-2 text-sm text-[color:var(--text-secondary)] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={aiSections[option.key]}
                      onChange={() => toggleAiSection(option.key)}
                      className="accent-[color:var(--brand-primary)]"
                    />
                    {option.label}
                  </label>
                ))}
              </div>


              <div className="rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-4 space-y-4">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
                    Title
                  </p>
                  <p className="mt-1 font-bold text-[color:var(--text-primary)]">
                    {aiDraft.title}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
                    Description
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--text-secondary)]">
                    {aiDraft.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">Destination</p>
                    <p className="mt-1 text-sm font-semibold text-[color:var(--text-primary)]">{aiDraft.destination}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">Duration</p>
                    <p className="mt-1 text-sm font-semibold text-[color:var(--text-primary)]">{aiDraft.duration_days} days</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">Group size</p>
                    <p className="mt-1 text-sm font-semibold text-[color:var(--text-primary)]">{aiDraft.group_size || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">Traveler type</p>
                    <p className="mt-1 text-sm font-semibold text-[color:var(--text-primary)]">{aiDraft.target_traveler_type || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">Best season</p>
                    <p className="mt-1 text-sm font-semibold text-[color:var(--text-primary)]">{aiDraft.best_season || 'Not set'}</p>
                  </div>
                </div>


                {aiDraft.highlights?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">Highlights</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {aiDraft.highlights.map((item, index) => (
                        <span key={`highlight-${index}`} className="rounded-full bg-[color:var(--brand-primary-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-primary)]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}


                {aiDraft.activities?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">Activities</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {aiDraft.activities.map((item, index) => (
                        <span key={`activity-${index}`} className="rounded-full border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] px-3 py-1 text-xs font-semibold text-[color:var(--text-secondary)]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">Inclusions</p>
                    <ul className="mt-1.5 space-y-1 text-sm text-[color:var(--text-secondary)]">
                      {aiDraft.inclusions?.length ? aiDraft.inclusions.map((item, index) => (
                        <li key={`inclusion-${index}`} className="flex gap-2">
                          <Check className="mt-0.5 w-3.5 h-3.5 shrink-0 text-[color:var(--success)]" />
                          <span>{item}</span>
                        </li>
                      )) : <li className="text-[color:var(--text-muted)]">None provided</li>}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">Exclusions</p>
                    <ul className="mt-1.5 space-y-1 text-sm text-[color:var(--text-secondary)]">
                      {aiDraft.exclusions?.length ? aiDraft.exclusions.map((item, index) => (
                        <li key={`exclusion-${index}`} className="flex gap-2">
                          <X className="mt-0.5 w-3.5 h-3.5 shrink-0 text-[color:var(--danger)]" />
                          <span>{item}</span>
                        </li>
                      )) : <li className="text-[color:var(--text-muted)]">None provided</li>}
                    </ul>
                  </div>
                </div>


                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
                    Itinerary ({aiDraft.itinerary.length} days)
                  </p>

                  <ol className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1">
                    {aiDraft.itinerary.map(day => (
                      <li key={`draft-day-${day.day}`} className="rounded-lg border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] p-3">
                        <p className="text-sm font-semibold text-[color:var(--text-primary)]">
                          Day {day.day}: {day.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[color:var(--text-secondary)]">
                          {day.description}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>


                {aiDraft.safety_notes?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">Safety notes</p>
                    <ul className="mt-1.5 space-y-1 text-sm text-[color:var(--text-secondary)]">
                      {aiDraft.safety_notes.map((item, index) => (
                        <li key={`safety-${index}`} className="flex gap-2">
                          <Info className="mt-0.5 w-3.5 h-3.5 shrink-0 text-[color:var(--brand-primary)]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}


                {Number(aiDraft.suggested_price) > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--brand-gold)]/40 bg-[color:var(--brand-gold)]/10 px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
                        Suggested price from your brief
                      </p>
                      <p className="text-sm font-bold text-[color:var(--text-primary)]">
                        PKR {Number(aiDraft.suggested_price).toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={applySuggestedPrice}
                      disabled={aiPriceApplied}
                      className="rounded-lg border border-[color:var(--brand-primary)] text-[color:var(--brand-primary)] px-3 py-2 text-xs font-semibold transition hover:bg-[color:var(--brand-primary)] hover:text-[color:var(--text-inverse)] disabled:opacity-60"
                    >
                      {aiPriceApplied ? 'Applied' : 'Use this price'}
                    </button>
                  </div>
                )}

              </div>


              <p className="flex items-start gap-2 text-xs leading-5 text-[color:var(--text-muted)]">
                <Info className="mt-0.5 w-3.5 h-3.5 shrink-0" />
                The AI is an assistant, not the publisher. It only fills in the sections you select above - you can
                edit every field afterwards. Nothing is saved until you press Save or Publish.
              </p>

            </div>

          )}

        </section>


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
                className="w-full p-3 border border-[color:var(--border-control)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
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
                className="w-full p-3 border border-[color:var(--border-control)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
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
              className="w-full p-3 border border-[color:var(--border-control)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
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
                className="w-full p-3 border border-[color:var(--border-control)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
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
                className="w-full p-3 border border-[color:var(--border-control)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
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
                className="w-full p-3 border border-[color:var(--border-control)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
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
              className="w-full p-3 border border-[color:var(--border-control)] rounded-xl bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
            />


            <p className="text-xs text-[color:var(--text-muted)] mt-2">
              JPG, PNG, WEBP or GIF · Maximum 5 MB
            </p>


            {imagePreview && (

              <div className="mt-4">

                <div className="relative overflow-hidden rounded-2xl border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)]">

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
              className="w-full p-3 border border-[color:var(--border-control)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
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
                className="w-full p-3 border border-[color:var(--border-control)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
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
                className="w-full p-3 border border-[color:var(--border-control)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder={`Personal expenses
Travel insurance
Shopping`}
              />

            </div>

          </div>


          {/* TOUR GUIDES */}

          <div className="space-y-4 rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] p-5">

            <div>
              <p className="text-sm font-semibold text-[color:var(--text-primary)]">
                Assigned Tour Guides
              </p>
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                Choose which of your tour guides are assigned to this package.
                Travelers will see them on the package page and can compare them with AI.
              </p>
            </div>

            {guidesLoading ? (
              <p className="text-sm text-[color:var(--text-muted)]">
                Loading your tour guides...
              </p>
            ) : hostGuides.length === 0 ? (
              <p className="text-sm text-[color:var(--text-muted)]">
                No tour guides added to your company yet. Add guides from your company profile first.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {hostGuides.map(guide => {

                  const selected =
                    selectedGuideIds.includes(guide.id);

                  return (
                    <button
                      key={guide.id}
                      type="button"
                      onClick={() =>
                        toggleGuide(guide.id)
                      }
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                        selected
                          ? 'border-[color:var(--brand-primary)] bg-[color:var(--brand-primary)]/5'
                          : 'border-[color:var(--border-control)] bg-[color:var(--surface-primary)]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[color:var(--surface-secondary)] flex items-center justify-center">
                        <Users
                          size={18}
                          className="text-[color:var(--text-secondary)]"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[color:var(--text-primary)] truncate">
                          {guide.name || 'Tour Guide'}
                        </p>

                        <p className="text-xs text-[color:var(--text-secondary)] truncate">
                          {guide.specialty || 'Tour & Travel Guide'}
                          {Number(guide.rating) > 0 && (
                            <span className="inline-flex items-center gap-1 ml-2">
                              <Star
                                size={12}
                                className="fill-current text-[color:var(--brand-primary)]"
                              />
                              {Number(guide.rating).toFixed(1)}
                            </span>
                          )}
                        </p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                          selected
                            ? 'bg-[color:var(--brand-primary)] border-[color:var(--brand-primary)] text-white'
                            : 'border-[color:var(--border-control)] text-transparent'
                        }`}
                      >
                        <Check size={14} />
                      </div>
                    </button>
                  );
                })}

              </div>
            )}

            {selectedGuideIds.length > 0 && (
              <p className="text-xs text-[color:var(--text-secondary)]">
                {selectedGuideIds.length}{' '}
                {selectedGuideIds.length === 1
                  ? 'guide assigned'
                  : 'guides assigned'}{' '}
                to this package
              </p>
            )}

          </div>


          {/* DISCOVERY & SEO */}

          <div className="space-y-4 rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] p-5">

            <div>
              <p className="text-sm font-semibold text-[color:var(--text-primary)]">
                Discovery & SEO
              </p>
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                Optional. These fields help travelers find your package in search.
              </p>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>

                <label
                  htmlFor="highlights"
                  className="block text-[color:var(--text-secondary)] mb-1"
                >
                  Highlights (one per line)
                </label>

                <textarea
                  id="highlights"
                  name="highlights"
                  rows="4"
                  value={formData.highlights}
                  onChange={handleChange}
                  className="w-full p-3 border border-[color:var(--border-control)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                  placeholder={`Sunset at Eagle's Nest
Glacier trek
Local cuisine tasting`}
                />

              </div>


              <div>

                <label
                  htmlFor="activities"
                  className="block text-[color:var(--text-secondary)] mb-1"
                >
                  Activities (one per line)
                </label>

                <textarea
                  id="activities"
                  name="activities"
                  rows="4"
                  value={formData.activities}
                  onChange={handleChange}
                  className="w-full p-3 border border-[color:var(--border-control)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                  placeholder={`Hiking
Boating
Photography`}
                />

              </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div>

                <label
                  htmlFor="target_traveler_type"
                  className="block text-[color:var(--text-secondary)] mb-1"
                >
                  Best For
                </label>

                <input
                  type="text"
                  id="target_traveler_type"
                  name="target_traveler_type"
                  value={formData.target_traveler_type}
                  onChange={handleChange}
                  maxLength={80}
                  className="w-full p-3 border border-[color:var(--border-control)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                  placeholder="e.g., Families"
                />

              </div>


              <div>

                <label
                  htmlFor="best_season"
                  className="block text-[color:var(--text-secondary)] mb-1"
                >
                  Best Season
                </label>

                <input
                  type="text"
                  id="best_season"
                  name="best_season"
                  value={formData.best_season}
                  onChange={handleChange}
                  maxLength={80}
                  className="w-full p-3 border border-[color:var(--border-control)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                  placeholder="e.g., March to October"
                />

              </div>


              <div>

                <label
                  htmlFor="tags"
                  className="block text-[color:var(--text-secondary)] mb-1"
                >
                  Search Tags (one per line)
                </label>

                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full p-3 border border-[color:var(--border-control)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                  placeholder={'hunza\nmountains\nfamily'}
                />

              </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>

                <label
                  htmlFor="safety_notes"
                  className="block text-[color:var(--text-secondary)] mb-1"
                >
                  Safety Notes (one per line)
                </label>

                <textarea
                  id="safety_notes"
                  name="safety_notes"
                  rows="3"
                  value={formData.safety_notes}
                  onChange={handleChange}
                  className="w-full p-3 border border-[color:var(--border-control)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                  placeholder={`Carry warm clothing
Acclimatize before high-altitude trekking`}
                />

              </div>


              <div>

                <label
                  htmlFor="seo_description"
                  className="block text-[color:var(--text-secondary)] mb-1"
                >
                  SEO Description
                </label>

                <textarea
                  id="seo_description"
                  name="seo_description"
                  rows="3"
                  value={formData.seo_description}
                  onChange={handleChange}
                  maxLength={160}
                  className="w-full p-3 border border-[color:var(--border-control)] rounded-lg bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                  placeholder="One search-friendly sentence about this package..."
                />

                <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                  {formData.seo_description.length}/160 characters
                </p>

              </div>

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
                  ? 'Review & Save Changes'
                  : 'Review & Publish'}

            </button>


            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="flex-1 py-3 rounded-xl font-semibold bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)] border border-[color:var(--border-light)]"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>


      {/* REVIEW BEFORE SAVE / PUBLISH */}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

          <div className="w-full max-w-lg rounded-2xl border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-6 space-y-5 shadow-2xl">

            <div>
              <h2 className="text-lg font-bold text-[color:var(--text-primary)]">
                Review before {isEditMode ? 'saving' : 'publishing'}
              </h2>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                Confirm the details below. Nothing has been sent to the server yet.
              </p>
            </div>


            <dl className="space-y-2 text-sm">

              <div className="flex justify-between gap-4">
                <dt className="text-[color:var(--text-muted)]">Title</dt>
                <dd className="font-semibold text-right text-[color:var(--text-primary)]">
                  {formData.title.trim()}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-[color:var(--text-muted)]">Destination</dt>
                <dd className="font-semibold text-right text-[color:var(--text-primary)]">
                  {formData.destination.trim()}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-[color:var(--text-muted)]">Duration</dt>
                <dd className="font-semibold text-right text-[color:var(--text-primary)]">
                  {formData.duration_days} days
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-[color:var(--text-muted)]">Group size</dt>
                <dd className="font-semibold text-right text-[color:var(--text-primary)]">
                  {formData.group_size.trim()}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-[color:var(--text-muted)]">Price</dt>
                <dd className="font-semibold text-right text-[color:var(--text-primary)]">
                  PKR {Number(formData.price || 0).toLocaleString()}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-[color:var(--text-muted)]">Image</dt>
                <dd className="font-semibold text-right text-[color:var(--text-primary)]">
                  {imageFile ? 'New image selected' : imagePreview ? 'Existing image' : 'None'}
                </dd>
              </div>

            </dl>


            <div className="flex flex-col sm:flex-row gap-3">

              <button
                type="button"
                onClick={savePackage}
                className="flex-1 py-3 rounded-xl font-semibold bg-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary-hover)] text-white"
              >
                {isEditMode ? 'Confirm & Save' : 'Confirm & Publish'}
              </button>

              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-3 rounded-xl font-semibold bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)] border border-[color:var(--border-light)]"
              >
                Go back and edit
              </button>

            </div>

          </div>

        </div>
      )}

    </div>

  );
};


export default CreateEditPackageScreen;
