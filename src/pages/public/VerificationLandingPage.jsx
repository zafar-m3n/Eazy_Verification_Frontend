import { useNavigate } from "react-router-dom";

import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

function VerificationLandingPage() {
  const navigate = useNavigate();

  function handleStartVerification() {
    navigate("/verification");
  }

  function handleSkipToRegistration() {
    window.location.href = "https://portal.eazymarkets.com/signup";
  }

  function handleBackToWebsite() {
    window.location.href = "https://eazymarkets.com";
  }

  return (
    <section className="min-h-[calc(100vh-164px)] px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-text/70">
            <Icon icon="solar:shield-check-bold" className="size-4 text-accent-2" />
            Eazy Verification Portal
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-text sm:text-5xl lg:text-6xl">
            Complete your account verification securely.
          </h1>

          <p className="mt-5 text-base leading-7 text-text/65 sm:text-lg">
            Submit your identity details, financial suitability answers, and required documents for review before
            continuing with your account setup.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button
              type="button"
              variant="primary"
              icon="solar:document-add-bold"
              onClick={handleStartVerification}
              className="w-full sm:w-auto"
            >
              Start Verification
            </Button>

            <Button
              type="button"
              variant="secondary"
              icon="solar:arrow-right-up-bold"
              onClick={handleSkipToRegistration}
              className="w-full sm:w-auto"
            >
              Skip to Registration
            </Button>

            <Button
              type="button"
              variant="secondary"
              icon="solar:home-2-bold"
              onClick={handleBackToWebsite}
              className="w-full sm:w-auto"
            >
              Back to Website
            </Button>
          </div>

          <p className="mt-5 text-sm text-text/55">
            You can continue to registration now, but verification may still be required before your account is fully
            approved.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="rounded-2xl border border-border bg-background p-5 sm:p-6">
            <h2 className="text-lg font-bold text-text">Before you start</h2>

            <p className="mt-2 text-sm leading-6 text-text/60">
              Please keep the following documents ready. Each file should be clear, valid, and under 5MB.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex gap-3 rounded-2xl border border-border bg-card p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-1 text-card">
                  <Icon icon="solar:user-id-bold" className="size-5" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-text">Identity document</h3>
                  <p className="mt-1 text-sm leading-6 text-text/60">
                    Front and back side of your ID, passport, or accepted identity document.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-border bg-card p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-1 text-card">
                  <Icon icon="solar:home-bold" className="size-5" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-text">Proof of address</h3>
                  <p className="mt-1 text-sm leading-6 text-text/60">
                    A recent document that confirms your current residential address.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-border bg-card p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-1 text-card">
                  <Icon icon="solar:notes-bold" className="size-5" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-text">Personal and financial details</h3>
                  <p className="mt-1 text-sm leading-6 text-text/60">
                    Basic contact details, trading experience, income source, and suitability information.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text/50">Accepted formats</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {["JPG", "JPEG", "PNG", "PDF"].map((format) => (
                  <span
                    key={format}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-text/70"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VerificationLandingPage;
