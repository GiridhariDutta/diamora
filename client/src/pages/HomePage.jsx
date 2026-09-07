import React from 'react';
import { useOutletContext } from 'react-router-dom';
import HeroSectionUI from '../components/HeroSectionUI';
import BrandFeaturesBar from '../components/BrandFeaturesBar';
import RotatingArcShowcase from '../components/RotatingArcShowcase';
import CollectionShowcase from '../components/CollectionShowcase';
import CustomerReviewsSection from '../components/CustomerReviewsSection';
import OurServicesSection from '../components/OurServicesSection';

export default function HomePage() {
  const { onOpenShop, onOpenSignup } = useOutletContext() || {};

  return (
    <>
      {/* Hero Section */}
      <HeroSectionUI
        onOpenShop={onOpenShop}
        onOpenSignup={onOpenSignup}
      />

      {/* Brand Trust & Luxury Features Bar */}
      <BrandFeaturesBar />

      {/* Mejuri-Style Clockwise Rotating Product Arc Showcase */}
      <RotatingArcShowcase 
        onOpenShop={onOpenShop}
      />

      {/* Permanent Masterpiece Collection Showcase */}
      <CollectionShowcase 
        onOpenShop={onOpenShop} 
      />

      {/* What Our Customers Say - Review Section */}
      <CustomerReviewsSection />

      {/* Our Services Section */}
      <OurServicesSection />
    </>
  );
}
