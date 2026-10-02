import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  Send,
  MessageCircle,
  CheckCircle2
} from 'lucide-react';


/* ============================================================
   CONTACT INFO ITEM
============================================================ */

const ContactInfo = ({
  icon: Icon,
  title,
  value,
  description
}) => {
  return (
    <div className="flex items-start gap-4">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)]">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">

        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--brand-gold)]">
          {title}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-[color:var(--text-primary)]">
          {value}
        </p>

        {description && (
          <p className="mt-1 text-xs leading-5 text-[color:var(--text-secondary)]">
            {description}
          </p>
        )}

      </div>

    </div>
  );
};


/* ============================================================
   FORM FIELD
============================================================ */

const FormField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = true
}) => {
  return (
    <div>

      <label
        htmlFor={name}
        className="mb-2 block text-xs font-semibold text-[color:var(--text-primary)]"
      >
        {label}
      </label>

      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] px-4 py-3 text-sm text-[color:var(--text-primary)] outline-none transition-all placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-gold)] focus:bg-[color:var(--surface-primary)] focus:ring-2 focus:ring-[color:var(--brand-gold)]/15"
      />

    </div>
  );
};


/* ============================================================
   CONTACT SCREEN
============================================================ */

const ContactScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('Form submitted:', formData);

    setSubmitted(true);

    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">

      <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-12 sm:px-6 sm:py-9">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="mb-8">

          <Link
            to="/profile"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--brand-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>


          <div className="relative overflow-hidden rounded-[32px] bg-[color:var(--brand-primary)] px-6 py-9 text-white shadow-[var(--shadow-lg)] sm:px-10 sm:py-12">

            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[color:var(--brand-gold)] opacity-15 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-white opacity-5 blur-3xl" />

            <div className="relative flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[color:var(--brand-gold-light)] backdrop-blur-sm">
                <MessageCircle className="h-7 w-7" />
              </div>

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--brand-gold-light)]">
                  Get in touch
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
                  How can we help?
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                  Have a question about bookings, partnerships or
                  Touristo? Send us a message and we'll be happy to hear
                  from you.
                </p>

              </div>

            </div>

          </div>

        </header>


        {/* ====================================================
            CONTENT
        ==================================================== */}

        <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">


          {/* ==================================================
              CONTACT DETAILS
          ================================================== */}

          <section className="rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-6 shadow-[var(--shadow-sm)] sm:p-7">

            <div className="mb-7">

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-gold)]">
                Contact details
              </p>

              <h2 className="mt-1 text-2xl font-semibold">
                Let's connect.
              </h2>

              <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                Our team is here to assist with bookings, partnerships
                and general questions about Touristo.
              </p>

            </div>


            <div className="space-y-6">

              <ContactInfo
                icon={Phone}
                title="Phone"
                value="+92 300 1234567"
                description="Available for general enquiries"
              />

              <ContactInfo
                icon={Mail}
                title="Email"
                value="support@touristo.pk"
                description="Send us your questions anytime"
              />

              <ContactInfo
                icon={MapPin}
                title="Office"
                value="Blue Area, Islamabad, Pakistan"
                description="Touristo support office"
              />

            </div>


            <div className="mt-8 rounded-2xl bg-[color:var(--brand-gold-soft)] p-4">

              <p className="text-sm font-semibold text-[color:var(--brand-primary)]">
                Planning a trip?
              </p>

              <p className="mt-1 text-xs leading-5 text-[color:var(--text-secondary)]">
                Explore destinations and packages before getting in
                touch with a host.
              </p>

              <Link
                to="/destinations"
                className="mt-3 inline-flex items-center text-xs font-semibold text-[color:var(--brand-primary)] hover:underline"
              >
                Explore destinations
              </Link>

            </div>

          </section>


          {/* ==================================================
              MESSAGE FORM
          ================================================== */}

          <section className="rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-6 shadow-[var(--shadow-md)] sm:p-7">

            <div className="mb-6">

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-gold)]">
                Message
              </p>

              <h2 className="mt-1 text-2xl font-semibold">
                Send us a message
              </h2>

            </div>


            {submitted && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[color:var(--success)]/20 bg-[color:var(--success-soft)] p-4">

                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--success)]" />

                <div>

                  <p className="text-sm font-semibold text-[color:var(--success)]">
                    Message received
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[color:var(--text-secondary)]">
                    Thank you for contacting us. We'll get back to you soon.
                  </p>

                </div>

              </div>
            )}


            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <FormField
                  label="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />

                <FormField
                  label="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  type="email"
                />

              </div>


              <FormField
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help?"
              />


              <div>

                <label
                  htmlFor="message"
                  className="mb-2 block text-xs font-semibold text-[color:var(--text-primary)]"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Tell us how we can help..."
                  className="w-full resize-none rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] px-4 py-3 text-sm leading-6 text-[color:var(--text-primary)] outline-none transition-all placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-gold)] focus:bg-[color:var(--surface-primary)] focus:ring-2 focus:ring-[color:var(--brand-gold)]/15"
                />

              </div>


              <button
                type="submit"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--brand-primary)] px-5 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--brand-primary-hover)] hover:shadow-[var(--shadow-md)]"
              >
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                Send Message
              </button>

            </form>

          </section>

        </div>


        {/* ====================================================
            FOOTER NOTE
        ==================================================== */}

        <div className="mt-5 text-center text-xs text-[color:var(--text-muted)]">
          We appreciate your feedback and questions about Touristo.
        </div>

      </div>

    </div>
  );
};

export default ContactScreen;