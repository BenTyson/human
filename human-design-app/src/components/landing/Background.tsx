'use client';

export default function Background() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-6">
            What is Human Design?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Human Design is a revolutionary system that combines ancient wisdom 
            with modern science to reveal your unique energetic blueprint.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Energy Type</h3>
            <p className="text-slate-600">
              Discover whether you&apos;re a Generator, Manifestor, Projector, or Reflector, 
              and understand your unique way of engaging with the world.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧭</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Strategy</h3>
            <p className="text-slate-600">
              Learn your personal strategy for making decisions and taking action 
              that aligns with your authentic nature.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Authority</h3>
            <p className="text-slate-600">
              Understand your inner authority and how to make decisions 
              that are correct for your unique design.
            </p>
          </div>
        </div>
        
        <div className="mt-16 bg-slate-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center">
            A Personal Message
          </h3>
          <div className="bg-white rounded-lg p-6 italic text-slate-700 text-center">
            <p className="text-lg">
              &ldquo;[Placeholder for your personal message about Human Design and why this tool matters to you. 
              This is where you can share your passion for Human Design and how it has impacted your life.]&rdquo;
            </p>
            <p className="mt-4 font-semibold text-slate-600">- Your Name</p>
          </div>
        </div>
      </div>
    </section>
  );
}