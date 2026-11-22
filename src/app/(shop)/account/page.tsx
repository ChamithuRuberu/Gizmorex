'use client';
import { useState } from 'react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { User, Mail, Phone, MapPin, Shield, Package } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const [profile, setProfile] = useState({
    name: 'Kasun Perera',
    email: 'kasun@example.com',
    phone: '+94 77 123 4567',
    address: 'No 45, Galle Road, Colombo 03',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="container-custom py-6 max-w-4xl">
      <Breadcrumb items={[{ label: 'Account' }]} />
      <h1 className="text-2xl font-bold text-dark-300 mb-6">Account Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card text-center">
          <div className="w-20 h-20 rounded-full bg-orange-100 text-primary font-black text-2xl flex items-center justify-center mx-auto mb-3">
            KP
          </div>
          <h2 className="font-bold text-dark-300 text-lg">{profile.name}</h2>
          <p className="text-xs text-gray-500 mb-6">{profile.email}</p>

          <div className="space-y-2 text-left border-t border-gray-100 pt-4">
            <Link href="/orders" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary py-2 transition-colors">
              <Package className="w-4 h-4 text-primary" /> My Orders
            </Link>
            <Link href="/wishlist" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary py-2 transition-colors">
              <Shield className="w-4 h-4 text-primary" /> My Wishlist
            </Link>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
          <h3 className="font-bold text-dark-300 text-lg mb-4">Personal Details</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" /> Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" /> Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" /> Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" /> Delivery Address
              </label>
              <textarea
                rows={3}
                value={profile.address}
                onChange={e => setProfile({ ...profile, address: e.target.value })}
                className="input-field resize-none"
              />
            </div>

            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

