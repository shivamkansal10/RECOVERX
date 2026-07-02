import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  const [showToast, setShowToast] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('shivamkansal1000@gmail.com');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy email to clipboard: ', err);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen relative overflow-x-hidden selection:bg-secondary-fixed selection:text-on-secondary-fixed text-left">
      {/* Header Navigation */}
      <header className="w-full top-0 sticky z-50 bg-background/80 backdrop-blur-md">
        <nav className="flex justify-between items-center h-20 px-gutter max-w-container-max mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary font-bold group-hover:bg-secondary transition-base">
                R
              </div>
              <span className="font-headline-md text-headline-md font-extrabold tracking-tight text-primary">
                RECOVERX
              </span>
            </Link>
            <Link
              to="/"
              className="hidden md:flex items-center gap-1 text-on-surface-variant font-label-md text-label-md hover:text-primary transition-base group cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">
                arrow_back
              </span>
              Back to Home
            </Link>
          </div>
          <div className="md:hidden">
            <Link to="/" className="text-on-surface-variant cursor-pointer hover:text-primary">
              <span className="material-symbols-outlined text-[24px]">home</span>
            </Link>
          </div>
        </nav>
      </header>

      <main className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center px-gutter py-section-gap">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mb-12">
          <h1 className="font-display text-display text-primary mb-4">Get in Touch</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Questions, feedback, or need help with your account? Reach out directly.
          </p>
        </div>

        {/* Contact Card */}
        <div className="w-full max-w-md bg-surface-container-lowest rounded-[16px] p-8 soft-shadow border border-outline-variant/30 text-center flex flex-col items-center transition-base hover:scale-[1.01]">
          {/* Avatar */}
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6 ring-4 ring-surface-container-low">
            <span className="font-headline-md text-headline-md text-on-primary font-bold">
              SK
            </span>
          </div>

          {/* Info */}
          <h2 className="font-headline-md text-headline-md text-primary mb-1">
            Shivam Kansal
          </h2>
          <p className="font-label-md text-label-md text-on-surface-variant mb-8 uppercase tracking-widest text-xs">
            Creator &amp; Administrator, RECOVERX
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full">
            <a
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full border border-outline text-primary font-label-md text-label-md hover:bg-surface-container-low transition-base"
              href="mailto:shivamkansal1000@gmail.com?subject=FindIt%20-%20Question"
            >
              <span className="material-symbols-outlined text-[20px]">mail</span>
              shivamkansal1000@gmail.com
            </a>
            <button
              className="w-12 h-12 flex items-center justify-center rounded-full border border-outline text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-base active:scale-90 cursor-pointer"
              onClick={copyEmail}
              title="Copy Email"
            >
              <span className="material-symbols-outlined text-[20px]">content_copy</span>
            </button>
          </div>

          {/* Feedback Toast */}
          <div
            className={`transition-opacity duration-300 mt-4 py-1 px-3 bg-primary text-on-primary text-caption font-caption rounded-full ${
              showToast ? 'opacity-100' : 'opacity-0'
            }`}
            id="copy-toast"
          >
            Email copied to clipboard
          </div>
        </div>

        {/* Personal Text */}
        <div className="mt-12 max-w-md text-center">
          <p className="font-body-md text-body-md text-on-surface-variant italic">
            "RECOVERX is built and maintained to help students reunite with their belongings — reach out anytime."
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12">
        <div className="flex justify-center items-center px-gutter max-w-container-max mx-auto opacity-40">
          <p className="font-caption text-caption text-on-surface-variant">
            Made by Shivam Kansal
          </p>
        </div>
      </footer>

      {/* Dotted Pattern Decoration */}
      <div className="fixed top-20 right-10 -z-10 opacity-10 pointer-events-none">
        <svg
          fill="none"
          height="200"
          viewBox="0 0 200 200"
          width="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle className="text-primary" cx="10" cy="10" r="2" fill="currentColor" />
          <circle className="text-primary" cx="40" cy="10" r="2" fill="currentColor" />
          <circle className="text-primary" cx="70" cy="10" r="2" fill="currentColor" />
          <circle className="text-primary" cx="100" cy="10" r="2" fill="currentColor" />
          <circle className="text-primary" cx="130" cy="10" r="2" fill="currentColor" />
          <circle className="text-primary" cx="10" cy="40" r="2" fill="currentColor" />
          <circle className="text-primary" cx="40" cy="40" r="2" fill="currentColor" />
          <circle className="text-primary" cx="70" cy="40" r="2" fill="currentColor" />
          <circle className="text-primary" cx="100" cy="40" r="2" fill="currentColor" />
          <circle className="text-primary" cx="130" cy="40" r="2" fill="currentColor" />
          <circle className="text-primary" cx="10" cy="70" r="2" fill="currentColor" />
          <circle className="text-primary" cx="40" cy="70" r="2" fill="currentColor" />
          <circle className="text-primary" cx="70" cy="70" r="2" fill="currentColor" />
          <circle className="text-primary" cx="100" cy="70" r="2" fill="currentColor" />
          <circle className="text-primary" cx="130" cy="70" r="2" fill="currentColor" />
        </svg>
      </div>
      <div className="fixed bottom-20 left-10 -z-10 opacity-10 pointer-events-none transform rotate-180">
        <svg
          fill="none"
          height="200"
          viewBox="0 0 200 200"
          width="200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle className="text-primary" cx="10" cy="10" r="2" fill="currentColor" />
          <circle className="text-primary" cx="40" cy="10" r="2" fill="currentColor" />
          <circle className="text-primary" cx="70" cy="10" r="2" fill="currentColor" />
          <circle className="text-primary" cx="100" cy="10" r="2" fill="currentColor" />
          <circle className="text-primary" cx="10" cy="40" r="2" fill="currentColor" />
          <circle className="text-primary" cx="40" cy="40" r="2" fill="currentColor" />
          <circle className="text-primary" cx="70" cy="40" r="2" fill="currentColor" />
          <circle className="text-primary" cx="100" cy="40" r="2" fill="currentColor" />
          <circle className="text-primary" cx="10" cy="70" r="2" fill="currentColor" />
          <circle className="text-primary" cx="40" cy="70" r="2" fill="currentColor" />
          <circle className="text-primary" cx="70" cy="70" r="2" fill="currentColor" />
          <circle className="text-primary" cx="100" cy="70" r="2" fill="currentColor" />
        </svg>
      </div>

      {/* TODO: CreditFooter */}
    </div>
  );
}
