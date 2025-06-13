import Link from 'next/link';
// Confirmation page after booking is created
export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-4">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your booking!
            </p>
            {/* link to go back to the search page */}
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Return to Search
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 