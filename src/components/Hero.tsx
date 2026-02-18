import { config } from "@/lib/config";

export default function Hero() {
  return (
    <section className="pt-8 pb-24 text-center sm:pt-12">
      <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
        {config.pageTitle}
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
        {config.pageSubtitle}
      </p>
    </section>
  );
}
