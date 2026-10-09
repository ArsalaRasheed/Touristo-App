import { useState } from 'react';

const EmergencySOSScreen = () => {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [status, setStatus] = useState(null);

  const emergencyContacts = [
    { name: 'Police', number: '15', icon: '👮' },
    { name: 'Ambulance', number: '115', icon: '🚑' },
    { name: 'Fire Department', number: '115', icon: '🚒' },
    { name: "Women's Helpline", number: '1043', icon: '👩' },
    { name: 'Child Protection', number: '1056', icon: '👶' },
    { name: 'Tourist Police', number: '1222', icon: '👮‍♀️' }
  ];

  const touristHelpCenters = [
    { name: 'Islamabad Tourism Center', location: 'Blue Area, Islamabad', phone: '051-1234567' },
    { name: 'Lahore Tourism Center', location: 'Anarkali Bazaar, Lahore', phone: '042-1234567' },
    { name: 'Karachi Tourism Center', location: 'Clifton, Karachi', phone: '021-1234567' },
    { name: 'Gilgit Tourism Office', location: 'Main Bazaar, Gilgit', phone: '05811-12345' }
  ];

  const getLocation = () => {
    setStatus(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError(null);
      },
      () => {
        setLocationError(
          'Unable to retrieve your location. Please ensure location services are enabled.'
        );
      }
    );
  };

  const shareLocation = async () => {
    if (!location) {
      setStatus({ type: 'error', text: 'Get your location first, then share it.' });
      return;
    }

    const locationUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;

    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        throw new Error('Clipboard unavailable');
      }

      await navigator.clipboard.writeText(locationUrl);
      setStatus({
        type: 'success',
        text: 'Live location copied to clipboard. Share it with your relatives.'
      });
    } catch (err) {
      console.error('Failed to copy location: ', err);
      window.open(locationUrl, '_blank');
      setStatus({
        type: 'success',
        text: 'Opened your location in Google Maps. Share the link from there.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] px-4 pb-24 pt-8 text-[color:var(--text-primary)]">
      <div className="mx-auto max-w-4xl">

        <div className="mb-7 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--danger-soft)]">
            <span className="text-2xl" role="img" aria-label="Emergency">
              🆘
            </span>
          </span>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--danger)]">
            Safety first
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
            Emergency SOS
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[color:var(--text-secondary)]">
            Quick access to emergency services and tourist assistance across
            Pakistan.
          </p>
        </div>

        <div className="mb-6">
          <div className="mb-6 text-center">
            <button
              onClick={getLocation}
              className="mx-auto flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-[color:var(--danger)] text-white shadow-[var(--shadow-lg)] transition hover:bg-[color:var(--danger)]/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--danger)]/30"
              aria-label="Get current location for emergency help"
            >
              <span className="text-4xl" role="img" aria-hidden="true">
                🆘
              </span>
            </button>

            <p className="mt-4 text-base font-semibold">
              Tap for emergency help
            </p>
          </div>

          <div className="card card-static rounded-[var(--radius-lg)] p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-[-0.02em]">
              Share live location
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-[color:var(--text-secondary)]">
              Get your current location and share it with your relatives or the
              authorities.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={getLocation}
                className="btn btn-primary flex-1"
              >
                Get my location
              </button>

              <button
                onClick={shareLocation}
                disabled={!location}
                className={`btn flex-1 ${
                  location
                    ? 'bg-[color:var(--success)] text-white hover:bg-[color:var(--success)]/90'
                    : 'cursor-not-allowed bg-[color:var(--bg-secondary)] text-[color:var(--text-muted)]'
                }`}
              >
                Share live location
              </button>
            </div>

            {location && (
              <div className="mt-4 rounded-[var(--radius-md)] border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] px-4 py-3">
                <p className="text-sm text-[color:var(--text-secondary)]">
                  Current location:{' '}
                  <span className="font-semibold text-[color:var(--text-primary)]">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </span>
                </p>
              </div>
            )}

            {locationError && (
              <div
                className="mt-4 rounded-[var(--radius-md)] bg-[color:var(--danger-soft)] px-4 py-3"
                role="alert"
              >
                <p className="text-sm text-[color:var(--danger)]">
                  {locationError}
                </p>
              </div>
            )}

            {status && (
              <div
                className={`mt-4 rounded-[var(--radius-md)] px-4 py-3 ${
                  status.type === 'error'
                    ? 'bg-[color:var(--danger-soft)]'
                    : 'bg-[color:var(--success-soft)]'
                }`}
                role="status"
                aria-live="polite"
              >
                <p
                  className={`text-sm ${
                    status.type === 'error'
                      ? 'text-[color:var(--danger)]'
                      : 'text-[color:var(--success)]'
                  }`}
                >
                  {status.text}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="card card-static mb-6 rounded-[var(--radius-lg)] p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            Emergency contacts
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {emergencyContacts.map((contact, index) => (
              <a
                key={index}
                href={`tel:${contact.number}`}
                className="flex flex-col items-center rounded-[var(--radius-md)] border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] p-4 text-center transition hover:border-[color:var(--brand-gold)] hover:bg-[color:var(--brand-gold-soft)]"
              >
                <span
                  className="text-3xl"
                  role="img"
                  aria-hidden="true"
                >
                  {contact.icon}
                </span>

                <span className="mt-2 text-[13px] font-semibold leading-4 text-[color:var(--text-primary)]">
                  {contact.name}
                </span>

                <span className="mt-1 text-lg font-semibold text-[color:var(--brand-primary)]">
                  {contact.number}
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="card card-static mb-6 rounded-[var(--radius-lg)] p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            Tourist help centers
          </h2>

          <div className="mt-4 space-y-3">
            {touristHelpCenters.map((center, index) => (
              <div
                key={index}
                className="rounded-[var(--radius-md)] border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">
                    {center.name}
                  </h3>

                  <a
                    href={`tel:${center.phone}`}
                    className="link text-sm font-medium"
                  >
                    {center.phone}
                  </a>
                </div>

                <p className="text-[13px] text-[color:var(--text-secondary)]">
                  {center.location}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-static rounded-[var(--radius-lg)] p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            Safety tips
          </h2>

          <ul className="mt-4 space-y-2.5 text-sm leading-6 text-[color:var(--text-secondary)]">
            {[
              'Always inform someone about your travel plans',
              'Carry identification and emergency contacts',
              'Stay aware of your surroundings',
              'Respect local customs and regulations',
              'Keep important documents in a safe place'
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2.5">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--brand-gold)]"
                  aria-hidden="true"
                />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmergencySOSScreen;
