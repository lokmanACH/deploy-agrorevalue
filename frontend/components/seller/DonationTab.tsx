"use client";

import { useState } from "react";
import { Heart, Plus, Trash2, Mail, Phone, MapPin, Send } from "lucide-react";

interface Organization {
  id: number;
  name: string;
  type: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
}

interface DonationProduct {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

const mockOrganizations: Organization[] = [
  {
    id: 1,
    name: "Organisme National de Charité",
    type: "Organisation caritative",
    description: "Organisation d'aide aux pauvres et aux personnes dans le besoin",
    email: "info@national-charity.dz",
    phone: "+213 21 123 4567",
    address: "Alger",
    logo: "🤝"
  },
  {
    id: 2,
    name: "Association pour Nourrir les Affamés",
    type: "Organisation alimentaire",
    description: "Distribution alimentaire aux familles pauvres et aux familles dans le besoin",
    email: "donate@hunger-relief.dz",
    phone: "+213 21 987 6543",
    address: "Oran",
    logo: "🍽️"
  },
  {
    id: 3,
    name: "Organisation de la Santé et du Développement",
    type: "Organisation de santé",
    description: "Fourniture de services de santé et alimentaires aux zones rurales",
    email: "health@dev-org.dz",
    phone: "+213 25 555 8888",
    address: "Constantine",
    logo: "⚕️"
  },
  {
    id: 4,
    name: "Association d'Aide aux Orphelins",
    type: "Association sociale",
    description: "Soins et éducation des enfants orphelins et sans abri",
    email: "orphans@care.dz",
    phone: "+213 34 222 1111",
    address: "Tlemcen",
    logo: "👨‍👧‍👦"
  }
];

export function DonationTab() {
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [donationProducts, setDonationProducts] = useState<DonationProduct[]>([]);
  const [productName, setProductName] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [showOrgList, setShowOrgList] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleAddProduct = () => {
    if (productName.trim() && productQuantity.trim()) {
      setDonationProducts([
        ...donationProducts,
        {
          id: Date.now().toString(),
          name: productName,
          quantity: parseFloat(productQuantity),
          unit: "kg"
        }
      ]);
      setProductName("");
      setProductQuantity("");
    }
  };

  const handleRemoveProduct = (id: string) => {
    setDonationProducts(donationProducts.filter(p => p.id !== id));
  };

  const handleSelectOrganization = (org: Organization) => {
    setSelectedOrg(org);
    setShowOrgList(false);
    setDonationProducts([]);
    setContactMessage("");
  };

  const handleBackToList = () => {
    setSelectedOrg(null);
    setShowOrgList(true);
    setSubmitted(false);
  };

  const handleSubmitDonation = () => {
    if (donationProducts.length === 0) {
      alert("Veuillez ajouter des produits à donner");
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      handleBackToList();
    }, 2000);
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Programme de Donations Charitables
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Participez au soutien et à l'alimentation des organisations caritatives
            </p>
          </div>
        </div>
      </div>

      {/* Organization List View */}
      {showOrgList && (
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockOrganizations.map(org => (
              <button
                key={org.id}
                onClick={() => handleSelectOrganization(org)}
                className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{org.logo}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {org.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                      {org.type}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                      {org.description}
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{org.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        <Phone className="w-3 h-3" />
                        <span>{org.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        <MapPin className="w-3 h-3" />
                        <span>{org.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Donation Form View */}
      {selectedOrg && !showOrgList && (
        <div className="max-w-3xl mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={handleBackToList}
            className="mb-6 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium flex items-center gap-1"
          >
            ← Retour à la listeste
          </button>

          {/* Organization Header */}
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <div className="text-4xl">{selectedOrg.logo}</div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {selectedOrg.name}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  {selectedOrg.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    {selectedOrg.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                    {selectedOrg.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
                    {selectedOrg.address}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Products Section */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Ajoutez les produits à donner
            </h3>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Nom du produit
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  placeholder="Exemple: tomates, blé, lait..."
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Quantité (kg)
                </label>
                <input
                  type="number"
                  value={productQuantity}
                  onChange={e => setProductQuantity(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={handleAddProduct}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter un produit produit
              </button>
            </div>

            {/* Products List */}
            {donationProducts.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Produits ajoutés ({donationProducts.length})
                </div>
                {donationProducts.map(product => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        {product.name}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {product.quantity} {product.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Message Section */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Message supplémentaire (optionnel)
            </h3>

            <textarea
              value={contactMessage}
              onChange={e => setContactMessage(e.target.value)}
              placeholder="Écrivez un message à l'organisation pour clarifier vos intentions de don ou fournir des détails supplémentaires..."
              rows={4}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit Button */}
          {!submitted && (
            <button
              onClick={handleSubmitDonation}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors mb-4"
            >
              <Send className="w-5 h-5" />
              Envoyer le don à l'organisation
            </button>
          )}

          {submitted && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <p className="text-emerald-700 dark:text-emerald-400 font-medium text-center">
                ✓ Don envoyé avec succès ! L'organisation vous contactera bientôt.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!selectedOrg && !showOrgList && (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">Chargement...</p>
        </div>
      )}
    </div>
  );
}
