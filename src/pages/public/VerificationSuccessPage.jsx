import logo from "@/assets/logo.png";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import Icon from "@/components/ui/Icon";

function VerificationSuccessPage() {
  function handleBackToPortal() {
    window.location.href = "https://portal.eazymarkets.com";
  }

  function handleBackToWebsite() {
    window.location.href = "https://www.eazymarkets.com";
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-4 py-6 font-figtree text-text sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card px-5 py-8 text-center sm:px-8 sm:py-10">
        <Icon
          icon="solar:check-circle-bold"
          className="pointer-events-none absolute left-1/2 top-1/2 size-80 -translate-x-1/2 -translate-y-1/2 text-accent-2/15 sm:size-96"
        />

        <div className="relative z-10">
          <img src={logo} alt="EazyMarkets" className="mx-auto h-11 w-auto object-contain" />

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.28em] text-accent-2">Submitted</p>

          <Heading as="h1" className="mt-3 text-2xl leading-tight sm:text-3xl">
            Verification submitted successfully.
          </Heading>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-text/60">
            We’ll review your details and contact you if anything else is needed.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="primary"
              icon="solar:login-3-bold"
              onClick={handleBackToPortal}
              className="w-full"
            >
              Back to Portal
            </Button>

            <Button
              type="button"
              variant="secondary"
              icon="solar:global-bold"
              onClick={handleBackToWebsite}
              className="w-full"
            >
              Back to Website
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VerificationSuccessPage;
