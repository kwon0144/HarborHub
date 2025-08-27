export default function Title({ 
  title, 
  description
}) {
  return (
    <div className="text-white" style={{ backgroundColor: "var(--hero-bg)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="hero-title text-5xl font-bold mb-4">
          {title}
        </div>
        <div className="max-w-2xl hero-description text-lg mb-2 mx-auto">
          {description}
        </div>
      </div>
    </div>
  );
}
