import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

interface Property {
  _id: string;
  name: string;
  summary: string;
  property_type: string;
  bedrooms: number;
  price: {
    $numberDecimal: string;
  } | string;
  address: {
    market: string;
  };
  review_scores: {
    review_scores_rating: number;
  };
}

interface BookingFormData {
  checkIn: string;
  checkOut: string;
  name: string;
  email: string;
  daytimePhone: string;
  mobilePhone: string;
  postalAddress: string;
  homeAddress: string;
}

export default function BookingPage() {
  const router = useRouter();
  const { listing_id } = router.query;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    checkIn: '',
    checkOut: '',
    name: '',
    email: '',
    daytimePhone: '',
    mobilePhone: '',
    postalAddress: '',
    homeAddress: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch property details when the component mounts or listing_id changes
  useEffect(() => {
    const fetchProperty = async () => {
      if (!listing_id) return;

      try {
        // set loading to true while fetching data
        setLoading(true);
        setError(null);
        console.log('Fetching property with ID:', listing_id);
        // fetch data for specific listing from backend
        const response = await axios.get(`http://localhost:3001/api/listings/${listing_id}`);
        console.log('Property fetch response:', response.data);
        // If the property is found, save property data,
        // otherwise set error message
        if (response.data.success) {
          setProperty(response.data.data);
        } else {
          console.error('Failed to fetch property:', response.data.error);
          setError(response.data.error || 'Failed to fetch property details');
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || 'Failed to fetch property details. Please try again later.');
        } else {
          setError('Failed to fetch property details. Please try again later.');
        }
      } finally {
        setLoading(false); // set loading to false after fetching data
      }
    };

    fetchProperty();
  }, [listing_id]);
// handle input change for the booking form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
// handle submit for the booking form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
// creates booking document in the database
    try {
      const response = await axios.post('http://localhost:3001/api/bookings', {
        listingID: listing_id,
        startDate: formData.checkIn,
        endDate: formData.checkOut,
        name: formData.name,
        email: formData.email,
        daytimePhone: formData.daytimePhone,
        mobilePhone: formData.mobilePhone,
        postalAddress: formData.postalAddress,
        homeAddress: formData.homeAddress
      });
// if successful, redirect to confirmation page, else set error message
      if (response.data.success) {
        router.push('/confirmation');
      } else {
        setError(response.data.error || 'Failed to create booking');
      }
    } catch (err) { 
      console.error('Error creating booking:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to create booking. Please try again later.');
      } else {
        setError('Failed to create booking. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };
// if loading is true, show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }
// if error, show error message
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <div className="mt-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Return to search
            </Link>
          </div>
        </div>
      </div>
    );
  }
// if property is not found, show error message 'property not found'
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">Property not found</p>
            <div className="mt-4">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                ← Return to search
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
// if property is found, show property details and booking form
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
            ← Return to search
          </Link>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Property Details */}
            <div className="p-6 border-b">
              <h1 className="text-3xl font-bold mb-4">{property.name}</h1>
              <div className="grid grid-cols-1 gap-8">
                <div>
                  <p className="text-gray-600 mb-4">{property.summary}</p>
                  <div className="space-y-2">
                    <p><span className="font-semibold">Location:</span> {property.address.market}</p>
                    <p><span className="font-semibold">Property Type:</span> {property.property_type}</p>
                    <p><span className="font-semibold">Bedrooms:</span> {property.bedrooms}</p>
                    <p>
                      <span className="font-semibold">Price:</span>{' '}
                      ${typeof property.price === 'object' && 'price' in property && '$numberDecimal' in property.price
                        ? parseFloat(property.price.$numberDecimal).toFixed(2)
                        : String(property.price)}{' '}
                      per night
                    </p>
                    {property.review_scores?.review_scores_rating && (
                      <p>
                        <span className="font-semibold">Rating:</span>{' '}
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                          ★ {property.review_scores.review_scores_rating}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Book Your Stay</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date *
                    </label>
                    <input
                      type="date"
                      id="checkIn"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date *
                    </label>
                    <input
                      type="date"
                      id="checkOut"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleInputChange}
                      required
                      min={formData.checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="daytimePhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Daytime Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="daytimePhone"
                      name="daytimePhone"
                      value={formData.daytimePhone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="mobilePhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="mobilePhone"
                      name="mobilePhone"
                      value={formData.mobilePhone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="postalAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Address *
                  </label>
                  <textarea
                    id="postalAddress"
                    name="postalAddress"
                    value={formData.postalAddress}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="homeAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Home Address *
                  </label>
                  <textarea
                    id="homeAddress"
                    name="homeAddress"
                    value={formData.homeAddress}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Processing...' : 'Book Now'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}