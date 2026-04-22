"use client";

import { useState } from "react";
import { Heart, ArrowLeft } from "lucide-react";
import { CharitableOrganizations } from "@/components/seller/CharitableOrganizations";
import { DonationForm } from "@/components/forms/DonationForm";
import { DonationContactModal } from "@/components/seller/DonationContactModal";

interface Organization {
  id: number;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  mission: string;
  image_url?: string;
}

export default function DonationsPage() {
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [contactOrganization, setContactOrganization] = useState<Organization | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectOrganization = (org: Organization) => {
    setSelectedOrganization(org);
    setShowForm(true);
  };

  const handleContactOrganization = (org: Organization) => {
    setContactOrganization(org);
    setShowContactForm(true);
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedOrganization(null);
  };

  const handleCloseContact = () => {
    setShowContactForm(false);
    setContactOrganization(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Heart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              Faire des dons
            </h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
            Aidez les organisations caritatives en donnant vos produits
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🤝</span>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Impacte</h3>
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Faites une différence en aidant les organisations humanitaires
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📦</span>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Facile</h3>
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Sélectionnez vos produits et spécifiez la quantité à donner
            </p>
          </div>

          <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">💬</span>
              <h3 className="font-semibold text-zinc-900 dark:text-white">Contact</h3>
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Communiquez directement avec l'organisation
            </p>
          </div>
        </div>

        {/* Organizations Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <Heart className="w-6 h-6 text-emerald-600" />
            Organisations caritatives partenaires
          </h2>

          <CharitableOrganizations
            key={refreshKey}
            onSelectOrganization={handleSelectOrganization}
            onContactOrganization={handleContactOrganization}
          />
        </div>
      </div>

      {/* Donation Form Modal */}
      {showForm && selectedOrganization && (
        <DonationForm
          organizationId={selectedOrganization.id}
          organizationName={selectedOrganization.name}
          organizationEmail={selectedOrganization.email}
          onSuccess={handleSuccess}
          onClose={handleClose}
        />
      )}

      {/* Contact Form Modal */}
      {showContactForm && contactOrganization && (
        <DonationContactModal
          organizationId={contactOrganization.id}
          organizationName={contactOrganization.name}
          organizationEmail={contactOrganization.email}
          organizationPhone={contactOrganization.phone}
          onClose={handleCloseContact}
        />
      )}
    </div>
  );
}
