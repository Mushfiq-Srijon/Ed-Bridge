import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import CreateListingModal from '../components/Marketplace/CreateListingModal';

export default function ListingEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listingsAPI.getById(id)
      .then(setListing)
      .catch((requestError) => setError(requestError.message || 'Could not load this listing.'));
  }, [id]);

  const handleUpdate = async (data) => {
    await listingsAPI.update(id, {
      title: data.title,
      description: data.description,
      condition: data.condition,
      originalPrice: data.originalPrice,
      askingPrice: data.askingPrice,
      category: data.category,
      area: data.area,
      educationLevel: data.educationLevel,
      imageUrl: data.imageUrl,
      status: listing.status || 'Active',
    });
    navigate(`/marketplace/listing/${id}`);
  };

  if (error) {
    return <div className="listing-not-found"><h2>Unable to edit listing</h2><p>{error}</p></div>;
  }

  if (!listing) {
    return <div className="listing-loading">Loading listing...</div>;
  }

  return (
    <CreateListingModal
      onClose={() => navigate(`/marketplace/listing/${id}`)}
      onCreate={handleUpdate}
      initialListing={listing}
      isEditing
    />
  );
}
