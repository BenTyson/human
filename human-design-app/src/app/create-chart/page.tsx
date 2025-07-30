import InputForm from "@/components/forms/InputForm";

export default function CreateChart() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Create Your Human Design Chart
          </h1>
          <p className="text-xl text-slate-600">
            Enter your birth information to generate your personalized Human Design bodygraph.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <InputForm />
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Your information is private and secure. We do not store your personal data.
          </p>
        </div>
      </div>
    </main>
  );
}