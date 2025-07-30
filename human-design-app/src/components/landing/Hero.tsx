'use client';

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-6 leading-tight">
          Discover Your
          <span className="text-blue-600 block">Energetic Blueprint</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Unlock the secrets of your unique Human Design and understand 
          how you&apos;re designed to navigate life with authenticity and purpose.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => window.location.href = '/create-chart'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            See Your Unique Human Design
          </button>
          
          <button className="border-2 border-slate-300 hover:border-blue-600 text-slate-700 hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}