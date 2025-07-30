'use client';

export default function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Discover Your Design?
        </h2>
        
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Get your personalized Human Design chart in minutes. All you need is 
          your birth date, time, and location to unlock your energetic blueprint.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={() => window.location.href = '/create-chart'}
            className="bg-white hover:bg-slate-100 text-blue-700 px-10 py-4 rounded-lg text-xl font-semibold transition-colors shadow-lg hover:shadow-xl inline-block"
          >
            Create Your Chart Now
          </button>
          
          <p className="text-blue-200 text-sm">
            Free • No registration required • Instant results
          </p>
        </div>
      </div>
    </section>
  );
}