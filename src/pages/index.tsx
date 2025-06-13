import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
// interface for the property data
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

interface FilterOptions {
  locations: string[];
  propertyTypes: string[];
  bedroomCounts: number[];
}

interface PaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    locations: [],
    propertyTypes: [],
    bedroomCounts: []
  });
  const [formData, setFormData] = useState({
    location: '',
    property_type: '',
    bedrooms: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1
  });

  useEffect(() => {
    // Fetch initial random properties and filter options
    fetchProperties();
    fetchFilterOptions();
  }, []);

  const fetchProperties = async (filters = formData, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      // get the query parameters from the form data
      const queryParams = new URLSearchParams();
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.property_type) queryParams.append('property_type', filters.property_type);
      if (filters.bedrooms) queryParams.append('bedrooms', filters.bedrooms);
      queryParams.append('page', page.toString());
      // fetch the properties from the server
      const response = await axios.get(`http://localhost:3001/api/listings?${queryParams.toString()}`);
      // if the properties are fetched successfully, set the properties and pagination
      if (response.data.success) {
        setProperties(response.data.data);
        setPagination({
          totalCount: response.data.totalCount,
          totalPages: response.data.totalPages,
          currentPage: response.data.currentPage
        });
      } else {
        setError('Failed to fetch properties');
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to fetch properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  // fetch the filter options from the server
  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/filter-options', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setFilterOptions(response.data.data);
      } else {
        console.error('Failed to fetch filter options:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties(formData, 1); // Reset to first page on new search
  };
  // handle the input change in the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  // handle the page change in the pagination
  const handlePageChange = (newPage: number) => {
    fetchProperties(formData, newPage);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Find your next stay</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter location"
              />
            </div>
            <div>
              <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select
                id="property_type"
                name="property_type"
                value={formData.property_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {filterOptions.propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <select
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any</option>
                {filterOptions.bedroomCounts.map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Bedroom' : 'Bedrooms'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Listings Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {formData.location ? 'Search Results' : 'Featured Properties'}
          </h2>
          {/* display the total number of properties found */}
          {!loading && properties.length > 0 && (
            <span className="text-gray-600">
              Found {pagination.totalCount} {pagination.totalCount === 1 ? 'property' : 'properties'}
            </span>
          )}
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {/* display the loading spinner if the properties are still loading */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : (
          <>
            {/* display the no properties found message if no properties are found */}
            {properties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No properties found matching your criteria.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    // display the property details when user clicks on a property
                    <div
                      key={property._id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">
                          {/* link to the booking page */}
                          <Link href={`/bookings?listing_id=${property._id}`} className="text-blue-600 hover:text-blue-800">
                            {property.name}
                          </Link>
                        </h3>
                        {/* display the property summary: name, location, type, bedrooms, price, rating */}
                        <p className="text-gray-600 mb-4 line-clamp-3">{property.summary}</p>
                        <div className="space-y-2">
                          <p><span className="font-semibold">Location:</span> {property.address.market}</p>
                          <p><span className="font-semibold">Type:</span> {property.property_type}</p>
                          <p><span className="font-semibold">Bedrooms:</span> {property.bedrooms}</p>
                          <p>
                            <span className="font-semibold">Price:</span>{' '}
                            ${typeof property.price === 'object' && 'price' in property && '$numberDecimal' in property.price
                              ? parseFloat(property.price.$numberDecimal).toFixed(2)
                              : String(property.price)}{' '}
                            per night
                          </p>
                          {/* display the rating if it exists */}
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
                  ))}
                </div>
                
                {/* Pagination */}
                {/* display the pagination buttons if there are more than 1 page */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}