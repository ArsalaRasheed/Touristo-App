import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';

const CompanyRegistrationScreen = () => {
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for API call
    console.log('Company registration submitted:', formData);
    navigate('/home');
  };

  const fieldClass =
    'w-full rounded-[var(--radius-md)] border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] px-4 py-3 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] transition-colors focus:outline-none focus:border-[color:var(--brand-primary)] focus:ring-2 focus:ring-[color:var(--brand-primary)]/15';

  const labelClass =
    'mb-1.5 block text-[13px] font-semibold text-[color:var(--text-secondary)]';

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">

        <Link
          to="/login"
          className="link mb-6 inline-flex items-center gap-1.5 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to sign in
        </Link>

        <div className="card card-static rounded-[var(--radius-xl)] p-6 sm:p-9">

          <div className="mb-7 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)]">
              <Building2 size={22} strokeWidth={2} />
            </span>

            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-gold-ink)]">
              For tour operators
            </p>

            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">
              Register your tour company
            </h1>

            <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
              List your tours and reach thousands of travelers across Pakistan.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="companyName" className={labelClass}>
                  Company name
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  onChange={handleChange}
                  required
                  className={fieldClass}
                  placeholder="e.g., ABC Tours & Travels"
                />
              </div>

              <div>
                <label htmlFor="contactPerson" className={labelClass}>
                  Contact person
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  onChange={handleChange}
                  required
                  className={fieldClass}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Business email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  onChange={handleChange}
                  required
                  className={fieldClass}
                  placeholder="your-company@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  onChange={handleChange}
                  required
                  className={fieldClass}
                  placeholder="+92-xxx-xxxxxxx"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className={labelClass}>
                  Business address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  onChange={handleChange}
                  required
                  className={`${fieldClass} resize-none`}
                  placeholder="Full address of your business"
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className={labelClass}>
                  Company description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  onChange={handleChange}
                  required
                  className={`${fieldClass} resize-none`}
                  placeholder="Tell travelers about your company and unique offerings."
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-7 w-full"
            >
              Submit application
            </button>
          </form>

          <div className="mt-7 flex items-start gap-2.5 rounded-[var(--radius-md)] bg-[color:var(--bg-secondary)] px-4 py-3.5">
            <CheckCircle2
              size={17}
              className="mt-0.5 shrink-0 text-[color:var(--success)]"
            />

            <p className="text-[13px] leading-5 text-[color:var(--text-secondary)]">
              Our team reviews every application. You will be notified once your
              company is approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistrationScreen;
