export default function Home({ setPage }) {
  return (
    <section className="bg-gradient-to-r from-black to-gray-800 text-white text-center p-16">
      <h2 className="text-4xl font-bold mb-4">
        Custom PCs & PC Parts in Sri Lanka
      </h2>
      <p className="mb-6">
        Gaming PCs • Office PCs • Custom Builds
      </p>
      <button
        onClick={() => setPage("shop")}
        className="bg-white text-black px-6 py-3 rounded-xl font-bold"
      >
        Shop Now
      </button>
    </section>
  );
}
